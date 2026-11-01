---
slug: 2026-11-01-pr-elsewhere
title: "PR Elsewhere"
subtitle: "PR Elsewhere is a Chrome extension that adds a View in menu to GitHub pull requests, and it's now on the Chrome Web Store."
date: 2026-11-01
worklog: true
tags:
  - chrome
  - extension
  - github
---

I wanted an easy way to jump from a GitHub pull request to the other tools I view PRs in, so I made [PR Elsewhere](/projects/pr-elsewhere). It adds a "View in" menu next to the tabs on a PR page, and picking a provider opens the same PR there. For now the providers are Diffshub, pulls.review and Graphite.

It has a keyboard shortcut too. Press `e` on a PR page to open the menu, then press the number next to a provider. I picked `e` because GitHub and Refined GitHub already use most other single keys, and `v` opens the review dialog.

It's on the [Chrome Web Store](https://chromewebstore.google.com/detail/pr-elsewhere/hmimlnfnlppakencgbbipplgnaadjjjp) and the source is [on GitHub](https://github.com/mrmartineau/pr-elsewhere). It also runs in Firefox, but only as a temporary add-on.
