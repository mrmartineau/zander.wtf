---
slug: shotframe
title: shotframe
subtitle: A CLI that turns raw simulator captures into App Store screenshots. A device frame, a heading and a line of copy, at exactly the size the store wants.
date: 2026-08-22
repo: 'https://github.com/mrmartineau/shotframe'
link: 'https://npmx.dev/package/@mrmartineau/shotframe'
showReadme: true
status: active
tech: TypeScript, Node.js, headless Chrome
tags:
  - ios
  - app-store
  - fastlane
  - cli
  - tooling
  - npm
screenshots:
  - src: '/images/projects/time-tutor/01-face.webp'
    alt: Time Tutor
  - src: '/images/projects/code-buddy/01-write.webp'
    alt: Code Buddy
  - src: '/images/projects/green-claws/01-garden.webp'
    alt: Green Claws
  - src: '/images/projects/moons/01-orbit.webp'
    alt: Moons
type: package
---

I built this to standardise the App Store screenshots for [my iPhone apps](/projects). Shoot the screens in the simulator, drop the PNGs in a `sources/` folder, name them in a config with the copy you want above each, and run `shotframe`. Out comes the set in `fastlane/screenshots/`, ready for `deliver`.

- Renders each panel from a small HTML page with headless Chrome, at the device's scale factor
- Your capture is placed at its natural size and never resampled
- Heading and body get a fixed two lines, so the phone sits at the same height in every panel
- Copy that needs a third line fails the build instead of pushing the phone out of frame
- Background gradient taken from your app's own palette
- One JSON config with a `$schema`, so you get completion in your editor. It's plain enough that Claude can update and manage it for you
- No dependencies. It uses whatever Chromium you already have

```sh
pnpm add -D @mrmartineau/shotframe
shotframe init   # a config, and a sources/ folder to shoot into
shotframe        # build the set
```
