---
title: Clamp number
tags:
  - javascript
  - css
date: 2026-07-20
emoji: 🗜
---

## JavaScript

```ts
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

// clamp(21, 20, 50) > 21
// clamp(10, 20, 50) > 20
// clamp(80, 20, 50) > 50
```

There's a [TC39 proposal for `Math.clamp`](https://github.com/tc39/proposal-math-clamp) that would make this one-liner redundant eventually.

## CSS

`clamp()` has been supported everywhere since 2020, so just use it:

```css
body {
  font-size: clamp(16px, 4vw, 22px);
}
```
