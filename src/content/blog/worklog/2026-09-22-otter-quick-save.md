---
slug: 2026-09-22-otter-quick-save
title: "Quick save and smarter tags in Otter"
subtitle: "Saving to Otter is now one tap from the browser extension and the iOS share sheet, and auto-tagging no longer invents tags."
date: 2026-09-22
worklog: true
tags:
  - otter
---

Saving a bookmark in [Otter](https://otter.zander.wtf) used to mean opening the add form every time. The browser extension now has a menu with Quick save, Read later and Bookmark with details, and the right-click menu has the same three. Quick save sends only the URL, and the server scrapes the title, description, image and type itself. The iOS share sheet has the same Quick save button, so both give you the same bookmark. The extension also tells you when a page is already saved, and links to it.

Quick save showed me how bad the auto-tagging was. It matched a tag if the tag appeared anywhere inside a word, so "inside" pulled in "IDE", and one page came back with 23 tags, most of them wrong. Tags now have to match whole words. The AI classifier had its own problem. It got all 950 or so of my tags and answered with popular ones that had nothing to do with the page, so a video about mountain bike wheels was tagged "golf" and "gaming". Now it gets a shortlist of about 50, a JSON schema holds it to that list, and it uses the spelling that's already in the database, so "cli" and "CLI" don't turn into two tags.

The tag management page can also delete a tag now, not only rename it. The confirmation tells you how many bookmarks use it first.
