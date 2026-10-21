---
slug: astro-d1-reactions
title: astro-d1-reactions
subtitle: Hearts, unique reads and reader highlights for Astro, kept in Cloudflare D1. Adds a pill to the bottom of every page and a public stats page.
date: 2026-10-13
type: astro-package
status: active
repo: 'https://github.com/mrmartineau/astro-d1-reactions'
link: 'https://www.npmjs.com/package/astro-d1-reactions'
showReadme: true
tech: TypeScript, Astro, Cloudflare D1
tags:
  - astro
  - cloudflare
  - typescript
  - npm
---

An Astro integration that lets readers leave hearts and highlight the bits they like. It's the pill at the bottom of this page, pulled out of this site into a package. I saw something like it on another site and wanted one, and then I wanted it on every site I build.

- A pill fixed to the bottom of the page with hearts, unique reads and highlights
- Highlights use the CSS Custom Highlight API, so the page's DOM never changes
- An injected `POST /api/reactions` endpoint. The rest of your site can stay static
- A `<Stats />` component for a public dashboard, titled from your content collections
- No cookies and no names. A reader is a random id kept in their browser
- Theme it with `--rx-*` custom properties, swap the icons, or slot in your own buttons
- Agent skill: `npx skills add mrmartineau/astro-d1-reactions`

Requires the `@astrojs/cloudflare` adapter. See it working on [/stats](/stats).
