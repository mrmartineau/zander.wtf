---
slug: 2026-09-08-shotframe
title: shotframe
subtitle: 'A small CLI that turns raw simulator captures into App Store screenshots: a device frame, a heading and a line of copy, at exactly the size the store wants.'
date: 2026-08-22
worklog: true
tags:
  - ios
  - tooling
  - side-project
---

Released [shotframe](https://github.com/mrmartineau/shotframe), a little CLI for the job I'd been doing by hand for every iPhone app: turning raw simulator captures into App Store screenshots. You shoot the screens in the simulator, drop the PNGs in a `sources/` folder, name them in a config with the copy you want above each, and run `shotframe`. Out comes the set in `fastlane/screenshots/`, ready for `deliver`.

Each panel is a tiny HTML page — a flexbox column, a gradient from the app's own palette, an `<img>` — and headless Chrome takes the picture. The page is laid out in CSS points and rendered at the device's scale factor, so `iphone-6.9` is authored at 440×956 and comes out at 1320×2868, which is what App Store Connect asks for. The capture is placed at its natural size and never resampled: the pixels the simulator produced are the pixels that ship. No dependencies either, it uses whatever Chromium you already have.

The bit I actually wanted is the two things it refuses to do. Heading and body each get two lines of space whether they use them or not, so the phone sits at the same height in every panel and the set doesn't jump as someone swipes through it. And copy that needs a third line fails the build instead of quietly pushing the phone out of the frame, which is exactly the kind of damage you don't spot at thumbnail size. Wire it into CI and a listing edit that no longer fits gets caught before it reaches the store. Every one of [my iPhone apps](/projects) gets its screenshots this way from now on.
