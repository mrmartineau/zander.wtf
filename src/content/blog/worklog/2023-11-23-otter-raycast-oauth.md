---
slug: 2023-11-23-otter-raycast-oauth
title: Otter Raycast OAuth
subtitle: "Got Raycast’s OAuth flow working with Otter, then found Supabase only supports it for the management APIs, not the data APIs."
date: 2023-11-23
worklog: true
---

I spent a large chunk of the day trying to integrate Raycast's OAuth flow into [<img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/public/otter-logo.svg" width="30" height="30" class="mx-2 inline border-none" /> Otter](https://github.com/mrmartineau/Otter). I got it working, but unfortunately Supabase only supports the managment APIs using OAuth apps, not the data APIs. I'm going to have to use a different approach.

I have the WIP code in two PRs:

- My Raycast extension: [raycast-extensions/pull/3](https://github.com/mrmartineau/raycast-extensions/pull/3)
- Otter: [Otter/pull/4](https://github.com/mrmartineau/Otter/pull/4)
