---
slug: green-claws
title: "Green Claws: from a markdown table to an iOS app"
subtitle: How a plant list I made because I'm a bad gardener turned into Flora, a microsite anyone can generate, and then into Green Claws, an iOS gardening app for the UK.
date: 2026-09-08
draft: true
tags:
  - ios
  - swiftui
  - astro
  - ai
  - side-project
---

<!-- DRAFT. Hold until Green Claws is on the App Store. TODO before publishing: fix the date, and put the App Store URL into the badge link at the end. -->

I'm not a good gardener. We have a lot of plants, in the house and out of it, and I can't tell you the name of most of them. I don't know how to prune them, when they want water or how much, or which ones need lifting before the first frost. Someone in this house knows all that in July and nobody knows it in October.

So I did what I do with everything I can't remember. I wrote it down.

## A table

It started with my phone. I walked round the garden taking a photo of every plant, uploaded each one to ChatGPT to identify it, and pasted the care information into a markdown file. One table. Name, light, water, when it flowers, what to do in winter. Nothing clever, but it was the first time all of that lived in one place.

The table got long and unreadable, so I turned it into a site.

## Flora

[Flora](/projects/flora) is that table as an Astro site, at [flora.zander.wtf](https://flora.zander.wtf). Every plant is a markdown file and the frontmatter drives the whole thing. There's a page per plant with light, water, hardiness and a strip showing which months it's in flower. There's a view of what's in flower this month, a dry-spell page for what to water first, and a winter page grouped by job. Reference data comes from the [RHS](https://www.rhs.org.uk), and the care notes are how we actually look after the thing here.

The bit I'm most pleased with isn't the site, it's the two agent skills that ship with it.

[`add-plant`](https://github.com/mrmartineau/flora.zander.wtf/tree/main/.claude/skills/add-plant) takes a photo or a name and does the whole job. It identifies the plant with an honest confidence rating, finds a reference URL, writes the frontmatter and the body, and reindexes search. Adding a plant is a sentence rather than an afternoon.

[`make-your-own-flora`](https://github.com/mrmartineau/flora.zander.wtf/tree/main/.claude/skills/make-your-own-flora) turns a fork into somebody else's site. Give it some photos and it does the detection, creates the Astro project, points it at your Cloudflare account, deploys it and sets everything up. So anyone can have their own Flora for their own garden without touching a config file. There's a [make your own](https://flora.zander.wtf/make-your-own) page on the site that walks through it: fork it, point a coding agent at it, deploy it. If you'd rather have a website than an app, Flora is still there and the skills will build you one.

That second skill was the moment the project changed. Once other people could generate their own site, the obvious next question was why they'd need a site at all. They have a phone.

## Green Claws

[Green Claws](/projects/green-claws) is the same idea as Flora, taken a lot further, as an iOS app. It's at [greenclaws.app](https://greenclaws.app).

Most plant apps are identifiers. You point your phone at a plant, it gives you a name, and that's the end of it. Green Claws treats identification as the setup. What you get back is an almanac of the plants you actually own, and it changes as the year does:

- What's in flower this month, and what's about to be
- This month's jobs, filtered to your plants. It works out from the photo whether something lives indoors or outside, so a job written for a border is never offered for a windowsill
- Watering that follows the rainfall where you are rather than a fixed schedule
- A page per plant: light, shelter, hardiness, eventual size, and whether it's toxic to pets or children
- Publish your garden as a website, so you can share it with other people

<div class="grid grid-cols-2 gap-7">
  <figure>
    <figcaption>The garden: every plant in the collection.</figcaption>
    <img src="/images/projects/green-claws/01-garden.webp" alt="The garden view listing every plant in the collection" />
  </figure>
  <figure>
    <figcaption>What's in flower this month.</figcaption>
    <img src="/images/projects/green-claws/02-in-flower.webp" alt="What is in flower this month" />
  </figure>
  <figure>
    <figcaption>A single plant: light, hardiness and size.</figcaption>
    <img src="/images/projects/green-claws/03-plant.webp" alt="A single plant page with light, hardiness and size" />
  </figure>
  <figure>
    <figcaption>This month's care jobs for the plants you own.</figcaption>
    <img src="/images/projects/green-claws/04-care.webp" alt="This month's care jobs for the plants owned" />
  </figure>
  <figure>
    <figcaption>Watering, based on recent local rainfall.</figcaption>
    <img src="/images/projects/green-claws/05-watering.webp" alt="Watering guidance based on recent local rainfall" />
  </figure>
  <figure>
    <figcaption>Confirming an identification against reference photos.</figcaption>
    <img src="/images/projects/green-claws/06-review.webp" alt="Confirming an identification against reference photographs" />
  </figure>
</div>

There are no daily reminders and no streaks. Plants run on months, not push notifications.

Under the hood, OpenAI models do the identification and write the plant content, and RHS data fills in the reference information the same way it does for Flora. Identification runs in the background and nothing gets filed under a name you haven't agreed to. Your location is rounded to about 10km before it leaves the phone, and if you decline it the only thing you lose is the rainfall.

## UK only, for now

Green Claws is built for people in the UK. You can use it anywhere, but the plant information, watering schedules especially, is written for a British climate and won't be right elsewhere. Getting one country right felt more useful than getting every country vaguely wrong, and it's the country I can test in.

## What's next

Publishing a garden is the first sharing feature, and there are more coming. Wish lists, so you can keep track of the plants you want and not just the ones you have. And shared gardens, so two people in the same house can look after one garden together instead of each keeping their own copy.

## Nearly there

The app has been on TestFlight for a while and it's changed a lot from the feedback. <!-- TODO: one or two concrete things that changed because of tester feedback would be good here --> It's nearly ready to launch.

If you've got a windowsill of houseplants you keep killing, or a garden you're not sure what to do with in October, it was built for you. More on the [project page](/projects/green-claws).

<!-- TODO: replace APP_STORE_URL with the real link once it's live -->
<a href="APP_STORE_URL" target="_blank" rel="noopener noreferrer"><img src="/images/download-on-the-app-store.svg" alt="Download Green Claws on the App Store" width="120" height="40" class="inline rounded-none border-none" /></a>
