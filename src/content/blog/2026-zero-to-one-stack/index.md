---
slug: zero-to-one-stack
title: My zero-to-one stack
subtitle: The tech stack I use to ship new side projects quickly, why I moved away from Supabase, and how a starter template changed how I build.
date: 2026-07-06
tags:
  - side-project
  - react
  - postgres
---

I build a lot of side projects. Most of them have somewhere between one and five users (the one is me), so what I optimise for is how quickly I can get from "I have an idea" to "this is deployed and I'm using it". Scale doesn't come into it. Here's the stack I've settled on, and how I got here.

**TL;DR**

- React + TypeScript with [TanStack Router](https://tanstack.com/router) and [TanStack Query](https://tanstack.com/query) on the frontend
- [Hono](https://hono.dev/) for the API layer, deployed to [Cloudflare Workers](https://workers.cloudflare.com/) via the excellent Vite plugin
- Postgres on [Neon](https://neon.com/signup?refcode=NK4UL5YL), with [Drizzle](https://orm.drizzle.team/) as the ORM and [better-auth](https://www.better-auth.com/) for authentication
- All wrapped up in a template repo: [zed-stack-starter](https://github.com/mrmartineau/zed-stack-starter)
- [Astro](https://astro.build/) for static sites, with its own template: [zed-astro-starter](https://github.com/mrmartineau/zed-astro-starter)
- Since writing this there are two more templates: [zed-package-starter](https://github.com/mrmartineau/zed-package-starter) for npm packages and [zed-ios-app-starter](https://github.com/mrmartineau/zed-ios-app-starter) for native iOS apps. They're all written up together on [the Zed Stack page](/zed-stack)

## Where I came from

React and TypeScript have been my constants for years, so that side of things hasn't changed. The backend is where the story is.

For a long time I used [Supabase](https://supabase.com/), and I want to be clear: it's a great product. You get a complete Postgres database and authentication solution in one, the JavaScript SDK is really nice to work with, and the team ships constantly. I'd happily recommend it.

The problem was cost, specifically cost relative to what my projects actually need. These are side projects with barely any users. Supabase's free tier gives you two projects, and as soon as I needed a third, I was looking at paying a meaningful monthly amount for a single extra project that might turn out to be a dead end. That was the killer. I wanted to try things out without a new bill every time I had an idea. So the stack had to change.

## The detour: a VPS

My first attempt was the classic one: a VPS on [Hetzner](https://www.hetzner.com/) with [Coolify](https://coolify.io/) on top. It was okay, and undeniably powerful, but I was spending far too much time configuring the server side of things instead of building. Self-hosting everything is a fine hobby; it just isn't *my* hobby. What I actually wanted was the Supabase experience, managed database and easy auth, without the per-project price tag.

## The stack I landed on

Looking around at hosted Postgres providers, I found [Neon](https://neon.com/signup?refcode=NK4UL5YL). It gives you proper Postgres databases, lots of them, for free. Exactly the "spin up a new project without thinking about it" thing I was after. They have an auth product too, but the database was the draw.

For authentication I went with [better-auth](https://www.better-auth.com/), which plugs straight into the Postgres database, and [Drizzle](https://orm.drizzle.team/) as the ORM. I looked at other ORMs, but Drizzle suited my needs and stays close enough to SQL that nothing feels magic.

There's another reason this combination works well right now. It's very AI-friendly. SQL, Drizzle and React are all well-trodden ground for LLMs, so iterating on an application with an agent is fast. That's become a real factor in how I choose tools.

The rest of the stack:

- [TanStack Router](https://tanstack.com/router) and [TanStack Query](https://tanstack.com/query) on the client
- [Hono](https://hono.dev/) for the backend and any API layers
- [Cloudflare Workers](https://workers.cloudflare.com/) for deployment, with the excellent [Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
- [Vitest](https://vitest.dev/) for testing

These are client-side single-page React applications, not isomorphic ones. For the most part I don't need Next.js. If I ever genuinely need server-side rendering I'll probably reach for [TanStack Start](https://tanstack.com/start), but I've found that a client-side SPA is perfectly fine for the kind of things I build.

## Proving it with Otter

The first project I migrated to this stack was [Otter](https://otter.zander.wtf), my bookmarking app. That was deliberate. It's something I use many times a day, every day, so it was the best possible way to test the stack properly. If anything was going to expose rough edges, daily use of my own app would.

Once I'd figured everything out through that migration, I distilled it into a skeleton starter: [zed-stack-starter](https://github.com/mrmartineau/zed-stack-starter). It's a template repo on GitHub, so starting a new project is a couple of clicks, and I keep evolving it as I add new features and learn new things. It's now the base for every new interactive application I build. Otter and [simmer.zander.wtf](https://simmer.zander.wtf) run on this stack, and a couple of unreleased experiments were spun up directly from the template.

---

## The unsolved bit: from idea to running project

> **Update:** this bit is now solved. I built [Zero, a project factory](/blog/zero-project-factory), a single GitHub Actions workflow that does everything described below from one form on my phone.

There's one part of this I haven't cracked yet. Ideas don't arrive when I'm sat at my desk. They arrive when I'm out, phone in hand. I use Claude a lot, including the mobile app, and what I'd love is to go from "I've just had an idea" to "Claude Code is building it" without touching a laptop.

Right now the process looks something like this:

1. Create a new repo on GitHub from the zed-stack-starter template
2. Find that repo in Claude Code and instruct it to build whatever the idea is
3. Create a new project in Neon for the database
4. Update the environment variables in GitHub so it auto-deploys

None of these steps is hard individually, but together they're enough friction that an idea can die between the thought and the first commit. This should be one command, or one message to Claude. I'm working on collapsing these steps into something much quicker, and when I figure it out, it'll probably be a follow-up post.

---

## And for static sites: Astro

Not everything is an interactive app. For content-driven, mostly-static websites I use [Astro](https://astro.build/). This site runs on it, as do [fonts.zander.wtf](https://fonts.zander.wtf) and [lab.zander.wtf](https://lab.zander.wtf). And because the template approach worked so well for the app stack, I've now made an Astro equivalent too: [zed-astro-starter](https://github.com/mrmartineau/zed-astro-starter). Same idea: a couple of clicks and a new static site is ready to build on.

---

## And two more, since

The template idea kept spreading. There are now four of them:

- **[zed-package-starter](https://github.com/mrmartineau/zed-package-starter)** for the TypeScript npm packages that fall out of the other projects: dual ESM/CJS output, automated releases from conventional commits, and an Astro docs site that deploys itself. [astro-d1-search](/blog/astro-d1-search-package), the search integration extracted out of this site, was built from it.
- **[zed-ios-app-starter](https://github.com/mrmartineau/zed-ios-app-starter)** for native iOS apps. SwiftUI and SwiftData, iOS 18+, and, unusually for me, no third-party dependencies at all. It ships the shell I'd otherwise rebuild every time: a tab layout, one SwiftData model wired through list, detail, edit and delete, preferences, onboarding, theming, and accessibility handling, plus optional StoreKit and Claude API modules that are switched off by default.

All four share the same tooling, the same UI library and the same deploy story. I've written the whole family up on [the Zed Stack page](/zed-stack).

---

That's the stack: boring in the best way, cheap enough that a new idea costs nothing to try, and well-understood enough, by me and by LLMs, that going from zero to one is measured in hours, not weekends. If it sounds useful, [the starter is right there](https://github.com/mrmartineau/zed-stack-starter).
