# Plan: D1 FTS5 search for Astro sites + Raycast

## Goal

Replace Algolia with self-owned search. Build a search index from an Astro site's markdown/content collections at build time, sync it to Cloudflare D1 (SQLite FTS5), serve results from an Astro server endpoint, and consume that endpoint from both the site UI and a Raycast extension.

## Architecture

```
astro build
   └─ postbuild: sync script
        reads content collections / markdown
        → generates search-index.sql (full rebuild)
        → wrangler d1 execute --remote --file=search-index.sql

runtime
   GET /api/search?q=...&limit=...
        Astro endpoint (@astrojs/cloudflare, prerender=false)
        → D1 binding → FTS5 MATCH → bm25 + snippet()
        → JSON { results: [{ title, url, snippet, score }] }

consumers
   site UI (fetch)  ·  Raycast extension (fetch, no CORS issues in Node)
```

Decisions baked in (change if needed):

- **Full rebuild on every deploy**, not incremental sync. `DELETE FROM` + batch `INSERT`. Content volume is small (blogs/side projects); simplicity wins. Revisit only if sync exceeds ~10k rows.
- **Per-site Astro endpoint**, but schema includes a `site` column from day one so a shared multi-site Worker is a later refactor, not a schema migration.
- **Plain FTS5 table** (stores its own content). No external-content/contentless setup; not worth the trigger complexity for rebuild-on-deploy.
- **Open endpoint** (same data as the public site). Optional bearer token in Phase 5.

## Phase 1: D1 database + schema

1. Create DB: `wrangler d1 create <site>-search`
2. Add binding to `wrangler.toml` (or `wrangler.jsonc`):

```toml
[[d1_databases]]
binding = "SEARCH_DB"
database_name = "<site>-search"
database_id = "<id>"
```

3. Migration `migrations/0001_search_index.sql`:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
  title,
  description,
  content,
  tags,
  url UNINDEXED,
  site UNINDEXED,
  type UNINDEXED,        -- e.g. 'blog' | 'note' | 'project'
  date UNINDEXED,
  tokenize = 'porter unicode61'
);
```

Notes:

- `porter` stemming so "deploying" matches "deploy". Drop it if exact-match behaviour is preferred.
- UNINDEXED columns are stored but not searchable; free to return in results.
- Apply with `wrangler d1 execute <site>-search --remote --file=migrations/0001_search_index.sql` (and `--local` for dev).

Acceptance: `wrangler d1 execute <site>-search --remote --command "SELECT count(*) FROM search_index"` returns 0.

## Phase 2: build-time sync script

`scripts/build-search-index.ts`, run with Bun.

Responsibilities:

1. Gather documents. Two options; prefer (a) if the site uses content collections:
   - a. Import compiled collection data. Simplest reliable route: glob `src/content/**/*.{md,mdx}` and parse with `gray-matter`; derive `url` from the collection slug the same way the site's routes do. Keep the slug→url mapping in one shared function so routes and index can't drift.
   - b. Alternatively parse `dist/` HTML. Rejected: loses frontmatter fidelity, couples to markup.
2. Convert body markdown to plain text. Strip code fences (or keep them; decide per site), strip MDX imports/components, collapse whitespace. `remove-markdown` or a small `remark` pipeline.
3. Emit `search-index.sql`:

```sql
DELETE FROM search_index;
INSERT INTO search_index (title, description, content, tags, url, site, type, date) VALUES (...), (...);
```

   - SQL-escape values (double up single quotes). No parameter binding via file exec, so escaping must be correct. Write one `sqlEscape(str)` helper + tests.
   - Batch INSERTs ~50 rows per statement to stay under statement size limits.
   - Wrap in a transaction if supported by file exec; otherwise the DELETE+INSERT ordering in one file is acceptable (brief window of empty index during deploy is fine at this scale).
4. Execute: shell out to `wrangler d1 execute <site>-search --remote --file=search-index.sql`. Flag `--local` for dev via `--env` or a `--target` CLI arg.

Package scripts:

```json
"index:build": "bun scripts/build-search-index.ts",
"index:push": "bun scripts/build-search-index.ts --target=remote",
"index:local": "bun scripts/build-search-index.ts --target=local"
```

Acceptance: after `index:local`, `wrangler d1 execute ... --local --command "SELECT title FROM search_index LIMIT 5"` shows real posts.

## Phase 3: Astro endpoint

Prereqs: `@astrojs/cloudflare` adapter with `platformProxy: { enabled: true }` in `astro.config` so `astro dev` gets the local D1 binding.

`src/pages/api/search.ts`:

```ts
import type { APIRoute } from 'astro'

export const prerender = false

const MAX_LIMIT = 25

