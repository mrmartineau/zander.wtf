---
slug: 2026-08-12-zed-ios-app-starter
title: zed-ios-app-starter
subtitle: 'A SwiftUI and SwiftData starter for native iOS apps: tabs, onboarding, preferences and theming, with no third-party dependencies.'
date: 2026-08-12
worklog: true
tags:
  - ios
  - swiftui
  - template
---

Put together [zed-ios-app-starter](https://github.com/mrmartineau/zed-ios-app-starter), a template for native iOS apps and the fourth member of [the Zed Stack](/zed-stack). It's SwiftUI and SwiftData targeting iOS 18+, and, unusually for me, it has no third-party dependencies at all.

It ships the shell I'd otherwise rebuild every single time: a tab layout with a `NavigationStack` per tab, one SwiftData `@Model` wired all the way through list, detail, edit and delete, an `@Observable` preferences object over `UserDefaults` (because `@AppStorage` only works inside a `View`, which means anything a model needs ends up threaded through the view tree), a first-launch onboarding walkthrough you can replay from Settings, an animated splash over a matching launch-screen colour so there's no white flash, a theme with spacing and radius scales, and Reduce Motion and VoiceOver handling. StoreKit 2 in-app purchases and a streaming Claude API chat client are both in there but switched off by default. Turn one on or delete its folder.

The bit I'm most pleased with is that adding files needs no project-file edits. The target uses an Xcode file-system synchronized group, so anything dropped into the source directory gets compiled automatically, new folders included. The only things needing a `project.pbxproj` change are files that must be *excluded*.

There's a `scaffold.sh` that copies the template to a new directory and renames everything (target, scheme, `@main` struct, bundle id, StoreKit product ids) because `AppStarter` becomes `struct AppStarterApp` and a hyphenated repo name simply won't compile. [Zero](/blog/zero-project-factory), my project factory, now does the same substitutions in CI, so `type: ios` is one more option on the form.
