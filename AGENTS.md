# AGENTS.md

## Architecture

### Site and deployment

Personal website for Zander Martineau (`https://zander.wtf`). Static output deployed to Cloudflare Pages.

Deploy is GitHub Actions (`.github/workflows/deploy.yml`). It runs on push to `main`, on `workflow_dispatch`, **and on a 12-hourly cron** — the cron exists because page data is fetched from external APIs at build time, so the site needs rebuilding to refresh it. The workflow pushes the search index *after* deploying, so the index never points at pages that don't exist yet.

External data sources (`src/fetching/`): `otter.zander.wtf` is Zander's own bookmarking/media-tracking app; the rest is Last.fm, Spotify and Letterboxd.

### Search

Site-wide full-text search on Cloudflare D1 (SQLite FTS5), bound as `SEARCH_DB`. All search logic lives in the **[`astro-d1-search`](https://github.com/mrmartineau/astro-d1-search)** npm package — an Astro integration extracted from this repo and maintained separately. Subpath exports: `astro-d1-search` (integration), `/core` (query time), `/indexer` (build-time indexing).

- `search.config.ts` at the repo root is the **single source of truth** — database, binding, sources → type/URL mapping, ranking. `astro.config.mjs`, `scripts/build-search-index.ts` and `src/utils/search.ts` are all thin wrappers over it. Change search behaviour there, not in three places.
- The integration injects the `/api/search` route from the package and passes config through a Vite virtual module (`virtual:astro-d1-search-config`). It also validates the `wrangler.toml` D1 binding at startup.
- Index builds emit `search-index.sql` and execute it via `wrangler d1 execute`. There's no migration step — `migrations/0001_search_index.sql` is historical. Rebuild the index after adding or editing content; CI does it automatically after each deploy.
- `/api/search` is an open endpoint with CORS `*` — the Raycast extension consumes it too, so don't tighten it without updating that.
- `raycast-extension/` is a standalone npm package: **not** in the pnpm workspace, excluded from the root tsconfig and Biome. Use `npm` inside it, not `pnpm`.
- Local dev gets the D1 binding from the adapter's `platformProxy`; local data lives in `.wrangler/state/v3/d1`.

### Styling

Tailwind v3 through PostCSS — **not** the Astro Tailwind integration. Custom CSS lives in `src/styles/`, composed in `src/styles/index.css`, where the Tailwind `base` / `components` / `utilities` imports are interleaved with the custom layers. Add new CSS files to the matching section of that file rather than importing them ad-hoc, or they land in the wrong cascade layer.

### Other

`__COMMIT_HASH__` is a Vite define, available globally without import.

## Environment variables

Needed in `.env` locally and as Cloudflare Pages / GitHub Actions secrets in production:

| Variable | Purpose |
|---|---|
| `LASTFM_API_KEY` | Last.fm music data |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Spotify image enrichment |
| `SUPABASE_USER_ID` / `SUPABASE_USER_API_KEY` | Otter bookmarking API |
| `OTTER_API_KEY` | Otter media API |
| `ZM_API` | Personal Cloudflare Worker API base URL |
| `NOTION_TOKEN` | Notion data |

CI also needs `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`; the token needs **both** Pages Edit and D1 Edit scopes, or the deploy succeeds and the search index push fails.

## Writing blog posts

See `src/content/CLAUDE.md` for post structure, frontmatter, voice and formatting conventions. It lives one level up from `src/content/blog/` deliberately: any `.md` file inside a collection directory is parsed as a collection entry and fails schema validation.

Posts and worklog entries are **one collection**. Worklog entries live in `src/content/blog/worklog/` with `worklog: true` in their frontmatter; `/blog` renders them in full, inline and date-interleaved with the title-only post rows, and each still gets its own `/blog/:slug` page. `/worklog` is a `public/_redirects` 301 to `/blog` — the fragment survives the redirect, so old `#slug` deep links still resolve. They're indexed as their own `worklog` search type via a second directory source in `search.config.ts` (the blog source skips the `worklog/` subdirectory), because the indexer maps types by directory, not frontmatter.
