---
slug: 2026-08-02-otter-native-ios-app
title: A native iOS app for Otter
subtitle: "A native SwiftUI app for Otter with no web views anywhere, disk-cached bookmarks, and saving from the share sheet, deep links or Shortcuts."
date: 2026-07-29
worklog: true
---

[Otter](https://otter.zander.wtf) now has a proper [native iOS app](https://github.com/mrmartineau/Otter/tree/main/packages/app), written in SwiftUI. No web views anywhere: browsing bookmarks and saving new ones both go through Otter's REST API directly, with the first page of bookmarks cached to disk so the list renders instantly at launch and refreshes in the background. The difference in performance over loading the web app is enormous.

Sign-in is OAuth 2.1 with PKCE, using RFC 7591 dynamic client registration. You type your instance address and that's it, no client ID to configure. Tokens live in a keychain group shared with the extensions.

Saving works from wherever you happen to be: the system share sheet, the `+` button, an `otter://save?url=…` deep link, or a "Save Bookmark" Shortcuts action. The Xcode project also ships a Safari web extension for saving the current page, on both iOS and macOS.
