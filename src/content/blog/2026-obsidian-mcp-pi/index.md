---
slug: obsidian-mcp-pi
title: "Claude, meet my Obsidian vault"
subtitle: How I gave the Claude app on my phone read and write access to my Obsidian notes, using a Raspberry Pi, Obsidian Sync, a 100-line MCP server and Tailscale Funnel.
date: 2026-09-09
modified: 2026-09-12
tags:
  - obsidian
  - ai
  - mcp
  - raspberry-pi
  - self-hosting
---

> **Update, 12 September 2026:** a Reddit reader pointed out a prompt-injection loop in the first version: Claude reads the vault and writes to it, so a clipped web page can steer it. I've changed the server. The short version: the clippings folder is read-only for Claude and search returns no text from it, plus a filter for hidden text and a daily scan. Details in [the new section below](#update-prompt-injection-and-what-changed). The code snippets in this post are the original; the gist has the current version.

My notes live in [Obsidian](https://obsidian.md). For a while now I've been letting Claude and Codex loose on them: job application notes, meeting notes, the odd bit of research. That worked, but only through Claude Code in a terminal, on the laptop, with the vault folder open. Powerful, but not exactly "on the go". What I actually wanted was to open the Claude app on my phone on the train and say "add these interview notes to the Acme file", and have it just happen.

That now works. The pieces are a Raspberry Pi that already runs my home NAS, the official Obsidian Sync headless client, a tiny [MCP](https://modelcontextprotocol.io) server, and Tailscale Funnel to put a login page on the internet. Everything is in [a gist](https://gist.github.com/mrmartineau/475dc3e8ffc6908f1493a05989a116ff): the server, the Dockerfile, the compose services, an `.env` example and the full setup notes. This post is the how and the why.

**TL;DR**

- **obsidian-sync**: the official `obsidian-headless` client in a Docker container joins Obsidian Sync as one more device, so the Pi always has a live copy of the vault
- **obsidian-mcp**: a ~100-line Python server on [FastMCP](https://gofastmcp.com) with five tools: `list_notes`, `read_note`, `search_notes`, `write_note`, `append_note`
- **Read broad, write narrow** (added later): reads cover the whole vault, replacing a note only works in a few folders, appending works anywhere, and hidden text is stripped on read and refused on write
- **Login is GitHub OAuth**, and exactly one GitHub account is allowed past it
- **Tailscale Funnel** gives it a public HTTPS URL, which the Claude phone app needs because Anthropic's servers do the connecting, not the phone
- Add it once as a custom connector in Claude and it's on every surface: Mac app, claude.ai, phone, Claude Code

---

## Why not just point Claude Code at the vault?

I did, and I still do. But Claude Code needs a laptop, a terminal and the vault folder. The Claude app on my phone can't see a folder on my Mac. What it *can* see is a remote MCP server with a URL, as long as that URL is reachable from Anthropic's side and speaks OAuth.

I went round the houses before landing on that. Every time I asked Claude or Codex how to get at my notes from the phone, I got one of the same few answers, and I didn't like any of them:

- **Leave the laptop open.** Run something on the Mac and keep it awake so the phone can reach it. No. The laptop goes in a bag.
- **Use Claude Code's remote connection.** Start a session on the Mac, drive it from the Claude app. Same problem, plus I'm now steering a coding agent when all I want is to look something up in a note.
- **Ditch Obsidian Sync for Git.** Sync the vault as a repo, then let Claude Code in the Claude app clone it and edit it. This one actually works, but it swaps a sync I never think about for one I have to think about, and it still means talking to a coding agent about a note.
- **An AI plugin inside Obsidian.** There are plenty, and some are good. But they talk to the model through the API, so you pay per token on top of the subscription you already have. On a phone, chatting away about your notes, that adds up fast.

The thread running through the first three: they make the notes a coding task. I didn't want that. I wanted Obsidian Sync to keep doing what it already does, and I wanted to use Claude's *normal chat* to reference or update a note, the same way I'd ask it anything else. That rules out everything except a proper MCP connector. And a connector runs inside the Claude app, on the subscription I already pay for. There's no API key anywhere in this setup and no per-token bill at the end of the month.

So the job became: get a copy of the vault somewhere that's always on, put an MCP server in front of it, and make the login boring and safe. The Pi was already on, already running Docker, already on my [Tailscale](https://tailscale.com) network. It runs my NAS and a pile of other containers around the clock, so adding one more service was a few lines of compose and a `docker compose up`. Very little friction. Done deal.

## The vault copy: obsidian-sync

Obsidian ships a headless CLI, `ob`, and someone has kindly wrapped it in an arm64 Docker image ([belphemur/obsidian-headless-sync-docker](https://github.com/Belphemur/obsidian-headless-sync-docker)). Run `ob sync --continuous` in it and the Pi becomes another device on your Obsidian Sync account. Edits made on the Pi flow back to the laptop and phone; edits made anywhere else land on the Pi within seconds.

```yaml
obsidian-sync:
  image: ghcr.io/belphemur/obsidian-headless-sync-docker:latest
  container_name: obsidian-sync
  environment:
    OBSIDIAN_AUTH_TOKEN: ${OBSIDIAN_AUTH_TOKEN}
    VAULT_NAME: ${OBSIDIAN_VAULT_NAME}
    VAULT_PASSWORD: ${OBSIDIAN_VAULT_PASSWORD:-} # E2E password; empty if the vault isn't encrypted
    DEVICE_NAME: zm-pi # how the Pi shows up in Sync's version history
    CONFLICT_STRATEGY: merge # two writers (Claude here, you elsewhere): merge, don't fork
  volumes:
    - ./config/obsidian/vault:/vault
    - ./config/obsidian/sync:/home/obsidian/.config
  restart: unless-stopped
```

Two things I got wrong first time round, so you don't have to:

- **Keep the vault on the SD card, not on the NAS.** Mine is about 50 MB. inotify doesn't fire over NFS, so continuous sync silently misses edits made on the Pi. And Obsidian Sync already keeps version history, so there's nothing here that needs backing up anyway.
- **Create the bind-mount folders as your user before the first `docker compose up`.** Docker creates a missing bind directory as root, and then `ob login` can't write its config. I have a `make notes-token` target that does the `mkdir` and then runs the interactive `ob login` to get the auth token.

`CONFLICT_STRATEGY: merge` matters too. Claude is going to write to a note on the Pi at roughly the same time I might be editing it on the phone. Merge is Obsidian's default and it merges line by line rather than forking the file into a `conflict` copy.

## The MCP server: four tools and a trust boundary

This is the whole thing, minus the docstrings. It's [FastMCP](https://gofastmcp.com) over Streamable HTTP.

```python
from fastmcp import FastMCP
from fastmcp.exceptions import ToolError
from fastmcp.server.auth.providers.github import GitHubProvider
from fastmcp.server.dependencies import get_access_token

VAULT = Path(os.environ.get("VAULT_PATH", "/vault")).resolve()
ALLOWED_LOGIN = os.environ["ALLOWED_GITHUB_LOGIN"]

mcp = FastMCP(
    "obsidian",
    auth=GitHubProvider(
        client_id=os.environ["GITHUB_CLIENT_ID"],
        client_secret=os.environ["GITHUB_CLIENT_SECRET"],
        base_url=os.environ["BASE_URL"],
        jwt_signing_key=os.environ["JWT_SIGNING_KEY"],  # fixed key -> tokens survive restarts
        require_authorization_consent="remember",
    ),
)


def _path(rel: str = "") -> Path:
    """Trust boundary. Who is asking, and is the path really inside the vault?"""
    token = get_access_token()
    login = token.claims.get("login") if token else None
    if login != ALLOWED_LOGIN:
        raise ToolError(f"GitHub user {login!r} is not allowed to touch this vault")
    p = (VAULT / rel).resolve()  # resolve() follows symlinks, so a link pointing out is caught too
    if p != VAULT and VAULT not in p.parents:
        raise ToolError(f"path escapes the vault: {rel}")
    if any(part.startswith(".") for part in p.relative_to(VAULT).parts):
        raise ToolError(f"dot-folders/files are off limits: {rel}")
    return p


@mcp.tool
def read_note(path: str) -> str:
    """Read one note. `path` is vault-relative, e.g. "Work/Jobs/Acme.md"."""
    p = _path(path)
    if not p.is_file():
        raise ToolError(f"no such note: {path}")
    return p.read_text(encoding="utf-8")


@mcp.tool
def write_note(path: str, content: str) -> str:
    """Create or overwrite a note with `content`. Missing folders are created."""
    p = _path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    return p.relative_to(VAULT).as_posix()
```

`list_notes` and `search_notes` are the same shape: call `_path()` first, then walk `.md` files. Search is a full scan of every note on every call. With about 500 notes it's instant, so it stays that way until it isn't.

Every tool starts with `_path()`, and `_path()` does three things:

1. **Who is asking?** FastMCP has already done the GitHub OAuth dance and put the GitHub login in the token claims. If it isn't the one account in `ALLOWED_GITHUB_LOGIN`, the tool refuses. Anyone else who finds the URL can log in to GitHub, click Authorize, and then get "not allowed" on every single call.
2. **Is the path inside the vault?** `resolve()` follows symlinks, so a link that points outside is caught as well.
3. **Is it hiding in a dot-folder?** `.obsidian/` holds plugin state and workspace layout, not notes. Claude has no business in there, so it's invisible and unwritable.

I deliberately didn't build an "append" or "patch" tool. `write_note` replaces the whole file, and in practice Claude reads first and writes the merged result. Obsidian Sync's version history has every previous state if it ever gets that wrong.

> **Update:** that paragraph aged badly. There is now an `append_note` tool, `write_note` is refused in the clippings folder, and `search_notes` returns no text from there. Why is [below](#update-prompt-injection-and-what-changed).

The Dockerfile is `python:3.12-slim` plus `pip install fastmcp`. The one non-obvious bit: FastMCP keeps OAuth client registrations and tokens under `$FASTMCP_HOME`, and that has to be a named Docker volume owned by the same uid the container runs as, or every Claude logs in again after each rebuild.

```yaml
obsidian-mcp:
  build: ./obsidian-mcp
  container_name: obsidian-mcp
  user: "1000:1000" # write notes as `pi`, same owner obsidian-sync uses
  environment:
    BASE_URL: https://your-pi.your-tailnet.ts.net
    GITHUB_CLIENT_ID: ${MCP_GITHUB_CLIENT_ID}
    GITHUB_CLIENT_SECRET: ${MCP_GITHUB_CLIENT_SECRET}
    JWT_SIGNING_KEY: ${MCP_JWT_SIGNING_KEY} # openssl rand -hex 32
    ALLOWED_GITHUB_LOGIN: ${MCP_ALLOWED_GITHUB_LOGIN}
  volumes:
    - ./config/obsidian/vault:/vault
    - obsidian-mcp-config:/config # OAuth registrations + tokens (FASTMCP_HOME)
  ports:
    - 127.0.0.1:8100:8000
  restart: unless-stopped
```

Note the port binding: `127.0.0.1` only. Nothing on the LAN talks to this container directly.

## Getting it on the internet: Tailscale Funnel

Here's the bit that surprised me. Claude Code on the laptop only needs the server on my tailnet, and `tailscale serve` covers that. But the Claude **phone app** never talks to the Pi. Anthropic's servers do, on my behalf, and they aren't on my tailnet. So the MCP server needs a real public HTTPS URL.

[Tailscale Funnel](https://tailscale.com/kb/1223/funnel) is the least-effort way I know to do that. It terminates HTTPS with a real certificate at `https://your-pi.your-tailnet.ts.net` and forwards to the loopback port.

```sh
sudo tailscale funnel --bg --https=443 127.0.0.1:8100
```

You need MagicDNS and HTTPS certificates enabled in the Tailscale admin console first. The first run prints a link to enable Funnel on your tailnet and then *waits*, looking stuck. Open the link, click Allow, and it carries on by itself.

Check from a phone on 4G, not Wi-Fi:

```sh
curl https://your-pi.your-tailnet.ts.net/.well-known/oauth-authorization-server
```

JSON back means the world can reach the login page. That is all the world can reach.

Yes, my notes server has a public URL. What's behind it is an OAuth 2.1 login page, a GitHub consent screen, and a server that refuses every tool call from any account but mine. If I ever want it gone, `tailscale funnel off` takes it off the internet, changing `JWT_SIGNING_KEY` kicks every client out, and revoking the OAuth app on GitHub kills it dead.

## The GitHub OAuth app

One OAuth app on GitHub (Settings → Developer settings → OAuth Apps → New):

- Homepage URL: `https://your-pi.your-tailnet.ts.net`
- Authorization callback URL: `https://your-pi.your-tailnet.ts.net/auth/callback`

Client ID and secret go in `.env`. FastMCP's `GitHubProvider` is an OAuth *proxy*: it speaks the OAuth 2.1 plus Dynamic Client Registration flow that Claude expects on the front, and plain GitHub OAuth on the back. Claude never sees the GitHub app's credentials. That's why, when the connector dialog in Claude asks about an OAuth client, the answer is never "use your own".

## Connecting Claude

Connectors belong to your Claude account, not to a device. Add it once and it's everywhere.

**Mac app or claude.ai**: Settings → Connectors → Add custom connector. Name it, paste `https://your-pi.your-tailnet.ts.net/mcp`, set authentication to *Always required*, and for the OAuth client pick *Use Anthropic's hosted client metadata* (or *register one automatically* if that fails). Click Connect, log in to GitHub, click Allow on the consent page. Then in a chat, **+** → Connectors → switch it on. It's per chat.

**Phone**: nothing to install. Open a new chat, tap **+**, Connectors, switch it on. It's the same account, so the Mac connection already covers the login.

**Claude Code**:

```sh
claude mcp add --transport http --scope user obsidian https://your-pi.your-tailnet.ts.net/mcp
claude mcp login obsidian
```

And because it's plain Streamable HTTP with standard OAuth, Cursor, VS Code and the MCP Inspector all take the same URL.

## What it's like to use

I ask in plain words and Claude picks the tools. "What did I write about the Deco mesh?" is a `search_notes` then a `read_note`. "Add today's interview notes to Work/Jobs/Acme.md" is a `read_note` then a `write_note` (now a single `append_note`, see below). The edit lands on the Pi as user `pi`, obsidian-sync pushes it to Obsidian Sync within seconds, and it's on my laptop before I've put the phone down.

## Update: prompt injection, and what changed

I posted this to Reddit and a reader spotted something I'd walked straight past. Claude reads the vault to answer me. Claude also writes to the vault. That's a loop. My vault holds clipped web pages, pasted job ads and meeting transcripts, all of it third-party text. If any of that reads like an instruction, a later Claude turn can act on it, because a model can't fully tell my data from a command when both arrive in the same context. With `write_note` allowed everywhere, the worst case was a rewritten note in a folder I'd never think to check.

So the vault is not a trusted source, and the server now assumes that. I got there in two goes, and the first one was wrong in an instructive way.

**First attempt: read broad, write narrow.** Reading everywhere costs nothing, writing is where damage happens, so constrain the writes. `write_note` only worked inside an allowlist of folders (`Scratchpad,Work/Jobs,Daily`), and everything else was read-only. That capped the blast radius nicely. It also made the vault annoying to use. The whole point was "edit my notes from my phone", and now most of my notes were off limits, and every time I added a folder I'd have to remember to add it to a list on the Pi.

Then I noticed the guard was pointed at the wrong thing. The third-party text isn't spread evenly across the vault. It lives in one folder: `Clippings/`, where the Obsidian Web Clipper puts things. Job ads and meeting transcripts get pasted in by me, so I've at least looked at them. The clippings I often haven't read at all, which is exactly why I clipped them. So the rule became: **aim both guards at the folder where the untrusted text actually lives.**

What the server does now, in order of how much it matters:

1. **The clippings folder is read-only.** `UNTRUSTED_FOLDERS` is a comma-separated list in `.env`, default `Clippings`. `write_note` refuses to create or replace anything there. Everywhere else is writable. The backstops for a bad rewrite elsewhere are the permission prompt in the Claude app, which shows the path on every write, and Obsidian Sync's version history, which means a rewritten note is something I notice and undo, not something I lose.
2. **Search returns no text from those folders.** This one took me a while to see. `read_note` shows me the path before I approve it, so if Claude wants to read a clipping I know. `search_notes` doesn't work like that: it pulls matching lines from every note and I never see which notes fed the answer. It's the one path where note text reaches Claude with no human look at where it came from. So for hits in `Clippings/` the search now returns the path and line number only. I can still find a clipping. Reading it is a visible `read_note` call.
3. **Append anywhere.** A new `append_note` tool adds text to the end of any existing note. It can't lose what's there, so the worst case is a junk line. `CLAUDE.md` and `AGENTS.md` are the exception: neither tool will touch them, because a Claude Code session reads those as instructions. A line added there is a standing order, not junk.
4. **Hidden text is the main trick, so handle it at both edges.** Clipped pages carry zero-width, bidi-override and Unicode "tag" characters: text the model sees and you don't. The server strips them from everything Claude reads, and search runs on the cleaned line so a zero-width character inside a word can't dodge a query. On the write side it refuses them outright, along with chat-template markers like `<|im_start|>`. Claude never types those on purpose, so a refusal means a note just tried to copy itself through the MCP.
5. **A daily scan with no AI in it.** A cron job on the Pi runs a plain-Python script over the vault every night looking for the ways pages hide instructions: invisible Unicode, HTML comments, CSS-hidden text, chat markup, "ignore previous instructions" phrasing, long encoded blobs. No LLM in the loop, because a checker that reads the notes can be tricked by the same text it's looking for. The report lists note, line and label only, never the matching text, so it can't carry a payload into a chat when `search_notes` reads it.

The folder check is two more lines in `_path()`, and the search change is a conditional on the hit:

```python
# Folders holding third-party text (web clippings). Not writable, and search returns no text from them.
UNTRUSTED = [f.strip().strip("/") for f in os.environ.get("UNTRUSTED_FOLDERS", "Clippings").split(",") if f.strip()]


def _untrusted(inside: str) -> bool:
    return any(inside == f or inside.startswith(f + "/") for f in UNTRUSTED)


def _path(rel: str = "", write: bool = False) -> Path:
    # ...the login, escape and dot-folder checks from before...
    inside = p.relative_to(VAULT).as_posix()
    if write and _untrusted(inside):
        raise ToolError(f"not writable: {rel}. Untrusted folders ({', '.join(UNTRUSTED)}) are read-only")
    if write and p.name.upper() in ("CLAUDE.MD", "AGENTS.MD"):
        raise ToolError(f"not writable: {rel}. Instruction files are edited by hand, not by Claude")
    return p


# inside search_notes, for each matching line:
hit = {"path": rel, "line": n}
if not _untrusted(rel):
    hit["text"] = line.strip()[:200]
hits.append(hit)
```

And the two edges for hidden text:

```python
# Zero-width, invisible, bidi-override and Unicode "tag" characters.
HIDDEN = re.compile("[\u200b\u200c\u2060-\u2064\u206a-\u206f\u202a-\u202e\u2066-\u2069\ufeff\U000e0000-\U000e007f]")
CHAT_MARKUP = re.compile(r"<\|im_(start|end)\|>|\[/?INST\]|<<SYS>>|<\|(system|user|assistant)\|>", re.I)


def _clean(text: str) -> str:
    # What Claude reads: hidden characters removed.
    return HIDDEN.sub("", text)


def _check_write(content: str) -> None:
    # What Claude writes: refuse the two things it never types on purpose.
    if HIDDEN.search(content):
        raise ToolError("refused: content has invisible characters")
    if CHAT_MARKUP.search(content):
        raise ToolError("refused: content has LLM chat-template markers")
```

Now the honest limit. None of this can tell a *visible* instruction inside a note from my own instruction. Nothing can, from inside one context. If a clipped page says, in plain text, "append this line to every note", and Claude reads it while I'm asking about something else, the model might try. What covers that gap is the permission prompt in the Claude app, which shows the path on every write, and the nightly scan, which flags notes that read like orders. I approve writes one at a time and I read the path. "Always allow" on a write tool removes the last human check, so I don't.

It also doesn't protect other paths into the same vault, and this is the bit worth being honest about. The way I use my notes with AI most of the time is not this MCP at all. It's Claude Code in a terminal with the vault folder open, and I've done that for months. That path is worse on every count. It reads the vault with plain file tools and searches it with grep, so the same clipped page goes into context. There's no folder rule and no character filter. Its write tools reach every note, and its Bash tool reaches the rest of my laptop. And like a lot of people I run it with permission prompts mostly off, because tapping "yes" forty times an hour is how you stop reading what you're tapping yes to. The MCP has none of that. Five tools, a vault-shaped box, one login, and the Claude app asks before every write and shows the path. So the phone setup, the one that looked like the risky new thing, is now the *safest* way I have of letting a model near my notes. The Remote Control session on the Pi is Claude Code again, so I've switched it from `acceptEdits` to `default`: every edit asks for a tap, because the tap is the only guard it has. And Dataview JS or Templater would turn a written note into code that runs inside Obsidian. Both are off in my vault and they're staying off.

Thanks to the reader who raised it. The full table of what's guarded, where it sits in the code and why, is in the gist README. The lesson I'm keeping: the first fix constrained the thing that was easy to constrain. The second one constrained the thing that was actually untrusted.

---

The whole thing is one Python file, one Dockerfile, two compose services and a GitHub OAuth app. If you have Obsidian Sync and something at home that's always on, a media centre, a home server, a Raspberry Pi in a cupboard, this will work for you too. [The gist](https://gist.github.com/mrmartineau/475dc3e8ffc6908f1493a05989a116ff) has the full README with the step-by-step and a troubleshooting table for every way I broke it while setting it up.
