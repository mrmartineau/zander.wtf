# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (runs wrangler types + astro dev)
npm run build            # Production build (wrangler types + astro check + astro build)
npm run preview          # Preview build locally
npm run preview:cf       # Preview via Cloudflare Workers (wrangler pages dev)

# Code quality
npm run check            # TypeScript checking (astro check)
npm run lint             # Lint with Biome
npm run lint:fix         # Lint and auto-fix with Biome
npm run format           # Format with Biome

# Search index
npm run algolia:update   # Re-index code notes to Algolia
```

## Architecture

**Astro 5** static site deployed to **Cloudflare Pages**. Output mode is `static` except the notes search page (`/notes/search`) which is SSR (`prerender = false`).

### Content Collections (`src/content/config.ts`)

- **blog** (`src/content/blog/`) — Blog posts (markdown). Schema: title, subtitle?, date, modified?, opengraphImage?, tags?
- **codenotes** (`src/content/codenotes/`) — TILs and code snippets (markdown, 187+ files). Schema: title, tags?, date?, emoji?, link?. Searchable via Algolia.
- **worklog** (`src/content/worklog/`) — Work changelog entries. Schema: title, date

### Routing

- `/` — Home with content blocks (About, Blog, Projects, Links)
- `/blog`, `/blog/[slug]` — Blog list and posts
- `/notes`, `/notes/[slug]` — Code notes index and detail
- `/notes/search` — Algolia-powered search (SSR)
- `/notes/tags/[tag]` — Notes filtered by tag
- `/links` — Bookmarks from Otter API (Solid.js interactive filtering)
- `/now` — Media consumption (Last.fm, Spotify, Letterboxd integrations)
- `/about`, `/colophon`, `/uses`, `/worklog`, `/feeds` — Static pages
- `/opengraph/*` — Dynamic OG image generation (Satori + Sharp)
- RSS feeds: `/blog.rss.xml`, `/links.rss.xml`, `/worklog.rss.xml`

### Key Patterns

- **Solid.js** for interactive client-side components (`src/components/solid/`) — used for the links feed filtering
- **Layouts** in `src/layouts/` — BaseLayout, BlogPostLayout, NoteLayout, PageLayout, MarkdownLayout, ContentLayout
- **Data fetching** in `src/fetching/` — modules for links (Otter API), music (Last.fm + Spotify), movies (Letterboxd), media
- **Site constants** in `src/consts.ts` — navigation, metadata, jobs, projects all defined here
- **TypeScript path aliases**: `~/assets/*`, `~/components/*`, `~/layouts/*`, `~/utils/*`

### Styling

- **PostCSS** with TailwindCSS + Typography plugin
- **Fluid typography** via Utopia-style CSS custom properties (`--step--2` to `--step-10`, `--space-4xs` to `--space-3xl`)
- Design tokens in `src/styles/global/vars.css`
- Scoped `<style>` blocks in `.astro` components

### Tooling

- **Biome** for linting and formatting (not ESLint/Prettier)
- **Wrangler** for Cloudflare types and local preview
- JSX import source is `solid-js` (configured in tsconfig)
- `__COMMIT_HASH__` is injected at build time via Vite define

### Environment Variables

Required for full functionality: `OTTER_API_KEY`, `LASTFM_API_KEY`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_KEY`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_INDEX_NAME`
