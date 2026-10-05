---
slug: lil-debugger
title: "Lil' Debugger"
subtitle: "I've hacked the same debug overlay into almost every job I've had, so I finally made it a proper package that shows the data behind any element when you hold Ctrl+Shift."
date: 2026-10-05
tags:
  - devtools
  - debug
  - typescript
  - side-project
---

Before you read on, hold <kbd>Ctrl</kbd>+<kbd>Shift</kbd>.

Go on, I'll wait.

You should see outlines appear around bits of this page. Hover one, and a small panel in the bottom-left corner tells you which Astro component made it, which file it lives in and what props it got. Let go and it's gone. No keyboard? [Open this page with `?lil-debug`](/blog/lil-debugger?lil-debug) and it starts switched on.

That's [Lil' Debugger](/lil-debugger), and every page on this site has it now.

## What have we got?

You put a `data-debug` attribute on an element. A label, an ID, a blob of JSON, whatever's useful. Hold the keys and the page shows it to you, along with the values of the elements around it.

```html
<div data-debug="user:42">…</div>
<section data-debug='{"plan":"pro","flags":["beta"]}'>…</section>
```

Then call it once, in the browser:

```js
import { lilDebugger } from '@mrmartineau/lil-debugger';

if (import.meta.env.DEV) lilDebugger();
```

That's it. No dependencies, and it doesn't care which framework you use, or if you use one at all.

## Why it exists

I've built some version of this at nearly every company I've worked at. There's always data that matters but never makes it on to the screen: a user ID, a feature flag, which variant of an A/B test you got, the API response a card was rendered from. You can dig through devtools or React DevTools for it, or you can just ask the element.

Every time, it was a quick hack in someone else's codebase that I left behind when I moved on. This time it's a real package on npm, with types and a few nice extras:

- <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> keeps it on
- <kbd>Alt</kbd>+click copies a value
- JSON gets pretty-printed
- It survives client-side routing

---

I'm not going to describe the rest. [The Lil' Debugger page](/lil-debugger) is the demo, and the docs are right there with it, so go and poke at it. Then grab it with `npm install -D @mrmartineau/lil-debugger`, or have a look at [the repo](https://github.com/mrmartineau/lil-debugger).
