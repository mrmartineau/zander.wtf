# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `pnpm` as the package manager.

```sh
pnpm dev            # Generate Wrangler types, then start Astro dev server
pnpm build          # Generate types + astro check + build for production
pnpm preview        # Preview with astro preview
pnpm preview:cf     # Preview the built dist with Cloudflare Pages (wrangler pages dev ./dist)
pnpm check          # Run astro type-check only
pnpm lint           # Biome lint
pnpm lint:fix       # Biome lint with auto-fix
pnpm format         # Biome format with auto-fix
pnpm lint:check     # Biome check (lint + format) with auto-fix
pnpm algolia:update # Re-index all codenotes into Algolia (requires ALGOLIA_ADMIN_KEY in env)
```

There are no test commands—vitest is a dev dependency but no test files exist yet.

## Architecture

### Site and deployment

Personal website for Zander Martineau (`https://zander.wtf`). Built as a **static site** (`output: 'static'`) deployed to **Cloudflare Pages** using the `@astrojs/cloudflare` adapter. The Cloudflare runtime provides env vars to server-side Astro pages via `Astro.locals.runtime.env`.

### Content collections (`src/content/`)

Three Astro content collections defined in `src/content/config.ts`:
- **`blog`** — MDX posts with `title`, `date`, optional `tags`, `subtitle`, `opengraphImage`
- **`codenotes`** — Markdown TILs/snippets with `title`, optional `tags`, `date`, `emoji`, `link`
- **`worklog`** — Markdown work changelog entries with `title` and `date`

### External data fetching (`src/fetching/`)

