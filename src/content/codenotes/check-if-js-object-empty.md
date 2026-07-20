---
title: Check if JavaScript object is empty
tags:
  - javascript
date: 2026-07-20
---

```js
if (obj != null && obj.constructor === Object && Object.keys(obj).length === 0) {
  // do something
}
```

The `constructor === Object` check matters — without it, things like `''`, `0`, `42` and `[]` also pass the "no keys" test and get treated as empty objects. `Object.keys` beats `Object.entries` here too: no point allocating all those `[key, value]` pairs just to count them.

As a function:

```ts
export const isObjectEmpty = (obj: unknown): boolean => {
  return (
    obj != null &&
    obj.constructor === Object &&
    Object.keys(obj).length === 0
  )
}

// isObjectEmpty({}) true
// isObjectEmpty({a: 1}) false
// isObjectEmpty([]) false
// isObjectEmpty('') false
```

You can also invert that function to check if an object has values.

```ts
export const isObjectFull = (obj) => !isObjectEmpty(obj)
```

Not sure about the naming of this one, but you get the idea
