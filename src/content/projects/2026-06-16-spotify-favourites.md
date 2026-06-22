---
slug: spotify-favourites
title: Spotify Favourites
subtitle: Finds your real favourite artists and albums on Spotify by how much of each catalogue you've actually explored, not raw play counts.
date: 2026-06-16
repo: 'https://github.com/mrmartineau/spotify-fave-artists'
link: 'https://lab.zander.wtf/spotify-favourites/'
# showReadme: true
status: active
tech: TypeScript
tags:
  - typescript
---

I never trusted Spotify's idea of my "top artists". It just counts plays, so the song you leave on repeat drowns out the artist whose whole back catalogue you've worked through. This tool flips the question: instead of how *often* you played something, it asks how much of it you've *explored* — how many different tracks of each album you've actually listened to. Ten plays of one song counts as one; one play each of ten songs counts as ten.

From that it builds two rankings: favourite artists, scored by how many of their albums you've genuinely dug into, and favourite albums, scored by how thoroughly you've worked through each one. Breadth beats depth on purpose — an artist with three explored albums always outranks one with two.

It runs in two modes. **Offline** uses nothing but your Spotify data export, so no API keys or account access required. **Enriched** layers the Spotify Web API on top for true album-coverage percentages, cover art and artist photos. Built with TypeScript on Bun, with a bundled static viewer for browsing the results.