Page data that comes from external APIs is fetched at build time inside `.astro` frontmatter:
- **`links.ts`** — Fetches bookmarks from `otter.zander.wtf` (personal bookmarking app) using `SUPABASE_USER_ID` + `SUPABASE_USER_API_KEY`
- **`music.ts`** — Fetches top artists/albums from Last.fm (`LASTFM_API_KEY`) and enriches images via Spotify SDK (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`)
- **`media.ts`** — Fetches TV/film/book tracking data from `otter.zander.wtf` media API
- **`movies.ts`** — Fetches recent films from Letterboxd RSS

### Search

Code notes are full-text searched via **Algolia**. The search index is maintained separately by running `pnpm algolia:update` (uses `ALGOLIA_ADMIN_KEY`). The search page (`src/pages/notes/search.astro`) and `src/utils/algolia.ts` use the read-only `ALGOLIA_SEARCH_KEY` at runtime. Algolia env vars (`ALGOLIA_APP`, `ALGOLIA_SEARCH_KEY`, `ALGOLIA_INDEX`) are exposed to the Cloudflare runtime and accessed via `Astro.locals.runtime.env` in server endpoints.

### Interactive components

**SolidJS** (`@astrojs/solid-js`) is used for the handful of client-side interactive components under `src/components/solid/`: `LinkFeed.tsx`, `LinkFeedItem.tsx`, `LinkType.tsx`, `Favicon.tsx`, `ShortUrl.tsx`. All other components are static `.astro` files.

### Layouts hierarchy

- `BaseLayout.astro` — root HTML shell (head, header, main, footer)
- `PageLayout.astro` / `BlogPostLayout.astro` / `ContentLayout.astro` / `MarkdownLayout.astro` — page-type wrappers around BaseLayout
- `NoteLayout.astro` — notes-specific layout with a collapsible tag sidebar and search form

### Path aliases

Defined in `tsconfig.json`:
```
~/assets/*   → src/assets/*
~/components/* → src/components/*
~/layouts/*  → src/layouts/*
~/utils/*    → src/utils/*
```

### OG image generation

Dynamic OpenGraph images are generated per note/post at build time via `src/pages/opengraph/[slug]/` using **Satori** + **@resvg/resvg-wasm**.

### Site constants

`src/consts.ts` is the central store for: site title/metadata per page, nav items, footer items, about info, job history, and side projects list.

## Environment variables

Required in `.env` (local dev) and as Cloudflare Pages secrets (production):

| Variable | Purpose |
|---|---|
| `LASTFM_API_KEY` | Last.fm music data |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Spotify image enrichment |
| `SUPABASE_USER_ID` | Otter bookmarking API user ID |
| `SUPABASE_USER_API_KEY` | Otter bookmarking API auth |
| `ALGOLIA_APP` | Algolia application ID |
| `ALGOLIA_SEARCH_KEY` | Algolia search-only key (public) |
| `ALGOLIA_INDEX` | Algolia index name (e.g. `notes`) |
| `ALGOLIA_ADMIN_KEY` | Algolia admin key (only for `algolia:update` script) |
| `ZM_API` | Personal Cloudflare Worker API base URL |

Cloudflare-runtime env vars are typed in `src/env.d.ts` and `worker-configuration.d.ts`.

## Blog post guidelines

### File structure

Each post lives in its own directory under `src/content/blog/` named `YYYY-short-slug/index.md`. Use plain `.md` unless you need JSX — `.mdx` is available but rarely needed.

### Frontmatter

```yaml
---
slug: the-url-slug          # required — becomes the URL path
title: Post title           # required
subtitle: One-sentence summary of the post   # required — used as meta description and in listings
date: YYYY-MM-DD            # required
modified: YYYY-MM-DD        # optional — only add when updating an old post
tags:                       # optional — lowercase, kebab-case
  - css
  - react
opengraphImage: filename.jpg  # optional — filename relative to the post's directory
---
```

`subtitle` should be a single descriptive sentence that can stand alone as a summary. Tags are lowercase, hyphenated, and topic-scoped (e.g. `design-systems`, `side-project`, `nextjs`).

### Voice and tone

- Write in first person throughout — this is a personal site, not a publication.
- Be direct and opinionated. State preferences clearly and back them with reasoning.
- Conversational and informal: contractions, occasional mild profanity, self-deprecating humour all fit the register.
- Acknowledge mistakes and learning openly ("You live and learn I guess..").
- Don't condescend — assume a technically literate reader without over-explaining basics.

### Structure

Open with context or a personal hook, not a definition or generic intro. Get to the point quickly.

For technical posts, put a **TL;DR** bullet list early, right after the opening paragraph, before the first heading.

Use **H2** (`##`) for primary sections, **H3** (`###`) for subsections. Go to H4 only when genuinely necessary — posts typically stay at two heading levels.

Close with a short paragraph: a summary of key takeaways, a call-to-action (link to repo, try it yourself), or a forward-looking note. A brief P.S. is fine for minor additions.

### Code blocks

Always include a language tag. Prefer real-world examples over stripped-down demos. When showing a multi-step pattern, break it into multiple blocks with explanatory prose between them.

```md
\`\`\`ts
// code here
\`\`\`
```

### Images and media

Local images go in the post's directory and are referenced with a relative path or `~/assets/`. External images use full URLs.

Use raw HTML when you need layout control, e.g. a two-column screenshot grid:

```html
<div class="grid grid-cols-2 gap-7">
  <figure>
    <figcaption>Caption</figcaption>
    <img src="..." alt="..." />
  </figure>
</div>
```

Inline images that should not have a border: `<img ... class="inline border-none" />`. Centred standalone images: `class="mx-auto"`.

YouTube, Vimeo, and CodePen embeds use standard `<iframe>` tags directly in the markdown.

### Links

Link heavily — to external tools, docs, repos, and other posts on the site. Cross-link to related posts inline ("as I mentioned in my [previous article](...)"). Attribute ideas and quotes to their source.

### Miscellaneous

- Use `---` (horizontal rule) to create visual breathing room between major sections, not just between H2 headings.
- `**bold**` for important terms on first use; `*italics*` for emphasis.
- Blockquotes (`>`) for external quotes or a highlighted callout.
- Update notes for outdated posts: prepend an `Update:` line before the main content rather than editing the original prose.

## Linting / formatting

Uses **Biome** (not ESLint/Prettier). Config in `biome.json`: single quotes, 2-space indent, trailing commas, 80-char line width. For `.astro` files, `useConst`, `useImportType`, `noUnusedVariables`, and `noUnusedImports` rules are disabled.
