---
title: Looping and iterating in JavaScript
tags:
  - javascript
  - cheatsheet
  - interview
emoji: 🔁
date: 2026-09-30
link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
---

How to go through every item in arrays, objects, `Map`s, `Set`s, strings, DOM lists and your own data, and which loop to pick for each.

For the array methods one by one, see [Array methods](/notes/array-methods/). For turning data from one shape into another, see [Reshaping data in JavaScript](/notes/js-data-transformation/). For trees and nested data, see [Recursion](/notes/recursion/).

## Which loop?

| I have… | Use |
| --- | --- |
| An array, and I want a new array or value | `map`, `filter`, `reduce`, `find`… |
| An array, and I need `break`, `continue` or `await` | `for...of` |
| An array, and I need the index too | `for...of` with `.entries()`, or a plain `for` |
| An object | `Object.entries(obj)` with `for...of` or `.map()` |
| A nested object | a function that calls itself on each child object (see [Nested objects](#nested-objects)) |
| A `Map` or `Set` | `for...of` |
| A string | `for...of` (not an index loop) |
| A `NodeList`, `arguments` or other array-like thing | `for...of`, or `Array.from()` for array methods |
| An async stream of values | `for await...of` |
| A tree | recursion, or a loop with a stack |

## Pros and cons

| Option | Pros | Cons |
| --- | --- | --- |
| `for...of` | reads well; `break`, `continue` and `await` work; works on any iterable (arrays, strings, `Map`, `Set`, `NodeList`) | no index unless you use `.entries()`; doesn't work on plain objects |
| `for` (with `i`) | full control: step size, direction, look ahead; safe to remove items when going backwards | more to write, and easy to get the start or end wrong by one |
| `forEach` | short; gives you the item and the index | can't stop early; doesn't wait for `async` callbacks; returns nothing |
| `map`, `filter`, `reduce`… | say what you want in one word; return a new array without changing the original; chain together | always visit every item; each step builds a new array; `reduce` can be hard to read |
| `find`, `some`, `every` | stop at the first answer | only answer one question each |
| `for...in` | the only loop that goes through an object's keys directly | includes inherited keys; keys are always strings; wrong for arrays |
| `Object.keys` / `values` / `entries` | own keys only; give you an array, so every array method works | make a new array first |
| `while`, `do...while` | for when you don't know how many times the loop will run | easy to write a loop that never ends |
| `for await...of` | loops over values that arrive over time (streams, paginated APIs) | one at a time, so slower than `Promise.all` when the items don't depend on each other |
| Iterator helpers (`.values().filter()…`) | lazy: no array built at each step; `take` stops early | newer (Baseline 2025); fewer methods than arrays (no `sort`) |
| Recursion | the clearest code for trees and nested data | deep data can run out of stack; see [Recursion](/notes/recursion/) |

## Arrays

### `for...of`

The default loop. It gives you each **value**, and `break`, `continue`, `return` and `await` all work inside it.

```js
const fruits = ['apple', 'banana', 'cherry']

for (const fruit of fruits) {
  if (fruit === 'banana') continue
  console.log(fruit)
}

// with the index
for (const [index, fruit] of fruits.entries()) {
  console.log(index, fruit)
}
```

### Plain `for`

Use it when you need control over the index: stepping by 2, going backwards, or looking at the next item.

```js
for (let i = 0; i < fruits.length; i++) {
  console.log(i, fruits[i])
}

for (let i = fruits.length - 1; i >= 0; i--) {
  // backwards, safe to remove items with splice as you go
}
```

### `forEach`

Runs a function for each item and returns nothing. You **can't** `break` out of it, and it doesn't wait for `async` callbacks (see [Async loops](#async-loops)). If you want a result, use `map`, `filter` or `reduce`. If you want to stop early, use `for...of`.

```js
fruits.forEach((fruit, index) => {
  console.log(index, fruit)
})
```

### Array methods

Most of the time you don't need a loop at all. The array methods say what you want in one word:

```js
const prices = [80, 12, 240, 6]

prices.map((price) => price * 1.2) // change each item
prices.filter((price) => price > 10) // keep some
prices.reduce((total, price) => total + price, 0) // combine into one value
prices.find((price) => price > 100) // first match, then stop
prices.some((price) => price > 200) // true/false, stops at the first true
```

Full list in [Array methods](/notes/array-methods/).

### Don't use `for...in` on arrays

`for...in` gives you the **keys** as strings (`'0'`, `'1'`…), not the values. It also includes any extra enumerable properties added to the array or its prototype.

```js
for (const key in ['a', 'b']) {
  console.log(typeof key) // 'string', twice
}
```

## Stopping early

| Loop | Can stop early? |
| --- | --- |
| `for`, `for...of`, `while` | yes: `break` or `return` |
| `find`, `findIndex`, `some`, `every` | yes: they stop at the first answer |
| `forEach`, `map`, `filter`, `reduce` | no: they always visit every item |

To search, use `find` or `some`. Don't throw an error to get out of `forEach`.

## Objects

Objects aren't iterable, so `for...of` doesn't work on them directly. Turn them into an array first:

```js
const stock = { apples: 5, pears: 0, plums: 12 }

Object.keys(stock) // ['apples', 'pears', 'plums']
Object.values(stock) // [5, 0, 12]
Object.entries(stock) // [['apples', 5], ['pears', 0], ['plums', 12]]

for (const [fruit, count] of Object.entries(stock)) {
  console.log(`${fruit}: ${count}`)
}

const inStock = Object.entries(stock)
  .filter(([, count]) => count > 0)
  .map(([fruit]) => fruit) // ['apples', 'plums']
```

To change the values and keep an object, go through `entries` and back with `Object.fromEntries`:

```js
const doubled = Object.fromEntries(Object.entries(stock).map(([fruit, count]) => [fruit, count * 2]))
```

### `for...in` on objects

`for...in` loops over an object's keys, **including inherited ones** from its prototype. `Object.entries` and `Object.keys` only return the object's own keys, so prefer them. If you do use `for...in`, guard it:

```js
for (const key in stock) {
  if (!Object.hasOwn(stock, key)) continue
  console.log(key, stock[key])
}
```

### Key order

Object keys come back in this order: integer-like keys (`'1'`, `'42'`) in number order first, then string keys in the order they were added. If the order matters and your keys look like numbers, use a `Map`.

### Keys the usual methods skip

`Object.keys`, `values`, `entries` and `for...in` only see **enumerable string** keys. Two other methods see more:

```js
const id = Symbol('id')
const user = { name: 'Ada', [id]: 42 }
Object.defineProperty(user, 'secret', { value: 'x', enumerable: false })

Object.keys(user) // ['name']
Object.getOwnPropertyNames(user) // ['name', 'secret'] (non-enumerable too)
Reflect.ownKeys(user) // ['name', 'secret', Symbol(id)] (symbols too)
```

You rarely need these outside library code.

### Nested objects

`Object.entries` only goes one level deep. To reach every value in a nested object, the function calls itself on each value that is itself an object. This one flattens a nested object into dotted paths:

```js
const settings = {
  theme: { colour: 'teal', font: { size: 16, family: 'Inter' } },
  sounds: false,
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

function flattenObject(obj, prefix = '') {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (isObject(value)) {
      Object.assign(result, flattenObject(value, path))
    } else {
      result[path] = value
    }
  }
  return result
}

flattenObject(settings)
// { 'theme.colour': 'teal', 'theme.font.size': 16, 'theme.font.family': 'Inter', sounds: false }
```

Dotted paths are handy for forms, translation files and comparing two sets of settings.

The same walk without recursion keeps a list of objects still to visit (a stack). Take one off, look at its entries, and push any child objects back on. It has no depth limit:

```js
function flattenObjectWithStack(obj) {
  const result = {}
  const stack = [['', obj]]
  while (stack.length > 0) {
    const [prefix, current] = stack.pop()
    for (const [key, value] of Object.entries(current)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (isObject(value)) {
        stack.push([path, value])
      } else {
        result[path] = value
      }
    }
  }
  return result
}
```

The keys can come out in a different order, because the stack visits the last child object first. More patterns for nested data are in [Recursion](/notes/recursion/).

## `Map` and `Set`

Both are iterable, and they keep the order you added items in.

```js
const ages = new Map([
  ['Ada', 36],
  ['Bram', 29],
])

for (const [name, age] of ages) {
  console.log(name, age)
}

ages.keys() // iterator of names
ages.values() // iterator of ages

const tags = new Set(['css', 'js', 'css'])
for (const tag of tags) {
  console.log(tag) // 'css', 'js'
}
```

`keys()`, `values()` and `entries()` return **iterators**, not arrays. Spread them (`[...ages.values()]`) or use the [iterator helpers](#iterator-helpers) below to get array-like methods.

Careful with `forEach` on a `Map`: the callback gets `(value, key)`, the other way round from `entries`.

## Strings

`for...of` goes through a string by **code point**, so emoji and other characters outside the basic range stay whole. An index loop splits them in half:

```js
const text = 'hi 👋'

text.length // 5, because 👋 is two UTF-16 units
;[...text] // ['h', 'i', ' ', '👋']

for (const char of text) {
  console.log(char)
}
```

Some emoji are several code points joined together (👨‍👩‍👧, flags). To split text into the characters a person sees, use `Intl.Segmenter`:

```js
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
const chars = [...segmenter.segment('👨‍👩‍👧!')].map((s) => s.segment) // ['👨‍👩‍👧', '!']
```

## DOM lists and array-like things

`querySelectorAll` returns a `NodeList`. It's iterable and has `forEach`, but no `map` or `filter`. Use `for...of`, or turn it into an array with `Array.from`:

```js
for (const link of document.querySelectorAll('a')) {
  link.rel = 'noopener'
}

const hrefs = Array.from(document.querySelectorAll('a'), (link) => link.href)
```

`Array.from` takes an optional map function as its second argument, so the example above makes the array and maps it in one step. It also builds arrays from nothing:

```js
Array.from({ length: 5 }, (_, i) => i * 10) // [0, 10, 20, 30, 40]
```

## Static methods that go through a list

Some built-in functions aren't array methods but still take a whole list (any iterable) and go through it for you:

| Method | Takes | Returns |
| --- | --- | --- |
| `Array.from(iterable, mapFn?)` | any iterable or array-like | a new array |
| `Array.fromAsync(asyncIterable)` | an async iterable | a promise of an array |
| `Object.fromEntries(pairs)` | `[key, value]` pairs | an object |
| `Object.groupBy(items, fn)` | any iterable | an object of arrays, one per group |
| `Map.groupBy(items, fn)` | any iterable | a `Map` of arrays, one per group |
| `new Map(pairs)`, `new Set(items)` | any iterable | a `Map` or `Set` |
| `Promise.all(promises)` and friends | an iterable of promises | one promise |
| `Iterator.from(iterable)` | any iterable | an iterator with the helpers below |

`Object.keys`, `Object.values` and `Object.entries` go the other way: they turn an object **into** an array you can loop over. More on grouping in [Object.groupBy](/notes/object-groupby/).

## Async loops

`forEach` doesn't wait for promises. It starts every callback and moves on, so the code after it runs before any of them finish:

```js
// wrong: "done" logs before any user is saved
users.forEach(async (user) => {
  await save(user)
})
console.log('done')
```

Use `for...of` to go **one at a time**, or `Promise.all` to run them **all at once**:

```js
// one after another
for (const user of users) {
  await save(user)
}

// in parallel, and wait for all of them
await Promise.all(users.map((user) => save(user)))
```

Use `Promise.allSettled` if one failure shouldn't stop the others.

### `for await...of`

Loops over an **async iterable**: values that arrive over time. In Node, a file read line by line is one:

```js
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

const lines = createInterface({ input: createReadStream('access.log') })

for await (const line of lines) {
  if (line.includes(' 500 ')) console.log(line)
}
```

It also works on an array of promises, one result at a time in order. But `Promise.all` is usually clearer for that.

For paginated APIs where you don't know how many pages there are, a `while` loop is simpler. See [`while` and `do...while`](#while-and-dowhile).

## The iteration protocol

Anything with a `[Symbol.iterator]` method is **iterable**, so `for...of`, spread (`...`), destructuring, `Array.from`, `new Set` and the rest all work with it. Arrays, strings, `Map`s, `Set`s, `NodeList`s and `arguments` all have one. Plain objects don't.

To make your own class iterable, give it a `[Symbol.iterator]` method. The easiest way is to hand back the iterator of an array it already holds:

```js
class Playlist {
  #songs = []

  add(song) {
    this.#songs.push(song)
  }

  [Symbol.iterator]() {
    return this.#songs[Symbol.iterator]()
  }
}

const playlist = new Playlist()
playlist.add('Song A')
playlist.add('Song B')

for (const song of playlist) console.log(song)
const songs = [...playlist] // ['Song A', 'Song B']
```

For a range of numbers, `Array.from({ length }, fn)` from [DOM lists and array-like things](#dom-lists-and-array-like-things) does the job.

## Iterator helpers

Iterators now have their own `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every` and `find` (Baseline 2025). They're **lazy**: each item goes through the whole chain before the next one starts, and nothing extra is built.

```js
// Map values, without spreading into an array first
const adults = ages
  .values()
  .filter((age) => age >= 18)
  .toArray()

// the first 2 names in a Set, and stop there
const firstTwo = tags.values().take(2).toArray()

// any iterable, through Iterator.from
const upper = Iterator.from(document.querySelectorAll('h2'))
  .map((heading) => heading.textContent.toUpperCase())
  .toArray()
```

Array methods would build a whole new array at every step. Iterator helpers don't, which matters for big sources. For a normal array, the array methods are simpler.

## `while` and `do...while`

Use them when you don't know how many times the loop will run:

```js
let url = '/api/posts'
while (url) {
  const res = await fetch(url)
  const page = await res.json()
  url = page.next
}
```

`do...while` always runs the body at least once.

## Trees and nested data

Loops go through one level. For nested data (folders, comments, menus), call a function on each child, or use a loop with your own stack. Both are in [Recursion](/notes/recursion/).

## Performance

In current engines, `for`, `for...of` and `forEach` are all fast, and which is fastest changes between browsers and versions. Pick the one that reads best. Measure only when a loop is actually slow.

Things that do make a difference:

- `find` inside another loop is O(n²). Make a `Map` first, then look items up. See [Reshaping data](/notes/js-data-transformation/).
- Chaining `filter().map().slice(0, 5)` on a huge array does all the work before `slice` throws most of it away. Stop early with a `for...of` and `break`, or use iterator helpers with `take`.
- Don't use `for...in` on arrays. It's slow as well as wrong.
