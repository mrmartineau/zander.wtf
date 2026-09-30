---
slug: 2026-09-16-otter-reader
title: "Otter Reader"
subtitle: "The native Otter iOS app is now Otter Reader, a read-later list that works offline, with RSS feeds that run on the phone and need no account."
date: 2026-09-16
worklog: true
tags:
  - ios
  - otter
---

The [native Otter app](/blog/2026-08-02-otter-native-ios-app) is now Otter Reader. The tabs are Read later, Feeds, Library and Settings, so reading comes first and the bookmark library comes after it.

Read later uses a new reader API in [Otter](https://otter.zander.wtf). A reading item is an article bookmark plus its text as markdown, a word count and how far through it you are. The app syncs the list, keeps it for offline reading, and replays anything you changed while you had no signal. After each sync it downloads the text of the 20 newest unread articles, so there's always something to read. The reader has font and text size settings, and it lifts images out of paragraphs so they show at full width.

Feeds run on the phone and don't need an Otter account at all. Hacker News, Lobsters, Techmeme and Pinboard popular are built in. Any RSS, Atom or JSON feed works too, with folders and OPML import and export. You only sign in the first time you save something.
