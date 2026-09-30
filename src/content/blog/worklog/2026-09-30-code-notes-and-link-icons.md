---
slug: 2026-09-30-code-notes-and-link-icons
title: "More code notes, and an icon for external links"
subtitle: "Nine new code notes, a few rewrites, and a small arrow after any link in a post or note that goes to another site."
date: 2026-09-30
worklog: true
tags:
  - zander-wtf
---

I've been adding to the [code notes](/notes) again. The new ones are [debounce](/notes/debounce/), [throttle](/notes/throttle/), [AbortController](/notes/abort-controller/), [Object.groupBy](/notes/object-groupby/), [recursion](/notes/recursion/), [TypeScript functions](/notes/typescript-functions/), [TanStack Table](/notes/tanstack-table/), [TanStack Form](/notes/tanstack-form/) and [QMD](/notes/qmd/). I also rewrote the [type guards](/notes/typescript-type-guard/) and [IntersectionObserver](/notes/intersection-observer/) notes. The IntersectionObserver one had a React hook that rebuilt its observer on every render, which I'd been copying around for a while. The [interview questions](/notes/technical-job-interview-questions/) have a Next.js section now too.

Links in posts and notes that go to another site now end with a small arrow. [rehype-external-links](https://github.com/rehypejs/rehype-external-links) adds it when the site builds, along with hidden "(external site)" text for screen readers. I turned off its default `rel="nofollow"`, because I'm linking to these sites on purpose.
