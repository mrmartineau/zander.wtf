---
title: agent-skills
date: 2026-06-04
---

Set up [agent-skills](https://github.com/mrmartineau/agent-skills) to manage the various AI agent skills I use, shared across Claude Code, Amp and Codex.

My own skills live in the repo as the source of truth. Third-party skills aren't vendored — they're pinned in a `skills-lock.json` by source repo and re-fetched with the [`skills`](https://skills.sh) CLI, like a package lockfile. An `install.sh` restores everything and symlinks each skill into the right place for every agent, so a new machine is one clone and one command away from my full setup.
