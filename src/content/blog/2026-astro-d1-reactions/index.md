---
slug: astro-d1-reactions
title: 'Introducing astro-d1-reactions: hearts, reads and highlights for Astro in one integration'
subtitle: A new package to add hearts, reads, reader highlights and a stats page to your own Astro site
date: 2026-10-21
tags:
  - astro
  - cloudflare
  - side-project
---

I read Gabriel Valdivia's brilliant [Influence without authority](https://www.gabrielvaldivia.com/notes/influence-without-authority) article and saw a little bar at the bottom of the page. You could leave a heart, it showed how many people had read the post, and you could highlight a sentence you liked and see what other people had highlighted. I loved it. It made a quiet personal site feel a bit less like shouting into a void.

So I built one for this site. Then, because I can never leave things alone, I pulled it out into a package so anyone with an Astro site can have it too: [`astro-d1-reactions`](https://github.com/mrmartineau/astro-d1-reactions).

**TL;DR**

- One Astro integration gives you a pill fixed to the bottom of the page with hearts, unique reads and reader highlights
- Everything lives in [Cloudflare D1](https://developers.cloudflare.com/d1/) (like my [`astro-d1-search`](/blog/astro-d1-search-package)). The rest of your site can stay static
- The pill draws highlights with the [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API), so it never touches your page's DOM
- A `<Stats />` component gives you a public dashboard in one line. Mine is at [/stats](/stats)
- No cookies and no names. Theme it with a handful of CSS custom properties, swap the icons, add your own buttons

Scroll to the bottom of this page and you'll see it. Go on, give it a heart.

## What you get

The pill has three parts:

- **Hearts.** Each reader can give a page up to 10 hearts, and each one gets a different thank-you line. You can change those lines and the limit in the config
- **Reads.** A count of unique readers. Each person counts once per page, however many times they reload it
- **Highlights.** Select some text and a button pops up to save it. Everyone's highlights show up on the page in one colour and yours in another. Open the panel to see a list of them all, filter to just yours or just other people's, and click one to jump to it

Each heart and highlight also keeps the city and country that Cloudflare gives every request, so the list can say "highlighted by someone from Lisbon". That's the only thing it knows about you.

A reader is a random UUID kept in `localStorage`. No cookies, no accounts, no consent banner. The trade-off is that anyone can make up as many reader ids as they like, so it's not a bulletproof counter. It's a bit of fun on a personal site. I wouldn't bill a client on these numbers. If someone does start gaming it, a Cloudflare rate limiting rule on the API route sorts that out.

---

## Using it on your own site

You need an Astro site on Cloudflare with the [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter. Then it's four steps.

Install it and make a database:

```sh
pnpm add astro-d1-reactions
wrangler d1 create my-site-reactions
```

Add the binding to `wrangler.toml`. If you forget, the integration prints this snippet at startup:

```toml
[[d1_databases]]
binding = "REACTIONS_DB"
database_name = "my-site-reactions"
database_id = "<id from wrangler d1 create>"
migrations_dir = "node_modules/astro-d1-reactions/migrations"
```

Apply the migrations, locally and in production:

```sh
wrangler d1 migrations apply my-site-reactions --local
wrangler d1 migrations apply my-site-reactions --remote
```

Add the integration and drop the pill into your layout:

```js
// astro.config.mjs
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';
import reactions from 'astro-d1-reactions';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [reactions({ database: 'my-site-reactions' })],
});
```

```astro
---
import { Reactions } from 'astro-d1-reactions/components';
---

<article data-highlightable>
  <slot />
</article>
<Reactions />
```

That's it. With no props the pill uses the current path as its key.

Want to turn it off for one post? Spread `reactionsSchema` into your collection schema, pass the entry's data to the pill with `frontmatter={entry.data}`, and set `reactions: false` in that post's frontmatter. `highlights: false` keeps the hearts and reads but drops highlights.

And if you use a coding agent, the repo ships a skill that knows the setup order and the usual ways it goes wrong:

```sh
npx skills add mrmartineau/astro-d1-reactions
```

### Making it look like yours

I wanted this to be easy to drop into client sites too, so it shouldn't look like my site everywhere it goes. The styles read a set of custom properties, and the package's defaults have zero specificity, so your values win wherever you put them:

```css
:root {
  --rx-bg: #1d2127;
  --rx-line: #2b3038;
  --rx-accent: #f5d04c; /* hint bubble, your highlights, stats bars */
  --rx-heart: #e11d74;
  --rx-font: system-ui, sans-serif;
  --rx-bottom: 1rem; /* gap under the pill */
}
```

On this site I just point them at my existing colour tokens. You can swap the icons too. Give the `icons` option SVG markup or a path to an `.svg` file. The defaults are from [Phosphor](https://phosphoricons.com), so if you'd rather give a page a star than a heart, go for it.

---

## The stats page

Counting stuff is only fun if you can look at the counts, so I wanted them on a public page. [/stats](/stats) shows totals, every page with its reads, hearts and highlights, and a feed of recent activity.

In the package that's one component on a server-rendered page:

```astro
---
// src/pages/stats.astro
export const prerender = false;
import { Stats } from 'astro-d1-reactions/components';
import Layout from '../layouts/Layout.astro';
---

<Layout title="Stats">
  <Stats locale="en-GB" />
</Layout>
```

Titles come from your content collections. You tell the integration which pages exist and it reads each entry's `title` frontmatter, so a new post shows up on its own. This is my config:

```js
// astro.config.mjs
d1Reactions({
  database: 'zander-wtf-reactions',
  highlights: ['/blog/', '/notes/'],
  pages: [
    // Worklog first: the first match for a path wins.
    { collection: 'blog', where: 'worklog', url: '/blog/:slug', type: 'Worklog', noun: 'the worklog entry' },
    { collection: 'blog', url: '/blog/:slug', type: 'Post' },
    { collection: 'codenotes', url: '/notes/:slug', type: 'Note' },
    { collection: 'projects', url: '/projects/:slug', type: 'Project' },
    { url: '/uses', title: 'My setup' },
    { url: '/now', title: 'Now' },
    // …and the rest of the standalone pages
  ],
}),
```

The `pages` list is also a filter. Anyone can POST a made-up path to the API, and without the list those paths would end up on your stats page. With it, only real pages show.

If you want a different layout, the package exports `StatsTotals`, `StatsTable` and `StatsActivity` on their own. `loadStats()` gives you plain data to render however you like.

---

## How it fits into this site

This site is a bit odd. It comes in [four flavours](/blog/four-flavours): a normal website, a classic Mac desktop, a terminal UI and plain text. The pill had to fit around all of that.

I wrapped the package's `<Reactions>` component in my own `Reactions.astro` and put my flavour switcher in its slot. Anything you put in the default slot joins the pill, and the `after` slot is for popovers:

```astro
<Pill slug={slug ?? false} highlights={highlights} when="html.classic">
  <button
    type="button"
    class="reactions-seg"
    popovertarget="reactions-flavours"
    data-hint="this site comes in four flavours"
  >
    …
  </button>
  <nav slot="after" id="reactions-flavours" class="reactions-popover" popover>
    …
  </nav>
</Pill>
```

`class="reactions-seg"` gives the button the same look as the hearts, and `data-hint` is the little speech bubble that pops up on hover. The `when` prop means the pill only shows when `<html>` matches `html.classic`, so it stays out of the desktop and terminal modes.

`BaseLayout` renders the pill on every page. Pages that pass a slug get hearts and reads too, and blog posts and notes get highlights inside their `[data-highlightable]` element. Pages with no frontmatter set their own options through the layout:

```astro
<ContentLayout reactions={{ slug: '/stats', highlights: false }}>
```

There's also an admin mode. Set a `REACTIONS_ADMIN_TOKEN` secret, open any page with `#admin=<token>` in the URL once, and from then on that browser can delete anyone's highlights and its own reads stop counting. It's a URL fragment, so the token never reaches a server log.

---

## How it works

### One integration, one endpoint

The integration injects a single endpoint, `POST /api/reactions`. The pill sends it one of five actions, `state`, `view`, `heart`, `highlight` or `delete`, and gets the page's full state back every time:

```json
{ "views": 12, "hearts": 30, "myHearts": 2, "admin": false, "highlights": [] }
```

Only that endpoint and the stats page run on the server. Every other page can be prerendered as normal, which matters for me because this site is static and rebuilt every 12 hours.

### Three small tables

The schema ships with the package as D1 migrations, and it's tiny:

```sql
-- One row per reader per page: views are unique readers, not page loads.
CREATE TABLE views (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  PRIMARY KEY (slug, visitor)
) WITHOUT ROWID;

-- n is how many times this reader hearted this page (capped in the API).
CREATE TABLE hearts (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (slug, visitor)
) WITHOUT ROWID;
```

The primary key on `views` does the "unique reader" work for free. Insert the same reader twice and the database just says no.

The `migrations_dir` line from the setup points at the package's folder in `node_modules`, so when an update adds a migration you run `wrangler d1 migrations apply` and you're done. Unlike the search index from [`astro-d1-search`](https://github.com/mrmartineau/astro-d1-search), which gets thrown away and rebuilt on every deploy, this is real reader data. Migrations only ever add to it.

### Highlights without touching the DOM

This is my favourite bit. The usual way to show highlights is to wrap the text in `<mark>` elements. That means splitting text nodes, which fights with anything else that touches the page and gets messy fast when two highlights overlap.

The CSS Custom Highlight API skips all of that. You make a `Range`, hand it to the browser, and style it with `::highlight()`. The DOM stays exactly as it was:

```js
CSS.highlights.set('reactions-mine', new Highlight(...ranges));
```

```css
::highlight(reactions-mine) {
  background-color: color-mix(in oklch, var(--rx-accent) 30%, transparent);
}
```

The package saves a highlight as its text plus a character offset into the element marked `data-highlightable`. When the page loads, the pill walks the text nodes to turn that offset back into a `Range`. If I've edited the post since and the offset no longer lines up, it searches for the text anywhere in the article. If the text is gone completely, the highlight stays in the list but not on the page. So fixing a typo doesn't wipe out people's highlights.

---

It started as "ooh, that's nice, I want one" and turned into a package I can put on every Astro site I make. Have a play: heart this post, highlight a bit you liked, or a bit you think is wrong, then go and look at yourself on [/stats](/stats).

The code is on [GitHub](https://github.com/mrmartineau/astro-d1-reactions) and the package is on [npm](https://www.npmjs.com/package/astro-d1-reactions). If you use it, I'd love to see it.
