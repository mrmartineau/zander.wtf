---
slug: otter-ecosystem
title: The Otter ecosystem
subtitle: One bookmarking app, many faces — a tour of the web app, browser extensions, iOS share extension, Raycast extension, terminal UI, and desktop experiment that make up Otter.
date: 2026-07-10
tags:
  - side-project
  - otter
---

[Otter](https://otter.zander.wtf) is my self-hosted bookmarking app and media tracker, and it's the side project I actually use: many times a day, every day. Because I use it so much, it has quietly grown into a whole ecosystem of apps and tools, each one a different way of getting things in or out of the same data. Some are genuinely useful, some are experiments, and all of them live in [the same monorepo](https://github.com/mrmartineau/Otter).

This post is a tour of the pieces.

**TL;DR**

- The **web app** is the heart: a client-side React app plus a [Hono](https://hono.dev/) API, both running on [Cloudflare Workers](https://workers.cloudflare.com/). Everything else builds on it
- A **cross-browser extension** (Chrome and Firefox) for one-click saving
- An **iOS app** that is, for now, just a share extension
- A **[Raycast extension](https://www.raycast.com/mrmartineau/otter)** for searching and saving without opening a browser
- A **terminal UI** that I vibecoded to see what would happen
- A **desktop app** built with [Tauri](https://tauri.app/), currently a work-in-progress experiment

## The web app: the heart of it all

The web app is the meat on the bones. It powers everything else; every other item in the ecosystem uses either its API or its frontend.

It's a client-side React app using [TanStack Router](https://tanstack.com/router), with a [Hono](https://hono.dev/) server providing the API, all running on [Cloudflare Workers](https://workers.cloudflare.com/). I love Workers: they're so quick, very easy to develop for, and very easy to deploy. Importantly, they're free for me at side-project scale, which is a big bonus. (Otter was also the proving ground for [my zero-to-one stack](/blog/zero-to-one-stack), so if the ingredients sound familiar, that's why.)

Feature-wise it does search, tagging, collections, starring, public/private bookmarks, RSS parsing, URL scraping, AI-powered title and description rewriting via Workers AI, and a kanban-style board for tracking films, TV, and games. But for the purposes of this post, the important part is the **add bookmark page** and the **API**, because those are the two surfaces everything else plugs into.

---

## The browser extension

The [web extension](https://github.com/mrmartineau/Otter/tree/main/packages/web-extension) works in both Chrome and Firefox, and it exists to make adding a bookmark as fast as possible. Click the Otter icon in the toolbar and it opens the add-new-bookmark page with the current page's URL. That page then grabs the metadata, automatically suggests tags, and lets you save in a couple of seconds.

Notice the pattern here: the extension itself is deliberately thin. It doesn't reimplement the add form; it just gets you to the web app's existing one with the right URL. That's a theme that repeats across the ecosystem.

## The iOS share extension

The iOS side is essentially the same trick. Tap Share in mobile Safari, tap the Otter logo, and it opens the add-bookmark page on the Otter website. Metadata, auto-tagging, save: same flow as the browser extension, just from a phone.

The backstory is more interesting than the app. I used to do this with an iOS Shortcut, but a change to iOS's security permissions a few years back meant you had to approve each new domain a shortcut touched. Approving every single website I ever tried to bookmark became really annoying, really fast. So I was forced into building a very lightweight native iOS app that, at this point, is just a share extension. It's likely I'll expand it into a full app eventually, but for now it does the one job I need it to do.

## The Raycast extension

This is one of the most interesting ones to me. [Raycast](https://www.raycast.com/) is an app I have on my Mac and use all the time, I absolutely love it, and building extensions for it is really easy.

Often, rather than visiting the Otter website at all, I'll just search Otter from Raycast. The [extension](https://www.raycast.com/mrmartineau/otter) uses the Hono API to search, and Raycast's detail view surfaces the bookmark's image, page metadata, and tags right there in the launcher. From a result you can open the item in Otter or navigate straight to the link itself. You can add bookmarks through it too. It's really powerful, and for quick "where was that article about X" moments it has mostly replaced the website for me.

## The terminal UI

The [Otter TUI](https://github.com/mrmartineau/Otter/tree/main/packages/tui) is really fun. It's a dependency-free Node terminal UI for browsing, searching, starring, and saving bookmarks without leaving the shell.

I'll be honest: I don't really use it much. It exists because I vibecoded it with Claude to see how it would work, and it came together very, very quickly. That's kind of the point though. When an experiment costs an afternoon instead of a fortnight, "another way to explore how you can interact with this data" is reason enough to build it.

## The desktop experiment

The newest piece is a macOS application I'm building at the moment with [Tauri](https://tauri.app/). I'm essentially creating a basic browser around Otter: tabs, an address bar, that sort of thing, to see how the app feels as its own dedicated window rather than a tab lost among fifty others.

The bones of it are there, but it remains to be seen whether it will actually be useful. Like the TUI, it's an experiment in surfacing a different way to view and experience something that is, underneath, a web application.

---

What I like about all these pieces is that they're simple, individually almost trivially so, but each one challenges me to think about interacting with Otter in a different way. The web app does the heavy lifting once (metadata scraping, auto-tagging, search, storage), and everything else is a thin doorway into it: a toolbar button, a share sheet, a launcher command, a terminal, a window. If you're building a side project you actually use every day, I'd recommend trying this: get the core app solid, expose a decent API, and then the satellite tools almost build themselves. Especially now that, with a bit of vibecoding, some of them literally do.
