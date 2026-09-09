---
slug: obsidian-mcp-pi
title: "Claude, meet my Obsidian vault"
subtitle: How I gave the Claude app on my phone read and write access to my Obsidian notes, using a Raspberry Pi, Obsidian Sync, a 100-line MCP server and Tailscale Funnel.
date: 2026-09-09
tags:
  - obsidian
  - ai
  - mcp
  - raspberry-pi
  - self-hosting
---

My notes live in [Obsidian](https://obsidian.md). For a while now I've been letting Claude and Codex loose on them: job application notes, meeting notes, the odd bit of research. That worked, but only through Claude Code in a terminal, on the laptop, with the vault folder open. Powerful, but not exactly "on the go". What I actually wanted was to open the Claude app on my phone on the train and say "add these interview notes to the Acme file", and have it just happen.

That now works. The pieces are a Raspberry Pi that already runs my home NAS, the official Obsidian Sync headless client, a tiny [MCP](https://modelcontextprotocol.io) server, and Tailscale Funnel to put a login page on the internet. Everything is in [a gist](https://gist.github.com/mrmartineau/475dc3e8ffc6908f1493a05989a116ff): the server, the Dockerfile, the compose services, an `.env` example and the full setup notes. This post is the how and the why.

**TL;DR**

- **obsidian-sync**: the official `obsidian-headless` client in a Docker container joins Obsidian Sync as one more device, so the Pi always has a live copy of the vault
- **obsidian-mcp**: a ~100-line Python server on [FastMCP](https://gofastmcp.com) with four tools: `list_notes`, `read_note`, `write_note`, `search_notes`
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

I ask in plain words and Claude picks the tools. "What did I write about the Deco mesh?" is a `search_notes` then a `read_note`. "Add today's interview notes to Work/Jobs/Acme.md" is a `read_note` then a `write_note`. The edit lands on the Pi as user `pi`, obsidian-sync pushes it to Obsidian Sync within seconds, and it's on my laptop before I've put the phone down.

The whole thing is one Python file, one Dockerfile, two compose services and a GitHub OAuth app. If you have Obsidian Sync and something at home that's always on, a media centre, a home server, a Raspberry Pi in a cupboard, this will work for you too. [The gist](https://gist.github.com/mrmartineau/475dc3e8ffc6908f1493a05989a116ff) has the full README with the step-by-step and a troubleshooting table for every way I broke it while setting it up.
