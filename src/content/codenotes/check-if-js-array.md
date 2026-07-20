---
title: Check if value is array in JavaScript
tags:
  - javascript
date: 2026-07-20
---

Use `Array.isArray()`. That's it — it handles every case, including values from other realms.

```js
Array.isArray([]) // true
Array.isArray('test') // false
Array.isArray({}) // false
```

## Why not the alternatives?

### `instanceof Array`

```js
;[] instanceof Array // true
'test' instanceof Array // false
```

Fails across realms: an array created in an iframe or worker has a different `Array` constructor, so `instanceof` returns `false` for a perfectly good array.

### `.constructor === Array`

```js
;[].constructor === Array // true
'foo'.constructor === Array // false
```

Throws on `null`/`undefined`, has the same cross-realm problem, and `constructor` can be reassigned so it's spoofable anyway.

From [Stack Overflow](https://stackoverflow.com/questions/767486/how-do-you-check-if-a-variable-is-an-array-in-javascript)
