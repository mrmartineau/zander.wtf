---
slug: pr-elsewhere
title: PR Elsewhere
subtitle: A Chrome extension that adds a "View in" menu to GitHub pull requests, so you can open the same PR in another review tool.
date: 2026-11-01
type: chrome-extension
status: active
repo: 'https://github.com/mrmartineau/pr-elsewhere'
link: 'https://chromewebstore.google.com/detail/pr-elsewhere/hmimlnfnlppakencgbbipplgnaadjjjp'
tech: JavaScript, Chrome extension
tags:
  - chrome
  - extension
---

I wanted a quick way to jump from a GitHub pull request to the other places I read PRs. This extension adds a "View in" menu next to the tabs on a PR page. It also runs in Firefox if you load it as a temporary add-on.

- Opens the same PR in Diffshub, pulls.review or Graphite
- Press `e` on a PR page to open the menu, then the number next to a provider to go there
- I picked `e` because GitHub and Refined GitHub already use most other single keys

![](/images/projects/pr-elsewhere/pr-elsewhere.png)