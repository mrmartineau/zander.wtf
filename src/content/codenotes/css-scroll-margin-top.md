---
title: Scroll-margin-top
tags:
  - css
link: https://mobile.twitter.com/JoshWComeau/status/1332015868725891076
date: 2020-12-29
---

You know that annoying thing where you jump to an anchor and the site's sticky header covers it up?

```css
.heading {
  scroll-margin-top: 72px;
}
```

In Tailwind, use a `scroll-mt-*` utility:

```html
<h2 id="section" class="scroll-mt-16">Section heading</h2>
```

Or use an arbitrary value to match your header height exactly:

```html
<h2 id="section" class="scroll-mt-[72px]">Section heading</h2>
```

Browser support: Works natively in Chrome, FF, Edge, Opera. Supported in Safari, but with a non-standard property, `scroll-snap-margin-top`.
