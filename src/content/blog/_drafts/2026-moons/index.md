---
slug: moons
title: "Moons: the twelve people who matter most"
subtitle: An iOS app that puts the twelve people you care about in orbit around you and lets them drift when you go quiet, and what the next version adds.
date: 2026-09-08
draft: true
tags:
  - ios
  - swiftui
  - side-project
---

<!-- DRAFT. Hold until the groups release ships. TODO before publishing: fix the date, add a screenshot of the new groups view. -->

I'm bad at staying in touch with people. Not the people I see every week, the other ones. The friend who moved to another city, the old colleague I actually liked, the cousin I only hear from at Christmas. I always mean to call and then it's been four months and calling feels weird, so it becomes six.

I've tried to fix this before. Reminders, a list in a notes app, a recurring calendar event that I dismissed every time it fired. <!-- TODO: add the real list of past attempts here if you want it -->None of them stuck, mostly because they treated staying in touch as a chore to tick off rather than something I wanted to see.

[Moons](/projects/moons) is my latest attempt, and it's the first one that's lasted more than a fortnight. It's on the [App Store](https://apps.apple.com/gb/app/moons-keep-in-touch/id6805814733) now.

## Twelve people

The idea I kept coming back to is that the list should be short. If you have to keep in touch with two hundred people you'll keep in touch with none of them. If you can only pick twelve, everyone on that list is someone you genuinely care about or genuinely want back in your life. The cap does the thinking for you.

So the first version of Moons has one group and a hard limit of twelve. You pick people from your contacts. For each one you say how often you'd like to be in touch, weekly, monthly, whatever fits, and when you last were. That's the whole setup.

## The orbit

Then the app draws them. You're in the middle of the screen and each person is a moon in orbit around you. The distance is how long it's been since you spoke, measured against the rhythm you set. Speak to someone and they pull in close. Go quiet and they drift outward, and their colour follows.

<div class="grid grid-cols-2 gap-7">
  <figure>
    <figcaption>The orbit. Colour shows who is due.</figcaption>
    <img src="/images/projects/moons/01-orbit.webp" alt="Twelve people orbiting on a single screen, colour showing who is due" />
  </figure>
  <figure>
    <figcaption>A person's page: notes, facts and recent catch-ups.</figcaption>
    <img src="/images/projects/moons/02-person.webp" alt="A person's page with notes, facts and recent catch-ups" />
  </figure>
</div>

That's the entire interface and it's what makes it work for me. I don't have to read a list or check a date. One glance at the screen tells me who's drifting, and the ones near the edge are the ones I need to call. Nobody gets a red badge. A person drifting away is a much gentler nudge than a notification saying you're 23 days overdue on your mum.

Logging a catch-up is deliberately cheap. Tap someone and you can call, message, FaceTime or email them, and the catch-up logs itself. Press and hold to log one that happened in person. There's a home-screen widget that shows the same orbit and a Siri shortcut for "log a catch-up", so most of the time I never open the app at all.

Everything stays on the phone. No account, no server, no analytics. The App Store privacy label says "Data Not Collected" and that's literally true.

## What people asked for

The feedback since launch has been consistent on one point. People want a second group. Their twelve friends and their twelve work contacts are different lists with different rhythms, and they didn't want them on the same screen.

So the new version, out this week, adds groups. You can now:

- Add more groups and swipe between them
- Watch the moons rotate in their orbits, rather than sit still
- See all your groups at once, arranged into four quadrants
- Zoom out to a bird's-eye view of everyone you're keeping in touch with

<!-- TODO: screenshot of the quadrants view -->

## What it won't do

I think that's the core of the app now and I don't expect to add much more to it. Groups were the one missing piece. What comes after will be refinements, small things that make it easier to actually follow through and call the person, rather than new features for their own sake.

Moons is meant to be a small app. The twelve-person cap is what keeps it small, and keeping it small is what keeps me using it.

## What it costs

Three people are free, and that's enough to find out whether the orbit works for you. One payment of £1.99, or $1.99, opens all twelve. Groups are a second, separate purchase. If you've already paid for twelve, another £1.99 adds groups, up to four of them with twelve people in each. If you're still on the free tier and want the lot, it's £4.99, or $4.99, in one go.

No subscription. You pay once and it's yours. More on the [project page](/projects/moons).

<a href="https://apps.apple.com/gb/app/moons-keep-in-touch/id6805814733" target="_blank" rel="noopener noreferrer"><img src="/images/download-on-the-app-store.svg" alt="Download Moons on the App Store" width="120" height="40" class="inline rounded-none border-none" /></a>
