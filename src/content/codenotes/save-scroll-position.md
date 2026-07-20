---
title: Save scroll position
tags:
  - javascript
link: https://twitter.com/hakimel/status/1262337514741706752
date: 2026-07-20
---

```ts
let element = document.querySelector('.element')

let top = sessionStorage.getItem('element-scroll')

if (top !== null) {
  element.scrollTop = parseInt(top, 10)
}

window.addEventListener('pagehide', () => {
  sessionStorage.setItem('element-scroll', element.scrollTop)
})
```

Use `pagehide` rather than `beforeunload` — `beforeunload` is unreliable on mobile and makes the page ineligible for the back/forward cache.

If you just want the browser to restore the whole page's scroll position, you don't need any of this — that's what [`history.scrollRestoration`](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) controls, and it's on by default.
