---
slug: green-claws
title: Green Claws
subtitle: A plant diary that turns photographs of what you already own into an almanac that changes as the year does.
date: 2026-08-12
type: ios-app
status: active
link: 'https://greenclaws.app'
# The short, country-less form 404s while the app is UK + Ireland only: Apple
# sends it to /us/, which has no page. Switch it when the US store opens.
appStore: https://apps.apple.com/gb/app/green-claws-plant-diary/id6803198490
pricing: Five plants free. £19.99 a year for unlimited, or £49 for lifetime access.
image: '/images/projects/green-claws/icon.webp'
screenshots:
  - src: '/images/projects/green-claws/01-garden.webp'
    alt: The garden view listing every plant in the collection
  - src: '/images/projects/green-claws/02-in-flower.webp'
    alt: What is in flower this month
  - src: '/images/projects/green-claws/03-plant.webp'
    alt: A single plant page with light, hardiness and size
  - src: '/images/projects/green-claws/04-care.webp'
    alt: This month's care jobs for the plants owned
  - src: '/images/projects/green-claws/05-watering.webp'
    alt: Watering guidance based on recent local rainfall
  - src: '/images/projects/green-claws/06-review.webp'
    alt: Confirming an identification against reference photographs
tech: Swift, SwiftUI, Core Location, StoreKit
tags:
  - ios
  - swiftui
  - gardening
promote: true
---

Most plant apps are identifiers. You point your phone at a plant, it gives you a name, and that's the end of it.

Green Claws works the other way round. Identifying your plants is only the first step. What you get back is an almanac of the plants you own, and it changes as the year does. Six houseplants on a windowsill counts as a collection, and so does an allotment.

- What's in flower this month, and what's about to be
- This month's jobs, filtered to your plants. It works out from the photo whether something lives indoors or outside, so a job written for a border is never offered for a windowsill
- Watering that follows the rainfall where you are rather than a fixed schedule
- A page per plant: light, shelter, hardiness, eventual size, and whether it's toxic to pets or children
- Publish your garden as a website, so you can share it with other people
- Two home screen widgets, so this month's jobs are there without opening anything

Identification runs in the background, and the app never files a plant under a name you didn't agree to. There are no daily reminders and no streaks. Most garden jobs come round once a month or once a year, so there's no reason for the app to nag you every morning.

The app rounds your location to about 10km before it leaves the phone. If you decline it, the only thing you lose is the rainfall.

I wrote about how it started, as a markdown table of our own garden, in [the launch post](/blog/green-claws).
