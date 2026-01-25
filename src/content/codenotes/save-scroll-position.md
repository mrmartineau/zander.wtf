---
title: Save scroll position
tags:
  - javascript
link: https://twitter.com/hakimel/status/1262337514741706752
date: 2023-01-21
---

```ts
let element = document.querySelector('.element')

let top = sessionStorage.getItem('element-scroll')

if (top !== null) {
  element.scrollTop = parseInt(top, 10)
}

window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('element-scroll', element.scrollTop)
})
```
