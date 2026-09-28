---
title: QMD
link: https://github.com/tobi/qmd
tags:
  - cli
  - ai
emoji: 🔎
date: 2026-09-28
---

QMD is a local search engine for markdown files. It combines keyword search (BM25), vector search (search by meaning) and LLM re-ranking, and it all runs on your machine. It also has an MCP server, so AI agents can search your notes too.

I use it to make my Obsidian vault and these code notes searchable from any agent, in any project.

## Install

```sh
npm install -g @tobilu/qmd
# or
bun install -g @tobilu/qmd
```

## Add folders

Each folder you index is a **collection**.

```sh
qmd collection add ~/Documents/Obsidian --name obsidian
qmd collection add ~/code/my-site/src/content/notes --name codenotes

# only some files
qmd collection add ~/Documents/notes --name notes --mask "**/*.md"

qmd embed # build the vector index
```

Add a short description to each collection. It helps search, and it tells agents what they're looking at:

```sh
qmd context add qmd://codenotes "Short dev notes and snippets: JS, TS, React, CSS, tools"
```

Other collection commands: `qmd collection list`, `show`, `rename`, `remove`, and `qmd ls codenotes` to see the files.

## Search

```sh
qmd search "abort controller"          # keywords only, fast, no model
qmd vsearch "cancel a fetch request"   # by meaning only
qmd query "how do I cancel a fetch?"   # both, plus re-ranking (best, slower)

qmd query "debounce" -c codenotes      # one collection
qmd query "debounce" -n 10 --full      # 10 results, full documents
```

A `query` can also be a typed "query document", one search per line:

```sh
qmd query $'lex: "useInfiniteQuery" -graphql\nvec: infinite scroll with react query'
```

- `lex:` keyword search. `"exact phrase"` and `-exclude` work.
- `vec:` a question in plain words.
- `hyde:` a short made-up answer. The results that look most like it win. Good for vague topics.

Read a result with `qmd get <file>` or `qmd get "#docid"`.

## Use it from agents

For Claude Code, install the plugin. It adds the MCP server and a skill:

```sh
claude plugin marketplace add tobi/qmd
claude plugin install qmd@qmd
```

For other agents, run `qmd mcp` as a stdio MCP server, or install the skill with `qmd skill install --global`.

## Keep the index up to date

QMD does **not** watch your files. After notes change, you need two steps:

```sh
qmd update && qmd embed
```

- `qmd update` finds new, changed and deleted files. Keyword search is current after this.
- `qmd embed` makes vectors for the changed files only, so it's quick after the first run.

`qmd status` shows how many files still need embedding.

### Run it every day with launchd (macOS)

Save as `~/Library/LaunchAgents/com.USERNAME.qmd-refresh.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.USERNAME.qmd-refresh</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>-c</string>
    <string>date; qmd update &amp;&amp; qmd embed</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/path/to/node/bin:/usr/bin:/bin</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>LowPriorityIO</key>
  <true/>
  <key>Nice</key>
  <integer>10</integer>
  <key>StandardOutPath</key>
  <string>/Users/USERNAME/Library/Logs/qmd-refresh.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/USERNAME/Library/Logs/qmd-refresh.log</string>
</dict>
</plist>
```

- **`PATH` must point to the Node that QMD was installed with.** launchd doesn't load your shell profile, and QMD has native modules built for that exact Node version. Find it with `readlink -f "$(command -v qmd)"`: the path goes through `…/node/<version>/lib/node_modules`, and the `bin` folder next to `lib` is the one you want.
- If the Mac is asleep at 09:00, the job runs when it wakes.

Load it, and run it once to test:

```sh
plutil -lint ~/Library/LaunchAgents/com.USERNAME.qmd-refresh.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.USERNAME.qmd-refresh.plist
launchctl kickstart gui/$(id -u)/com.USERNAME.qmd-refresh
tail -f ~/Library/Logs/qmd-refresh.log
```

Check the last run with `launchctl print gui/$(id -u)/com.USERNAME.qmd-refresh | grep "last exit code"`.

Remove it:

```sh
launchctl bootout gui/$(id -u)/com.USERNAME.qmd-refresh
rm ~/Library/LaunchAgents/com.USERNAME.qmd-refresh.plist
```

If you upgrade Node, update the `PATH` in the plist, or the job fails. The log shows the error.

## Other useful commands

```sh
qmd status        # collections, file counts, files waiting for vectors
qmd cleanup       # clear caches, shrink the database
qmd embed -f      # rebuild every vector (e.g. after changing the model)
```

The index lives in `~/.cache/qmd/index.sqlite`.
