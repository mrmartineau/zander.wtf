---
title: Remove array duplicates with Set
tags:
  - javascript
emoji: ❌
date: 2023-12-01
link: https://www.samanthaming.com/tidbits/43-3-ways-to-remove-array-duplicates
---

## Using `Set`

This is [O(n)](/notes/big-o-notation/). The common `arr.filter((x, i) => arr.indexOf(x) === i)` trick is O(n²), because `indexOf` searches the array again for every item.

```js
const array = ['🐑', 1, 2, '🐑', '🐑', 3]

// Step 1
const uniqueSet = new Set(array)
// Set { '🐑', 1, 2, 3 }

// Step 2
const backToArray = [...uniqueSet]
// ['🐑', 1, 2, 3]

// or Step 1
const uniqueSet = [...new Set(array)]
// ['🐑', 1, 2, 3]
```
