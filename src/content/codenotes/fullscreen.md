---
title: Fullscreen video
emoji: 🍿
tags:
  - javascript
  - typescript
date: 2026-07-20
---

The old vendor-prefix cascade (`mozRequestFullscreen`, `webkitRequestFullscreen`, `msRequestFullscreen`) is dead — unprefixed `requestFullscreen()` is baseline everywhere now (Safari has had it since 16.4). So this is all you need:

```ts
const toggleFullscreen = (elem: HTMLElement) => {
  if (document.fullscreenElement) {
    return document.exitFullscreen()
  }

  return elem.requestFullscreen().catch((error) => {
    console.error(
      `Error attempting to enable fullscreen: ${error.message} (${error.name})`
    )
  })
}
```

`requestFullscreen()` returns a promise, so `.catch()` is the place to handle the user-gesture and permission failures. `document.fullscreenElement` tells you if something is already fullscreen (and what).

One remaining caveat: iPhone Safari only supports fullscreen on `<video>` elements — you can't fullscreen an arbitrary div there.
