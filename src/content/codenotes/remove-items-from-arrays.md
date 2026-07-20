---
title: Removing items from arrays
tags:
  - javascript
date: 2026-07-20
emoji: ❌
---

### Remove all matching items

`filter` is the first thing to reach for — it returns a new array and leaves the original alone:

```js
const removeAllItemsFromArray = (arr, value) => arr.filter((x) => x !== value)

// Usage
console.log(removeAllItemsFromArray([2, 5, 9, 1, 5, 8, 5], 5))
```

### Remove item at an index (without mutating)

ES2023's `toSpliced` is the immutable version of `splice`:

```js
const removeItemAtIndex = (arr, index) => arr.toSpliced(index, 1)

// Usage
console.log(removeItemAtIndex([2, 5, 9, 1, 5, 8, 5], 2))
```

### In-place variants with `splice`

If you actually want to mutate the array:

```js
const removeItemFromArray = (arr, value) => {
  const index = arr.indexOf(value)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

// Usage
console.log(removeItemFromArray([2, 5, 9, 1, 5, 8, 5], 5))
```

```js
const removeAllItemsFromArray = (arr, value) => {
  let i = 0
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1)
    } else {
      ++i
    }
  }
  return arr
}

// Usage
console.log(removeAllItemsFromArray([2, 5, 9, 1, 5, 8, 5], 5))
```
