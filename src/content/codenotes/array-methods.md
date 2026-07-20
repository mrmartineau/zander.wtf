---
title: Array methods summarised
tags:
  - javascript
date: 2026-07-20
---

## Intro

JavaScript Arrays have lots of built in methods on their prototype. Some of them _mutate_ - ie, they change the underlying array in-place. Luckily, most of them do not - they instead return an entirely distinct array. Since arrays are conceptually a contiguous list of items, it helps code clarity and maintainability a lot to be able to operate on them in a "functional" way. (I'll also insist on referring to an array as a "list" - although in some languages, `List` is a native data type, in JS and this post, I'm referring to the concept. Everywhere I use the word "list" you can assume I'm talking about a JS Array) This means, to perform a single operation on the list as a whole ("atomically"), and to return a _new_ list - thus making it much simpler to think about both the old list and the new one, what they contain, and what happened during the operation.

Below are some of the methods that _iterate_ - in other words, that operate on the entire list, one item at a time. When you call them, you provide a _callback function_ - a single function that expects to operate on one item at a time. Based on the Array method you've chosen, the callback gets specific arguments, and may be expected to return a certain kind of value - and (except for `forEach`) the return value determines the final return value of the overarching array operation. Although most of the methods are guaranteed to execute for _each_ item in the array - for all of them - some of the methods can stop iterating partway through; when applicable, this is indicated below.

All array methods iterate in what is traditionally called "left to right" - more accurately (and less ethnocentrically) from index `0`, to index `length - 1` - also called "start" to "end". `reduceRight` is an exception in that it iterates in reverse - from `end` to `start`.

---

### `forEach`

- _callback answers_: here’s an item. do something nutty with it, i don't care what.
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: nothing - in other words, `undefined`
- _example use case_:

```js
;[1, 2, 3].forEach((item, index) => {
  console.log(item, index)
})
```

### `map`

- _callback answers_: here’s an item. what should i put in the new list in its place?
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: list of new items
- _example use case_:

```js
const three = [1, 2, 3]
const doubled = three.map((item) => {
  return item * 2
})
console.log(three === doubled, doubled) // false, [2, 4, 6]
```

### `filter`

- _callback is a predicate_ - it should return a truthy or falsy value
- _callback answers_: should i keep this item?
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: list of kept items
- _example use case_:

```js
const ints = [1, 2, 3]
const evens = ints.filter((item) => {
  return item % 2 === 0
})
console.log(ints === evens, evens) // false, [2]
```

### `reduce`

- _callback answers_: here’s the result from the previous iteration. what should i pass to the next iteration?
- _callback gets these arguments_: `result`, `item`, `index`, `list`
- _final return value_: result of last iteration
- _example use case_:

```js
// NOTE: `reduce` and `reduceRight` take an optional "initialValue" argument, after the reducer callback.
// if omitted, it will default to the first item.
const sum = [1, 2, 3].reduce((result, item) => {
  return result + item
}, 0) // if the `0` is omitted, `1` will be the first `result`, and `2` will be the first `item`
```

`reduceRight`: (same as `reduce`, but in reversed order: last-to-first)

### `some`

- _callback is a predicate_ - it should return a truthy or falsy value
- _callback answers_: does this item meet your criteria?
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: `true` after the first item that meets your criteria, else `false`
- **note**: stops iterating once it receives a truthy value from your callback.
- _example use case_:

```js
const hasNegativeNumbers = [1, 2, 3, -1, 4].some((item) => {
  return item < 0
})
console.log(hasNegativeNumbers) // true
```

### `every`

- _callback is a predicate_ - it should return a truthy or falsy value
- _callback answers_: does this item meet your criteria?
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: `false` after the first item that failed to meet your criteria, else `true`
- **note**: stops iterating once it receives a falsy value from your callback.
- _example use case_:

```js
const allPositiveNumbers = [1, 2, 3].every((item) => {
  return item > 0
})
console.log(allPositiveNumbers) // true
```

### `find`

- _callback is a predicate_ - it should return a truthy or falsy value
- _callback answers_: is this item what you’re looking for?
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: the item you’re looking for, or undefined
- **note**: stops iterating once it receives a truthy value from your callback.
- _example use case_:

```js
const objects = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const found = objects.find((item) => {
  return item.id === 'b'
})
console.log(found === objects[1]) // true
```

### `findIndex`

- _callback is a predicate_ - it should return a truthy or falsy value
- _callback answers_: is this item what you’re looking for?
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: the index of the item you’re looking for, or `-1`
- **note**: stops iterating once it receives a truthy value from your callback.
- _example use case_:

```js
const objects = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const foundIndex = objects.findIndex((item) => {
  return item.id === 'b'
})
console.log(foundIndex === 1) // true
```

### `findLast`

- _callback is a predicate_ - it should return a truthy or falsy value
- _callback answers_: is this item what you’re looking for? (searching from the end)
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: the last item that matches, or `undefined`
- **note**: iterates from `end` to `start`, and stops once it receives a truthy value from your callback.
- _example use case_:

```js
const numbers = [1, 2, 3, 4, 5]
const lastEven = numbers.findLast((item) => {
  return item % 2 === 0
})
console.log(lastEven) // 4
```

### `findLastIndex`

- Same as `findLast`, but returns the _index_ of the last matching item, or `-1`.

```js
const numbers = [1, 2, 3, 4, 5]
const lastEvenIndex = numbers.findLastIndex((item) => {
  return item % 2 === 0
})
console.log(lastEvenIndex) // 3
```

### `flatMap`

- _callback answers_: here’s an item. what should i put in the new list in its place? (and if you return a list, i’ll flatten it one level)
- _callback gets these arguments_: `item`, `index`, `list`
- _final return value_: new list, flattened by one level
- **note**: equivalent to `.map(...).flat()`, but in a single pass. Great for "map, but sometimes zero or many results per item".
- _example use case_:

```js
const sentences = ['hello world', 'foo bar']
const words = sentences.flatMap((item) => {
  return item.split(' ')
})
console.log(words) // ['hello', 'world', 'foo', 'bar']
```

### `sort`

- _callback is a comparator_ - it should return either a number either < 0, 0, or > 0
- _callback answers_: how do the two items compare with each other
- _callback gets these arguments_: `oneElement`, `theOtherElement`
- _final return value_: `number < 0`, if `oneElement` should preceed `theOtherElement`, `0` to keep the relative order, `> 0` to place `oneElement` at a later index than `theOtherElement`
- **note**: `sort` _mutates_ the array in-place (and returns the same array). If you don't want that, use [`toSorted`](#tosorted) below.
- _example use case_:

```js
const objects = ['John', 'Doe', 'Foo', 'Bar']
const sortedObjects = objects.sort((one, two) => -one.localeCompare(two)) // reverses the string in reverse order
console.log(sortedObjects) // ['John', 'Foo', 'Doe', 'Bar']
```

#### Compare function examples

```ts
export const compare = (a, b):number  => {
  if (a is less than b by some ordering criterion) {
    return -1;
  }
  if (a is greater than b by the ordering criterion) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

export const compareNumbers = (a:number, b:number) => {
  return a - b;
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const sortByDisplayOrder = (a: any, b: any): number => {
  return a.displayOrder - b.displayOrder
}

// Sort by property priority
export const sortByPropertyPriority = <T>(
  key: string,
  sortingOrder: Record<string, number>,
  order: 'asc' | 'desc' = 'asc',
) => {
  return (a: T, b: T): number => {
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line no-prototype-builtins
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0

    const first =
      a[key].toLowerCase() in sortingOrder
        ? sortingOrder[a[key]]
        : Number.MAX_SAFE_INTEGER
    const second =
      b[key].toLowerCase() in sortingOrder
        ? sortingOrder[b[key]]
        : Number.MAX_SAFE_INTEGER

    let result = 0
    if (first < second) {
      result = -1
    } else if (first > second) {
      result = 1
    }
    return order === 'desc' ? ~result : result
  }
}
```

---

## Change-by-copy methods (ES2023)

For years, a handful of array methods (`sort`, `reverse`, `splice`) broke the "return a new list" rule and mutated the array in-place - forcing you into the `[...array].sort()` dance. ES2023 finally fixed this with non-mutating counterparts. Each one returns a **new array** and leaves the original untouched.

### `toSorted`

- Non-mutating version of `sort`. Takes the same optional comparator callback.
- _final return value_: a new, sorted list
- _example use case_:

```js
const names = ['John', 'Doe', 'Foo', 'Bar']
const sorted = names.toSorted()
console.log(sorted) // ['Bar', 'Doe', 'Foo', 'John']
console.log(names) // ['John', 'Doe', 'Foo', 'Bar'] - untouched!
```

### `toReversed`

- Non-mutating version of `reverse`. No callback.
- _final return value_: a new list in reverse order
- _example use case_:

```js
const numbers = [1, 2, 3]
const reversed = numbers.toReversed()
console.log(reversed) // [3, 2, 1]
console.log(numbers) // [1, 2, 3]
```

### `toSpliced`

- Non-mutating version of `splice`. Same arguments: `start`, `deleteCount`, then any items to insert.
- _final return value_: a new list with items removed and/or inserted
- **note**: unlike `splice` (which returns the _removed_ items), `toSpliced` returns the new modified list.
- _example use case_:

```js
const months = ['Jan', 'Mar', 'Apr']
const fixed = months.toSpliced(1, 0, 'Feb')
console.log(fixed) // ['Jan', 'Feb', 'Mar', 'Apr']
console.log(months) // ['Jan', 'Mar', 'Apr']
```

### `with`

- Non-mutating version of bracket assignment (`array[index] = value`). Takes an `index` (negative counts from the end) and a `value`.
- _final return value_: a new list with the item at `index` replaced by `value`
- _example use case_:

```js
const numbers = [1, 2, 3]
const replaced = numbers.with(1, 99)
console.log(replaced) // [1, 99, 3]
console.log(numbers) // [1, 2, 3]

// negative indices work too
console.log(numbers.with(-1, 0)) // [1, 2, 0]
```

---

## Other useful newer methods

### `at`

- Like bracket access, but accepts negative indices - `at(-1)` is the last item. So much nicer than `array[array.length - 1]`.

```js
const numbers = [1, 2, 3]
console.log(numbers.at(-1)) // 3
console.log(numbers.at(0)) // 1
```

### `flat`

- Flattens nested arrays by a given depth (default `1`). Pass `Infinity` to flatten fully.

```js
const nested = [1, [2, [3, [4]]]]
console.log(nested.flat()) // [1, 2, [3, [4]]]
console.log(nested.flat(Infinity)) // [1, 2, 3, 4]
```

### `includes`

- Returns `true` if the array contains the given value. Simpler than `indexOf(x) !== -1`, and unlike `indexOf` it can find `NaN`.

```js
console.log([1, 2, 3].includes(2)) // true
console.log([Number.NaN].includes(Number.NaN)) // true
console.log([Number.NaN].indexOf(Number.NaN)) // -1 🙃
```

### `Object.groupBy`

- Not an array method (it's a static method on `Object`), but it iterates a list just like the methods above. Groups items into an object keyed by whatever your callback returns.
- _callback answers_: which group does this item belong to?
- _callback gets these arguments_: `item`, `index`

```js
const inventory = [
  { name: 'asparagus', type: 'vegetable' },
  { name: 'banana', type: 'fruit' },
  { name: 'cherry', type: 'fruit' },
]
const grouped = Object.groupBy(inventory, (item) => item.type)
// {
//   vegetable: [{ name: 'asparagus', ... }],
//   fruit: [{ name: 'banana', ... }, { name: 'cherry', ... }],
// }
```
