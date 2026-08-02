---
slug: astro-d1-search-package
title: 'astro-d1-search: site search for Astro in one integration'
subtitle: I extracted the search implementation I built for this site into an npm package, so you can add full-text search to your own Astro site
date: 2026-08-02
tags:
  - astro
  - cloudflare
  - search
  - open-source
  - side-project
---

A couple of weeks ago I wrote about [building site search with Astro and Cloudflare D1](/blog/astro-cloudflare-d1-search): an [FTS5](https://www.sqlite.org/fts5.html) index built at deploy time, a `/api/search` endpoint, [bm25](https://en.wikipedia.org/wiki/Okapi_BM25) ranking with a recency boost, and a Raycast extension on top. It's a genuinely good way to do search on a personal site, and the whole post was written so you could lift the code into your own repo.

Now you don't have to. I've packaged the entire thing up and published it: [**astro-d1-search**](https://www.npmjs.com/package/astro-d1-search) is on npm, with [docs](https://astro-d1-search.zander.wtf/) and a [repo](https://github.com/mrmartineau/astro-d1-search). Instead of an index script, an endpoint, a config file and a query helper, you install one package, add an integration to `astro.config.mjs` and describe your content. This site runs on it, and its search is now a config object and a two-line script.

**TL;DR**

- `pnpm add astro-d1-search`, add the integration to `astro.config.mjs`, describe your content as `sources` (see below), done
- It's an Astro integration and it needs the [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter — the search endpoint is the only server-rendered thing on your site, everything else stays static
- The integration injects `GET /api/search` for you, and validates your `wrangler.toml` has the D1 binding at startup
- One config object drives the integration, the index build and your search pages, so ranking can't drift between them
- Content-type agnostic: anything with a title and a URL is a row. Blog posts, notes, standalone pages, recipes, whatever
- There's an agent skill too — `npx skills add mrmartineau/astro-d1-search` — so your coding agent can wire it up for you

---

## What it actually does

Three moving parts, all of which the package now owns:

1. **Build-time indexing.** A CLI walks your markdown/MDX, flattens it to plain text, and emits one SQL file (`CREATE TABLE IF NOT EXISTS` + site-scoped `DELETE` + batched `INSERT`s) which it executes via `wrangler d1 execute`. There's no separate migration step; the FTS5 table is created on every push.
2. **An injected API route.** The integration adds `GET /api/search?q=…` to your site with `prerender = false`. Ranking, `<mark>` snippets, type filtering, input clamping and edge caching are all in there.
3. **A query function.** `searchIndex()` hits the D1 binding directly, so a server-rendered search page doesn't have to fetch its own API over HTTP.

## Setup

Create the database and add the binding — this bit is unavoidably yours, because it's your Cloudflare account:

```sh
pnpm add astro-d1-search
wrangler d1 create my-site-search
```

```toml
# wrangler.toml
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "SEARCH_DB"
database_name = "my-site-search"
database_id = "<id from the command above>"
```

Then describe your content. This is the only interesting part of the setup, and it's the whole reason the package works for sites that look nothing like mine:

```js
// astro.config.mjs
import cloudflare from '@astrojs/cloudflare'
import { defineConfig } from 'astro/config'
import d1Search from 'astro-d1-search'

export default defineConfig({
  output: 'static',
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [
    d1Search({
      database: 'my-site-search',
      sources: [
        { dir: 'src/content/blog', type: 'blog', url: '/blog/:slug' },
        { dir: 'src/content/notes', type: 'note', url: '/notes/:slug' },
        { files: ['src/pages/about.mdx'], type: 'page', url: '/:slug' },
      ],
    }),
  ],
})
```

A source is either a `dir` to walk or an explicit list of `files`, plus a `type` string and a `url` pattern where `:slug` is substituted per document. `type` is a free string — the package has no opinion about what kinds of content you have, it just stores it and lets consumers filter on it. Slugs resolve the way Astro resolves them (frontmatter `slug` wins, otherwise the file or directory name), so your routes and your index can't disagree.

Finally, the index script and its package scripts:

```ts
// scripts/build-search-index.ts
import { runCli } from 'astro-d1-search/indexer'
import searchConfig from '../search.config'

runCli(searchConfig)
```

```json
"search:index": "tsx scripts/build-search-index.ts",
"search:push": "tsx scripts/build-search-index.ts --target=remote"
```

`search:index` pushes to the local D1 in `.wrangler/state`, which the dev server reads through the adapter's `platformProxy`. So `pnpm search:index && astro dev` gives you the entire stack — index, endpoint, search page — working offline. `--dry-run` writes the SQL without executing it, for when you want to see what you're about to do.

---

## One config object, three consumers

The thing I'm happiest with is boring: the options live in a single `search.config.ts` at the repo root, and everything imports it.

```ts
import type { D1SearchOptions } from 'astro-d1-search'

const searchConfig: D1SearchOptions = {
  database: 'zander-wtf-search',
  binding: 'SEARCH_DB',
  site: 'zander.wtf',
  sources: [
    { dir: 'src/content/blog', type: 'blog', url: '/blog/:slug' },
    { dir: 'src/content/codenotes', type: 'note', url: '/notes/:slug' },
    { dir: 'src/content/projects', type: 'project', url: '/projects/:slug' },
    // Worklog entries all render on the single /worklog page
    { dir: 'src/content/worklog', type: 'worklog', url: '/worklog' },
    {
      files: ['src/pages/about.mdx', 'src/pages/uses.md'],
      type: 'page',
      url: '/:slug',
    },
  ],
  recency: {
    boost: 0.35, // a doc published today gets relevance × 1.35
    windowDays: 1095, // falling linearly to ×1 at 3 years old
  },
}

export default searchConfig
```

`astro.config.mjs` passes it to the integration, `scripts/build-search-index.ts` passes it to the indexer, and the search pages pass it to `searchIndex()`. Change a bm25 weight in one place and the endpoint, the `/search` page and the notes-scoped search all move together — there's only one place those numbers can live, so they can't get out of sync.

Internally the integration hands the resolved config to the injected route through a Vite virtual module, which is how a route that lives inside `node_modules` gets to know your database name without you passing it anything.

Everything is optional except `database` and `sources`. The defaults are the ones I arrived at for this site:

| Option | Default | What it does |
|---|---|---|
| `binding` | `'SEARCH_DB'` | Name of the D1 binding in your wrangler config |
| `site` | `''` | Stored per row, so several sites can share one database |
| `apiRoute` | `'/api/search'` | Set to `false` if you only want the query function |
| `cors` | `true` | Open endpoint by default — it's public data |
| `cacheMaxAge` | `300` | Edge cache duration, in seconds |
| `weights` | `{ title: 10, description: 5, content: 1, tags: 3 }` | Per-column bm25 weights |
| `recency` | `{ boost: 0.35, windowDays: 1095 }` | Relevance multiplier by document age |
| `maxLimit` / `maxOffset` / `maxQueryLength` | `25` / `200` / `100` | Caps that bound the cost of a single request |
| `maxContentLength` | `8000` | Characters of body text kept per document |

## Building a search page

Two ways, and you can mix them. Hit the endpoint from anywhere with `fetch`, or query D1 directly in Astro frontmatter — which is what I'd recommend for the site's own search page, since fetching your own API over HTTP from inside the same worker is a needless round trip:

```astro
---
export const prerender = false

import { resolveConfig, searchIndex } from 'astro-d1-search/core'
import searchConfig from '../../search.config'

const config = resolveConfig(searchConfig)
const query = Astro.url.searchParams.get('q')?.trim() || ''

const results =
  query.length >= 2
    ? await searchIndex(
        Astro.locals.runtime.env.SEARCH_DB,
        { query, limit: 25 },
        config,
      )
    : []
---
```

Results come back with `title`, `url`, `type`, `date`, `tags`, `emoji`, a `snippet` with the matched terms already wrapped in `<mark>`, and a `score`. Render the snippet with `set:html` and one CSS rule for `mark` and you've got highlighted excerpts for free. (Only do that because you control the indexed content. Sanitise if you don't.)

Scoped search is one parameter: `{ query, type: 'note' }` is how [`/notes/search`](/notes/search) on this site stays inside the notes section.

The subpath exports are split deliberately: `astro-d1-search/core` has zero Node dependencies so it runs on the edge, `astro-d1-search/indexer` is the Node-only filesystem-and-SQL half that only ever runs at build time. The indexer also exports its guts — `gatherDocs()`, `toSql()`, `markdownToPlainText()`, `sqlEscape()`, `SCHEMA_SQL` — for anyone who wants to build a different pipeline out of the same parts.

---

## Small things that make it nicer to live with

- **It checks your `wrangler.toml` at startup.** If the D1 binding is missing, the integration warns with a copy-paste-ready snippet instead of letting you discover it as a runtime `undefined` on the first search.
- **No migration step.** The generated SQL creates the table if it doesn't exist, so a fresh database needs `pnpm search:push` and nothing else.
- **Site-scoped deletes.** Rebuilds only remove rows for the current `site` value, which is what makes one D1 database shared across several sites actually work rather than just theoretically work.
- **Code fence contents are kept.** My code notes are mostly code; searching for `grid-template` should find them. Formatting markers and link URLs get stripped, link and image *text* survives.
- **Documents without a `title` are skipped**, silently and on purpose, because a result with no title is useless.

## There's a skill for it

The repo also ships a [`SKILL.md`](https://github.com/mrmartineau/astro-d1-search/blob/main/SKILL.md), so if you'd rather have your coding agent do the wiring:

```sh
npx skills add mrmartineau/astro-d1-search
```

That installs it as an [agent skill](https://code.claude.com/docs/en/skills) for Claude Code (and anything else that reads the same format). It covers the architecture, the full options reference, the setup order, how the pieces fit together and the mistakes that are easy to make — the D1 binding, `prerender = false`, deploy-then-index ordering. Ask your agent to add search to your Astro site and it has the actual API in front of it rather than a hallucinated guess at one.

I'm increasingly convinced this should be table stakes for a package: a README for humans, a skill for the agents. They're both documentation, they just have different readers.

## What it doesn't do

The design decisions from the original are all still in there, and they're worth knowing before you pick it:

- **You need the Cloudflare adapter.** This is a Cloudflare-shaped package. If you're on Vercel or Netlify, [Pagefind](https://pagefind.app/) is the better answer and I'd genuinely recommend it.
- **The index is fully rebuilt on every push**, so it's briefly empty mid-deploy. At personal-site scale nobody notices. If it bothers you, index into a staging table and rename.
- **Porter stemming is English-only.** Multilingual sites want plain `unicode61`.
- **The endpoint is open by default.** It serves the same data as your public site, so I don't care about mine; add a bearer check if you do. The caps and the edge cache are on regardless, and a free-plan WAF rate limiting rule covers the rest.

---

This site has been running on the package for a few days now, with about 400 fewer lines in the repo and every improvement to the search arriving as a version bump. If you deploy an Astro site to Cloudflare and want search that you own, it should be about ten minutes of work: [docs are here](https://astro-d1-search.zander.wtf/), [repo here](https://github.com/mrmartineau/astro-d1-search), issues and PRs very welcome.

If you build something with it, [let me know](https://bsky.app/profile/zander.wtf). I still want to see one that isn't a blog.
