---
slug: astro-d1-search
title: astro-d1-search
subtitle: Site search for Astro, backed by Cloudflare D1 (SQLite FTS5). Build-time indexing, an injected /api/search endpoint, and bm25 + recency ranking.
date: 2026-08-01
repo: 'https://github.com/mrmartineau/astro-d1-search'
link: 'https://astro-d1-search.zander.wtf'
showReadme: true
status: active
tech: TypeScript, Cloudflare D1, SQLite FTS5
tags:
  - astro
  - cloudflare
  - typescript
  - search
  - npm
type: package
---

An Astro integration that gives you full-text site search without a third-party service. It's the search from this very site, extracted into a package — one config object describes your content, and the integration handles the rest.

- Build-time indexing of markdown/MDX into a D1 FTS5 index
- Injected `GET /api/search` endpoint with highlighted snippets, type filtering and edge caching
- `searchIndex()` for server-rendered search pages that query D1 directly
- bm25 ranking with per-column weights and a configurable recency boost
- Content-type agnostic: anything with a title and a URL is a row
- Agent skill for Claude Code & Cursor: `npx skills add mrmartineau/astro-d1-search`

Requires the `@astrojs/cloudflare` adapter; the rest of your site stays static.