export const GET: APIRoute = async ({ url, locals }) => {
  const q = url.searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 10), MAX_LIMIT)
  const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0)

  if (q.length < 2) return json({ results: [], total: 0 })

  const match = toFtsQuery(q)
  const db = locals.runtime.env.SEARCH_DB

  const { results } = await db
    .prepare(
      `SELECT title, url, type, date,
              snippet(search_index, 2, '<mark>', '</mark>', '…', 24) AS snippet,
              bm25(search_index, 10.0, 5.0, 1.0, 3.0) AS score
       FROM search_index
       WHERE search_index MATCH ?
       ORDER BY score
       LIMIT ? OFFSET ?`
    )
    .bind(match, limit, offset)
    .all()

  return json({ results }, { 'Cache-Control': 'public, max-age=300' })
}
```

Notes:

- `bm25()` returns lower-is-better; `ORDER BY score` ascending is correct. Weights order = column order in the FTS table (title 10, description 5, content 1, tags 3). Tune later.
- `snippet(search_index, 2, ...)`: column index 2 = `content`.
- `json()` is a tiny helper returning `Response` with `content-type: application/json` + passed headers.
- Return 400 for malformed `limit`/`offset` rather than NaN-ing into SQL.

### FTS query sanitizer (`toFtsQuery`)

User input must never reach `MATCH` raw; quotes, hyphens, `AND`/`OR`/`NEAR`, `*` all throw FTS5 syntax errors.

```ts
export function toFtsQuery(input: string): string {
  const terms = input
    .replace(/["'`]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8) // cap term count
  if (terms.length === 0) return '""'
  return terms
    .map((t, i) => (i === terms.length - 1 ? `"${t}"*` : `"${t}"`))
    .join(' ')
}
```

Each term quoted (neutralizes operators); last term gets `*` for prefix search, giving search-as-you-type behaviour.

Acceptance:
- `curl 'localhost:4321/api/search?q=astro'` returns JSON results in dev
- Hostile inputs return empty/valid results, never 500: `q="`, `q=AND`, `q=a-b`, `q=*`, `q=NEAR(`
- Unit tests for `toFtsQuery` and `sqlEscape` (bun test)

## Phase 4: CI / deploy wiring

Assumes GitHub Actions deploy (adjust if using Pages git integration; then run sync as a separate workflow job with `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets since Pages build image can't push to D1).

Order matters: deploy site first, then push index (new pages exist before they're searchable; avoids dead URLs in results).

```yaml
- run: bun install --frozen-lockfile
- run: bun run build
- run: <deploy step>
- run: bun run index:push
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

API token scope: Account → D1 → Edit.

Acceptance: push to main → production `/api/search?q=<known term>` returns fresh content.

## Phase 5 (optional): hardening + multi-site

- **Bearer token**: check `Authorization` header against a secret binding; skip for same-origin requests if the site UI should stay tokenless.
- **Multi-site**: move endpoint into a standalone Hono Worker owning the D1 DB; each site's CI pushes rows with its own `site` value (`DELETE FROM search_index WHERE site = '<site>'` instead of full delete); endpoint gains `?site=` filter, defaulting to all. Raycast then searches everything.
- **Rate limiting**: Cloudflare WAF rule or a simple KV counter if the open endpoint gets abused.

## Phase 6: Raycast extension

New command in the existing extension setup (or standalone). Core:

```tsx
import { List, ActionPanel, Action } from '@raycast/api'
import { useFetch } from '@raycast/utils'
import { useState } from 'react'

export default function Search() {
  const [q, setQ] = useState('')
  const { data, isLoading } = useFetch<{ results: Result[] }>(
    `https://<site>/api/search?q=${encodeURIComponent(q)}&limit=15`,
    { execute: q.length >= 2, keepPreviousData: true }
  )

  return (
    <List isLoading={isLoading} onSearchTextChange={setQ} throttle>
      {data?.results.map((r) => (
        <List.Item
          key={r.url}
          title={r.title}
          subtitle={stripMarks(r.snippet)}
          accessories={[{ tag: r.type }, { date: new Date(r.date) }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={r.url} />
              <Action.CopyToClipboard content={r.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
```

- `stripMarks`: remove `<mark>` tags from snippet for List display.
- Base URL (and token, if Phase 5) in Raycast preferences.
- `throttle` + `keepPreviousData` gives smooth search-as-you-type; server prefix search does the rest.

Acceptance: typing in Raycast returns live results, Enter opens the post.

## Test checklist (end-to-end)

1. `bun run index:local` → local D1 populated
2. `astro dev` → `/api/search` works against local binding via platformProxy
3. Sanitizer unit tests green
4. Deploy → prod endpoint fresh
5. Raycast command against prod
6. Edge cases: empty query, 1-char query, emoji, 500-char query, FTS operators

## Known constraints / future notes

- Full rebuild means index briefly empty mid-sync. Acceptable now; fix later with staged table + `ALTER ... RENAME` if it ever matters.
- FTS5 `porter` stemming is English-only; multilingual sites should use plain `unicode61`.
- `wrangler d1 execute --file` has size limits on very large files; batching at 50 rows/INSERT keeps statements safe. If a site outgrows file exec, switch to the D1 HTTP API with batched prepared statements.
- Snippet HTML (`<mark>`) is safe to render only because indexed content is own-content plain text. If untrusted content is ever indexed, sanitize output.