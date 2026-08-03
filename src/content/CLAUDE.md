# Blog post guidelines

## File structure

Each post lives in its own directory under `src/content/blog/` named `YYYY-short-slug/index.md`. Use plain `.md` unless you need JSX — `.mdx` is available but rarely needed.

Worklog entries are part of the same `blog` collection but live in `src/content/blog/worklog/` as flat `YYYY-MM-DD-short-slug.md` files. See **Worklog entries** below. Drafts go in `src/content/blog/worklog/_drafts/` — the underscore keeps them out of both the build and the search index.

## Frontmatter

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

`subtitle` should be a single descriptive sentence that stands alone as a summary. Tags are lowercase, hyphenated, topic-scoped (e.g. `design-systems`, `side-project`, `nextjs`).

## Worklog entries

Short "here's what I shipped" notes — the changelog.md of Zander's work life. They live in `src/content/blog/worklog/` and share the `blog` schema, but are flagged so they render differently:

```yaml
---
slug: YYYY-MM-DD-short-slug   # required — keep the date prefix, it's the historical anchor
title: What got shipped       # required
subtitle: One-sentence summary of the entry   # required — see below
date: YYYY-MM-DD              # required
worklog: true                 # required — this is what distinguishes them
tags:                         # optional
  - otter
---
```

`worklog: true` makes the `/blog` listing render the entry **in full** inline, with an `id={slug}` anchor, instead of as a title-only row. Every entry also gets its own `/blog/:slug` page, and the explicit `slug` keeps that URL flat despite the `worklog/` subdirectory.

`subtitle` is required even though the body is short, because the compact homepage and search cards pass `worklogContent={false}` to `BlogList` and fall back to it — without one, the entry renders as a bare title there. One sentence summarising what shipped and why it matters.

Keep the body short — a paragraph or three, no headings, no TL;DR.

## Voice and tone

- First person throughout — this is a personal site, not a publication.
- Direct and opinionated. State preferences clearly and back them with reasoning.
- Conversational and informal: contractions, occasional mild profanity, self-deprecating humour all fit.
- Acknowledge mistakes and learning openly ("You live and learn I guess..").
- Don't condescend — assume a technically literate reader without over-explaining basics.

## Structure

Open with context or a personal hook, not a definition or generic intro. Get to the point quickly.

For technical posts, put a **TL;DR** bullet list early, right after the opening paragraph, before the first heading.

Use **H2** (`##`) for primary sections, **H3** (`###`) for subsections. H4 only when genuinely necessary — posts typically stay at two heading levels.

Close with a short paragraph: key takeaways, a call-to-action (link to repo, try it yourself), or a forward-looking note. A brief P.S. is fine for minor additions.

## Code blocks

Always include a language tag. Prefer real-world examples over stripped-down demos. For multi-step patterns, break into multiple blocks with explanatory prose between them.

## Images and media

Local images go in the post's directory, referenced with a relative path or `~/assets/`. External images use full URLs.

Use raw HTML when you need layout control, e.g. a two-column screenshot grid:

```html
<div class="grid grid-cols-2 gap-7">
  <figure>
    <figcaption>Caption</figcaption>
    <img src="..." alt="..." />
  </figure>
</div>
```

Inline images with no border: `<img ... class="inline border-none" />`. Centred standalone images: `class="mx-auto"`. YouTube, Vimeo and CodePen embeds use plain `<iframe>` tags directly in the markdown.

## Links

Link heavily — to external tools, docs, repos, and other posts on the site. Cross-link related posts inline ("as I mentioned in my [previous article](...)"). Attribute ideas and quotes to their source.

## Miscellaneous

- `---` (horizontal rule) for visual breathing room between major sections, not just between H2s.
- `**bold**` for important terms on first use; `*italics*` for emphasis.
- Blockquotes (`>`) for external quotes or a highlighted callout.
- Outdated posts: prepend an `Update:` line before the main content rather than editing the original prose.
