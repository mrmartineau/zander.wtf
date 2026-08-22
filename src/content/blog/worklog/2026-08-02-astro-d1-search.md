---
slug: 2026-08-02-astro-d1-search
title: astro-d1-search released on npm
subtitle: "My site search is now an Astro integration on npm, and this site runs on the package instead of its own copy of the code."
date: 2026-08-02
worklog: true
---

The [site search](/blog/astro-cloudflare-d1-search) I built last month is now a package: [**astro-d1-search**](https://www.npmjs.com/package/astro-d1-search) is an Astro integration that adds full-text search backed by **Cloudflare D1** to any Astro site running on the Cloudflare adapter. Build-time indexing, an injected `/api/search` endpoint, bm25 + recency ranking, and a `searchIndex()` function for server-rendered search pages, all driven by one config object.

This site now runs on the package rather than its own copy of the code, which removed about 400 lines from the repo. There are [docs](https://astro-d1-search.zander.wtf), a [repo](https://github.com/mrmartineau/astro-d1-search), and an agent skill (`npx skills add mrmartineau/astro-d1-search`) so Claude Code can wire it up for you.

I wrote up the whole thing in [astro-d1-search: site search for Astro in one integration](/blog/astro-d1-search-package).
