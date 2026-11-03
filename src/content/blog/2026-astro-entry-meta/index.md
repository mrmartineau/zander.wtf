---
slug: astro-entry-meta
title: "Introducing astro-entry-meta: drafts, reading time and git info for Astro collections"
subtitle: A new package that adds drafts, scheduled posts, reading time and git info to Astro content collections, and replaces astro-git-dates.
date: 2026-11-01
tags:
  - astro
  - side-project
  - content-collections
---

After I published [astro-git-dates](/blog/2026-10-01-git-dates), I made a list of what else Eleventy and Hugo do that Astro doesn't. These were things like drafts, scheduled posts, reading time and other Git-related information and metadata. It seemed to me that all these could be separate packages, but since they were all loosely related, I decided to create one package that covers all the features: [`astro-entry-meta`](https://github.com/mrmartineau/astro-entry-meta).

**TL;DR**

- It replaces `astro-git-dates`. Every `git Last Modified` and `git Created` keyword works the same, so switching is a new import and a new function name
- `draft: true`, a future `publishDate` or a past `expiryDate` leaves an entry out of the collection, like in [Hugo](https://gohugo.io/content-management/front-matter/)
- Computed fields: reading time, word count, an excerpt, the last author, an "Edit on GitHub" link. Anything you can work out from the body or from git
- One wrapper around your loader, no dependencies

An Astro content schema can't see an entry's body, but a loader can. That's why computed fields live here, and why a list page can show reading time without rendering every post. On this site it gives each post and code note a reading time, a word count and an edit link. `draft: true` posts are gone from the collection too, so `getBlog()` lost its draft filter. The site rebuilds every 12 hours, so a post with a `publishDate` appears by itself.

## Add it to your site

```sh
pnpm add astro-entry-meta
```

Wrap the loader of each collection that should use it:

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { entryMeta, gitInfo, readingTime, type GitInfo } from 'astro-entry-meta';

const blog = defineCollection({
  loader: entryMeta(glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }), {
    // Show drafts and scheduled posts in `astro dev`
    preview: import.meta.env.DEV,
    computed: {
      readingTime: ({ body }) => readingTime(body),
      git: ({ filePath }) =>
        filePath && gitInfo(filePath, { editUrl: 'https://github.com/me/site/edit/main/' }),
    },
  }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    // Computed fields must be in the schema, or it removes them
    readingTime: z.number(),
    git: z.custom<GitInfo>().optional(),
  }),
});

export const collections = { blog };
```

Now the frontmatter can do this:

```yaml
---
title: Coming soon
date: git Created
publishDate: 2026-12-01
---
```

And a page can show the rest:

```astro
<p>{post.data.readingTime} min read · <a href={post.data.git?.editUrl}>Edit on GitHub</a></p>
```

Two things to know. Git dates need the full history in CI, or every file gets the same date. On GitHub Actions, set `fetch-depth: 0` on the checkout step. And a scheduled post only appears when you rebuild after its date.

## Moving from astro-git-dates

```diff
- import { gitDates } from 'astro-git-dates';
+ import { entryMeta } from 'astro-entry-meta';

- loader: gitDates(glob({ ... })),
+ loader: entryMeta(glob({ ... })),
```

Nothing else changes.

The code is on [GitHub](https://github.com/mrmartineau/astro-entry-meta) and [npm](https://www.npmjs.com/package/astro-entry-meta). If you miss another Eleventy or Hugo feature in Astro, tell me.
