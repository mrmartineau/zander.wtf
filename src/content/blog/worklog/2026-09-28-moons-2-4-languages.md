---
slug: 2026-09-28-moons-2-4-languages
title: "Moons speaks six languages"
subtitle: "Moons 2.4 is out in French, German, Spanish, Portuguese and Japanese as well as English, with a feedback link for when a translation reads wrong."
date: 2026-09-28
worklog: true
tags:
  - ios
  - moons
---

[Moons](/moons) 2.4 is on the App Store, and it now speaks French, German, Spanish, Portuguese and Japanese as well as English. It follows your iPhone's language, or you can pick a language for Moons alone in the Settings app.

Most of the work was finding the text. Countdowns, notifications, undo messages, store errors, the walkthrough and the widget's counts were all plain Swift strings that no string catalog ever saw. They now go through `String(localized:)`, so the compiler finds them, and anything with a number in it uses the catalog's plural rules. One catalog covers both the app and the widget, and the App Store listing is in the same five languages.

I don't speak most of these, so there's a new Send feedback link in Settings, under the version number. If a translation reads wrong, it comes straight to me. I also learned that App Review refuses anything built with a beta Xcode. Build 11 went nowhere, and build 12 is the same app archived with the released version.
