---
slug: astro-git-dates
title: "astro-git-dates"
subtitle: "Set dates in Astro content collections from git. Write 'git Last Modified' as a date in the frontmatter and the build swaps in the file's last commit date, like Eleventy does."
date: 2026-10-01
type: package
status: active
repo: 'https://github.com/mrmartineau/astro-git-dates'
link: 'https://www.npmjs.com/package/astro-git-dates'
showReadme: true
tech: TypeScript, Astro
tags:
  - astro
  - git
  - typescript
  - npm
---

The Eleventy version of this site had `date: git Last Modified`, and I missed it after the move to Astro. My Code notes get edited for years, so a fixed date in the frontmatter is wrong the moment I touch the note again. This package brings the Eleventy feature back.

You wrap a collection's loader with `gitDates()`, and any top-level frontmatter field set to `git Last Modified` or `git Created` becomes that git date before the schema sees it. It's opt-in per entry, so old posts keep their real dates.

```ts
import { glob } from 'astro/loaders';
import { gitDates } from 'astro-git-dates';

const notes = defineCollection({
  loader: gitDates(glob({ pattern: '**/*.md', base: './src/content/notes' })),
  schema: z.object({ title: z.string(), date: z.date() }),
});
```

- Works with any loader that passes a file path, `glob()` included
- `git Created` follows renames, so a moved file keeps its first date
- Exports `gitLastModified()` and `gitCreated()` helpers for scripts outside a collection
- Agent skill: `npx skills add mrmartineau/astro-git-dates`

Your CI needs the full git history (`fetch-depth: 0` on GitHub Actions), or every file gets the same date.
