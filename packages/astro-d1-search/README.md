# astro-d1-search

Site search for [Astro](https://astro.build) backed by [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite [FTS5](https://www.sqlite.org/fts5.html)).

One integration gives you:

- **Build-time indexing** of any markdown/MDX content (content collections, standalone pages, anything) into a D1 full-text index
- **An injected API endpoint** (`GET /api/search`) with bm25 + recency ranking, highlighted snippets, type filtering, input validation and edge caching
- **A query function** (`searchIndex`) for server-rendered search pages that hit the D1 binding directly
- **Content-type agnostic design**: types are strings you choose; one index can serve site-wide and per-section search, and even several sites at once

Requires the [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter. The rest of your site can stay fully static; only the search endpoint runs server-side.

## Quick start

### 1. Create the database

```sh
wrangler d1 create my-site-search
```

### 2. Configure the binding

Add to `wrangler.toml` (the integration checks this at startup and warns with this exact snippet if it's missing):

```toml
pages_build_output_dir = "./dist"   # if deploying with `wrangler pages deploy`

[[d1_databases]]
binding = "SEARCH_DB"
database_name = "my-site-search"
database_id = "<id from step 1>"
```

If you deploy with `wrangler pages deploy` (or Workers with assets), the binding is applied from this file on deploy — no dashboard configuration needed.

There is **no migration step**: the indexer creates the FTS5 table on first push (`CREATE VIRTUAL TABLE IF NOT EXISTS`).

### 3. Add the integration

```js
// astro.config.mjs
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';
import d1Search from 'astro-d1-search';

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
});
```

`platformProxy` matters: it gives `astro dev` access to your **local** D1 database, so the whole stack works offline.

### 4. Index your content

Add package scripts:

```json
"search:index": "tsx scripts/build-search-index.ts",
"search:push": "tsx scripts/build-search-index.ts --target=remote"
```

with a three-line script:

```ts
// scripts/build-search-index.ts
import { runCli } from 'astro-d1-search/indexer';
import searchConfig from '../search.config';

runCli(searchConfig);
```

Keep the options object in its own module (e.g. `search.config.ts`) so the Astro config and the index script share one source of truth.

Run `pnpm search:index`, start `astro dev`, and `http://localhost:4321/api/search?q=hello` is live.

### 5. Automate in CI

Deploy first, then push the index, so new pages exist before they're searchable:

```yaml
- run: pnpm build
- run: npx wrangler pages deploy dist --project-name=my-site
- run: pnpm search:push
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

The API token needs **Account → D1 → Edit** alongside the usual deploy scope.

## Options

| Option | Default | Description |
|---|---|---|
| `database` | required | D1 database name (`wrangler d1 create <name>`) |
| `binding` | `'SEARCH_DB'` | D1 binding name in wrangler config |
| `site` | `''` | Value for the `site` column. When set, pushes replace only this site's rows, so several sites can share one database |
| `sources` | required | Content sources; see below |
| `apiRoute` | `'/api/search'` | Injected endpoint pattern, or `false` to disable |
| `cors` | `true` | Send `Access-Control-Allow-Origin: *` |
| `cacheMaxAge` | `300` | `Cache-Control` max-age (seconds); also used for edge caching |
| `maxLimit` / `maxOffset` / `maxQueryLength` | `25` / `200` / `100` | Request validation caps |
| `weights` | `{ title: 10, description: 5, content: 1, tags: 3 }` | bm25 per-column weights |
| `recency` | `{ boost: 0.35, windowDays: 1095 }` | Recency multiplier: ×(1 + boost) today, linear falloff to ×1 at `windowDays`. `boost: 0` disables |
| `maxTerms` | `8` | Max terms taken from a query |
| `snippetTokens` | `24` | Approximate snippet length |
| `maxContentLength` | `8000` | Content truncation per document (characters) |

### Sources

Each source maps files to a `type` and a URL pattern:

```ts
{ dir: 'src/content/blog', type: 'blog', url: '/blog/:slug' }
{ files: ['src/pages/about.mdx'], type: 'page', url: '/:slug' }
{ dir: 'src/content/worklog', type: 'worklog', url: '/worklog' } // no :slug — all docs share one page
```

- `:slug` is replaced with the document slug, resolved the same way Astro does it: frontmatter `slug` if present, otherwise the file name (or directory name for `<dir>/index.md`).
- Frontmatter used per document: `title` (required — untitled documents are skipped), `subtitle`/`description`, `tags`, `date`/`modified`, `emoji`.
- `type` is any string you like. The endpoint validates its `type` param against the set of types in your sources.
- Markdown is flattened to plain text. Text inside code fences is **kept** (so code is searchable); fences, inline-code backticks, markdown syntax, HTML/JSX tags and MDX imports are stripped.

## The API

```
GET /api/search?q=<query>&limit=<n>&offset=<n>&type=<type>
```

Response:

```json
{
  "query": "css grid",
  "results": [
    {
      "title": "CSS Grid",
      "url": "https://example.com/notes/css-grid",
      "type": "note",
      "date": "2023-01-20",
      "tags": "css",
      "emoji": "🍱",
      "snippet": "…display: <mark>grid</mark>; <mark>grid</mark>-template…",
      "score": -7.71
    }
  ]
}
```

- Results are ranked by bm25 × recency multiplier; **lower (more negative) score = better match**.
- `snippet` contains `<mark>` around matched terms. Safe to render as HTML only if your indexed content is trusted (your own markdown normally is).
- Queries shorter than 2 characters return an empty result set; malformed `limit`/`offset`/`type` return 400.
- User input never reaches FTS5 raw: every term is quoted (neutralising `AND`/`OR`/`NEAR()`/`*`/`-` operators) and the last term gets a `*` suffix for prefix matching — search-as-you-type works out of the box.
- Responses are cached at the Cloudflare edge under a canonicalised key (lowercased query, fixed param order), so repeated queries don't hit D1.

## Server-rendered search pages

Skip HTTP and query D1 directly from a page's frontmatter:

```astro
---
export const prerender = false;

import { searchIndex } from 'astro-d1-search';
import searchConfig from '../../search.config';
import { resolveConfig } from 'astro-d1-search';

const config = resolveConfig(searchConfig);
const query = Astro.url.searchParams.get('q')?.trim() || '';

const results = query.length >= 2
  ? await searchIndex(Astro.locals.runtime.env.SEARCH_DB, { query, limit: 25 }, config)
  : [];
---

{results.map((r) => (
  <article>
    <a href={r.url}>{r.title}</a>
    {r.snippet && <p set:html={r.snippet} />}
  </article>
))}
```

Pass `type: 'note'` (or any of your types) for a section-scoped search page.

## Multi-site

Set a distinct `site` per project and point them all at the same `database`. Each site's index push replaces only its own rows (`DELETE ... WHERE site = ?`), and each site's endpoint serves its own content. A shared cross-site endpoint is then one Worker away.

## Constraints

- **Full rebuild per push**: the index is briefly empty (or site-scoped-empty) mid-push. Fine at personal-site scale.
- **`porter` stemming is English-only.** The schema uses `tokenize = 'porter unicode61'`; fork the schema in `indexer.ts` for multilingual content.
- **Open endpoint by default.** It serves the same data as your public site. Put it behind a token check if yours isn't public.
- **D1 free tier**: 5GB storage, 5M rows read/day — orders of magnitude above a typical content site's needs.
