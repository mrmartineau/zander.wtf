---
title: Locking scroll
tags:
  - css
  - javascript
emoji: 🔒
date: 2026-07-21T15:30:00Z
---

When an overlay is open — modal, search palette, mobile nav — the page behind it shouldn't scroll. Deceptively fiddly to get right: the naive version causes layout shift when the scrollbar disappears, scroll chaining leaks through to the page, and iOS Safari has historically ignored the whole thing. Here's my packaged-up version.

## The CSS

```css
html {
  /* reserve the scrollbar space so nothing shifts when it disappears */
  scrollbar-gutter: stable;
}

html.scroll-locked {
  overflow: hidden;
}
```

`scrollbar-gutter: stable` is the modern fix for the "page jumps sideways when the scrollbar vanishes" problem — no more measuring scrollbar width in JS and faking it with `padding-right`.

And on the overlay itself, stop scroll chaining — without this, reaching the end of the overlay's own scrollable content starts scrolling the page behind it:

```css
.overlay {
  overscroll-behavior: contain;
}
```

## The JavaScript

Just toggle the class:

```ts
const lockScroll = () => {
  document.documentElement.classList.add('scroll-locked')
}

const unlockScroll = () => {
  document.documentElement.classList.remove('scroll-locked')
}
```

## CSS-only version with `:has()`

If the overlay's open state is already in the DOM (a `<dialog open>`, a checked checkbox, a `[data-open]` attribute), you can skip the JS entirely:

```css
html:has(dialog[open]) {
  overflow: hidden;
}
```

This is what I reach for first now — the lock can't get out of sync with the overlay because it's derived from the same state.

## iOS Safari

The long-standing gotcha: iOS Safari used to plain ignore `overflow: hidden` on `html`/`body` for touch scrolling. Modern iOS (16+) behaves, so for current browsers the above is enough. If you still need to support older iOS, the classic workaround is fixing the body in place and restoring the scroll position on unlock:

```ts
let scrollY = 0

const lockScroll = () => {
  scrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'
}

const unlockScroll = () => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  window.scrollTo(0, scrollY)
}
```

## Don't forget

- **`<dialog>.showModal()`** makes the backdrop inert and traps focus for free, but it does _not_ lock scroll — you still need one of the above (the `:has(dialog[open])` version pairs perfectly).
- Nested overlays: if two things can lock at once, a bare class toggle breaks when the first one closes. Keep a counter, or scope the `:has()` selector to cover all of them.
- A library that handles the edge cases (including old iOS): [body-scroll-lock](https://github.com/willmcpo/body-scroll-lock) — though I've not needed it since `scrollbar-gutter` and `:has()` landed everywhere.
