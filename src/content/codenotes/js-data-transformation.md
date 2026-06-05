---
title: Reshaping data in JavaScript
tags:
  - javascript
  - cheatsheet
  - interview
emoji: 🔀
date: 2026-05-19
link: https://lab.zander.wtf/data-transformation/
---

Data from an API almost never arrives in the shape your UI wants. A list needs grouping, two endpoints need joining, a keyed object needs to become an array you can `.map()` over in React. This note collects the array, object, `Map` and `Set` methods I reach for to get data from the shape it _is_ to the shape I _need_ — with realistic examples rather than `[1, 2, 3]` toys.

Every method here returns a **new** value rather than mutating the original. That's exactly what you want in a React component: derive what you render from props/state, never edit the source.

## The sample data

One dataset for the whole note — pretend it came back from `GET /orders`:

```js
const orders = [
  {
    id: 1,
    customer: 'Ada',
    product: 'Keyboard',
    category: 'tech',
    price: 80,
    status: 'shipped',
  },
  {
    id: 2,
    customer: 'Bram',
    product: 'Mug',
    category: 'home',
    price: 12,
    status: 'pending',
  },
  {
    id: 3,
    customer: 'Ada',
    product: 'Monitor',
    category: 'tech',
    price: 240,
    status: 'shipped',
  },
  {
    id: 4,
    customer: 'Cleo',
    product: 'Notebook',
    category: 'office',
    price: 6,
    status: 'cancelled',
  },
  {
    id: 5,
    customer: 'Bram',
    product: 'Desk',
    category: 'home',
    price: 320,
    status: 'shipped',
  },
  {
    id: 6,
    customer: 'Ada',
    product: 'Cable',
    category: 'tech',
    price: 9,
    status: 'pending',
  },
]
```

And a second endpoint, `GET /customers`, for the join example later:

```js
const customers = [
  { name: 'Ada', tier: 'gold' },
  { name: 'Bram', tier: 'silver' },
  { name: 'Cleo', tier: 'bronze' },
]
```

---

## `map` — reshape every item

`map` is a one-to-one transform: the output array has the same length as the input, but each item is whatever you return. Use it to **pick the fields a component needs** and drop the rest, or to add a computed field.

```js
// Trim each order down to just what a list row renders
const rows = orders.map((order) => ({
  id: order.id,
  label: `${order.product} — ${order.customer}`,
  priceLabel: `£${order.price}`,
}))
```

A common interview ask is "add a derived field". `map` plus spread keeps the original fields and tacks on new ones:

```js
const withTax = orders.map((order) => ({
  ...order,
  priceWithTax: Math.round(order.price * 1.2 * 100) / 100,
}))
```

## `filter` — keep a subset

`filter` returns the items where your callback is truthy. The output is the same shape as the input, just shorter.

```js
const shipped = orders.filter((order) => order.status === 'shipped')
```

Two patterns worth knowing:

```js
// filter(Boolean) drops null / undefined / '' / 0 — handy after a map
// that may produce gaps
const ids = orders.map((o) => o.giftCode).filter(Boolean)

// Filtering against a Set is cleaner than a chain of || comparisons
const wanted = new Set(['tech', 'home'])
const visible = orders.filter((order) => wanted.has(order.category))
```

## Chaining `filter` + `map`

The bread-and-butter pipeline: narrow the list, then reshape what's left. Order matters — filter first so `map` does less work.

```js
const pendingLabels = orders
  .filter((order) => order.status === 'pending')
  .map((order) => order.product)
// → ['Mug', 'Cable']
```

## `reduce` — collapse a list into one value

`reduce` is the general-purpose tool: anything `map` and `filter` can't express, `reduce` usually can. You give it an accumulator and decide what to do with each item.

**Sum** (the textbook case):

```js
const revenue = orders.reduce((total, order) => total + order.price, 0)
// → 667
```

**Tally / count occurrences** — build an object of counts:

```js
const countByStatus = orders.reduce((counts, order) => {
  counts[order.status] = (counts[order.status] ?? 0) + 1
  return counts
}, {})
// → { shipped: 3, pending: 2, cancelled: 1 }
```

**Min / max by a field** — keep a running winner:

```js
const priciest = orders.reduce((top, order) =>
  order.price > top.price ? order : top,
)
// → the Desk order
```

If you find yourself writing `reduce` and reaching for a plain object as the accumulator, check whether `Object.groupBy` or a `Map` says it more clearly first.

## Grouping — `Object.groupBy`

Splitting a flat list into buckets keyed by some field used to mean a fiddly `reduce`. `Object.groupBy` does it directly (Node 21+, and all current browsers):

```js
const byCategory = Object.groupBy(orders, (order) => order.category)
// → {
//     tech:   [ {id:1…}, {id:3…}, {id:6…} ],
//     home:   [ {id:2…}, {id:5…} ],
//     office: [ {id:4…} ],
//   }
```

`Map.groupBy` is the same but returns a `Map` — use it when your grouping key isn't a string (an object, a number you want kept as a number).

If you need to support older runtimes, the `reduce` equivalent is a useful snippet to keep around. `??=` creates the array the first time a key is seen:

```js
const byCategory = orders.reduce((groups, order) => {
  ;(groups[order.category] ??= []).push(order)
  return groups
}, {})
```

## Indexing — turn a list into a lookup

If you ever write `list.find(...)` _inside_ a loop, you've built an accidental O(n²). Index the list **once** into a `Map` keyed by id, then every lookup is O(1):

```js
const orderById = new Map(orders.map((order) => [order.id, order]))

orderById.get(3) // → the Monitor order, instantly
orderById.has(9) // → false
```

`new Map(arrayOfPairs)` is the key trick: `map` each item into a `[key, value]` pair and the `Map` constructor consumes them. Prefer `Map` over a plain object for lookups — it has a clean `.has()`/`.get()` API and won't collide with inherited keys like `constructor`.

## `Set` — dedupe and fast membership

A `Set` holds unique values. The single most common use is deduping — pull every distinct value of a field:

```js
const categories = [...new Set(orders.map((o) => o.category))]
// → ['tech', 'home', 'office']
```

`new Set(array)` drops duplicates; the `[...spread]` turns it back into an array so you can `.map()` it in JSX. A `Set` also gives O(1) `.has()`, which is why it's the right side of a `filter` (see the `filter` section above).

## Joining two datasets

Real apps stitch data from multiple endpoints. The wrong way is `orders.map` with a `customers.find` inside it. The right way: index one side into a `Map`, then `map` the other side against it.

```js
const tierByName = new Map(customers.map((c) => [c.name, c.tier]))

const enrichedOrders = orders.map((order) => ({
  ...order,
  tier: tierByName.get(order.customer) ?? 'none',
}))
// each order now carries the customer's tier
```

## Sorting without mutating

`sort` mutates the array in place — a problem when the array is React state or props. `toSorted` (ES2023) returns a sorted **copy**:

```js
const cheapestFirst = orders.toSorted((a, b) => a.price - b.price)
```

The comparator returns a number: negative keeps `a` first, positive swaps them. `a - b` for numbers; `a.localeCompare(b)` for strings. `toReversed` and `with(index, value)` are the same idea — non-mutating versions of `reverse` and index assignment. Pre-2023, spread first: `[...orders].sort(...)`.

## Objects ⇄ arrays

APIs love handing you an object keyed by id. React wants an array to render. `Object.entries` bridges the gap:

```js
const usersById = {
  u1: { name: 'Ada' },
  u2: { name: 'Bram' },
}

// keyed object → array (so you can .map() it in JSX)
const userList = Object.entries(usersById).map(([id, user]) => ({
  id,
  ...user,
}))

// …and back again
const backToObject = Object.fromEntries(userList.map((u) => [u.id, u]))
```

The `entries` → `map` → `fromEntries` round-trip also lets you transform an object's **values** while keeping its shape:

```js
const prices = { keyboard: 80, monitor: 240, cable: 9 }

const withSale = Object.fromEntries(
  Object.entries(prices).map(([name, price]) => [name, price * 0.9]),
)
// → { keyboard: 72, monitor: 216, cable: 8.1 }
```

`Object.keys` and `Object.values` are the narrower versions when you only need one side.

## `flat` — un-nest an array of arrays

`flat` takes an array that contains _other arrays_ and pulls the inner items up to the top level:

```js
const nested = [['a', 'b'], ['c'], ['d', 'e']]

const flattened = nested.flat()
// → ['a', 'b', 'c', 'd', 'e']
```

By default it only unwraps **one** level of nesting. For something deeper, pass a depth number — or `Infinity` to flatten all the way down:

```js
const deep = [1, [2, [3, [4]]]]

deep.flat() // → [1, 2, [3, [4]]]   one level (the default)
deep.flat(2) // → [1, 2, 3, [4]]    two levels
deep.flat(Infinity) // → [1, 2, 3, 4]
```

## `flatMap` — map, then flatten one level

`flatMap` is for one specific situation: you `map` over a list and the callback returns an **array** for each item. A plain `map` then leaves you with an array _of arrays_ — almost never the shape you actually want.

Picture a paginated API. It handed back three pages, and each page carries its own list of results:

```js
const pages = [
  { page: 1, results: ['Keyboard', 'Mug'] },
  { page: 2, results: ['Monitor', 'Notebook'] },
  { page: 3, results: ['Desk', 'Cable'] },
]
```

`map` gets you _almost_ there — but each page's results stay boxed up inside their own array:

```js
const stillNested = pages.map((page) => page.results)
// → [['Keyboard', 'Mug'], ['Monitor', 'Notebook'], ['Desk', 'Cable']]
```

Adding `.flat()` merges those inner arrays into one flat list. And that pairing — a `map` followed by a one-level `flat` — is _exactly_ what `flatMap` does in a single call:

```js
const mapThenFlat = pages.map((page) => page.results).flat()
const flatMapped = pages.flatMap((page) => page.results)
// both → ['Keyboard', 'Mug', 'Monitor', 'Notebook', 'Desk', 'Cable']
```

So there's nothing more to `flatMap` than "`map`, then `flat(1)`".

That framing also explains a handy side effect. Because each callback's array gets flattened away, the _length_ of the array you return decides how many items come out:

- return a one-item array `[x]` → the item is kept, as `x`
- return an empty array `[]` → the item vanishes entirely
- return a multi-item array `[x, y]` → that one item becomes several

Returning `[]` to drop an item is what lets `flatMap` act as a filter-and-map in one pass:

```js
// keep tech products only — [product] keeps it, [] drops it
const techProducts = orders.flatMap((order) =>
  order.category === 'tech' ? [order.product] : [],
)
// → ['Keyboard', 'Monitor', 'Cable']
```

A separate `filter` then `map` does the same job and reads more plainly when the two steps are distinct. Reach for `flatMap` when an item naturally expands into _zero or more_ results rather than exactly one.

## Rendering into a data grid

A data grid — TanStack Table, AG Grid — needs two separate things: **column definitions** and **row data**. The API hands you a flat array of objects, but the object _keys_ have to become columns while the objects themselves become rows. Splitting one into the other is a transform in its own right.

The quickest version derives the columns straight from the keys of a row:

```js
const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const columns = Object.keys(orders[0]).map((key) => ({
  accessorKey: key, // TanStack Table — AG Grid calls this `field`
  header: titleCase(key), // AG Grid calls this `headerName`
}))
// → [{ accessorKey: 'id', header: 'Id' }, { accessorKey: 'customer', header: 'Customer' }, …]
```

That trusts `orders[0]` to carry every key. If the data is sparse — some field missing on some records — collect the **union** of keys with a `Set` so no column gets dropped:

```js
const allKeys = [...new Set(orders.flatMap((order) => Object.keys(order)))]
```

Usually you don't want a column for _every_ field anyway: `id` is internal, the column order matters, and headers need real labels rather than raw key names. Drive the columns from an explicit map instead of from the data — `Object.entries` keeps it in the order you wrote:

```js
const COLUMNS = {
  customer: 'Customer',
  product: 'Product',
  category: 'Category',
  price: 'Price (£)',
}

const columns = Object.entries(COLUMNS).map(([key, header]) => ({
  accessorKey: key,
  header,
}))
```

The rows are often just the raw array — _but only_ when every cell value sits at the top level. Grids address a cell by a flat key, so a nested API response has to be flattened first: lift each nested leaf up to its own property.

```js
// API nested the customer: { customer: { name: 'Ada', tier: 'gold' }, … }
const rows = nestedOrders.map((order) => ({
  ...order,
  customer: order.customer.name,
  customerTier: order.customer.tier,
}))
// now a column with accessorKey 'customerTier' resolves to a real cell
```

TanStack Table will also accept a dotted `accessorKey: 'customer.tier'`, but flattening up front keeps sorting, filtering and CSV export working without each of them needing to understand the nesting.

---

## Putting it together

A realistic end-to-end transform: take the raw orders, drop cancelled ones, group by category, and produce a per-category summary ready to render.

```js
const ordersByCategory = Object.groupBy(
  orders.filter((order) => order.status !== 'cancelled'),
  (order) => order.category,
)

const summary = Object.entries(ordersByCategory).map(([category, group]) => ({
  category,
  orderCount: group.length,
  revenue: group.reduce((total, order) => total + order.price, 0),
}))
// → [
//     { category: 'tech', orderCount: 3, revenue: 329 },
//     { category: 'home', orderCount: 2, revenue: 332 },
//   ]
```

Each step does one job: `filter` narrows, `groupBy` buckets, `entries` makes it iterable, `map` shapes each bucket, `reduce` totals it. That's the whole game — pick the smallest method that does each step and chain them.

## Quick reference

| I want to…                          | Reach for                              |
| ----------------------------------- | -------------------------------------- |
| Reshape every item, same length out | `map`                                  |
| Keep only some items                | `filter`                               |
| Collapse a list to a single value   | `reduce`                               |
| Split a list into keyed buckets     | `Object.groupBy` / `Map.groupBy`       |
| Look an item up by id, repeatedly   | `new Map(list.map(x => [x.id, x]))`    |
| Get the unique values of something  | `[...new Set(values)]`                 |
| Merge data from two endpoints       | index one side in a `Map`, `map` other |
| Sort without mutating               | `toSorted`                             |
| Keyed object → renderable array     | `Object.entries(obj).map(...)`         |
| Array → keyed object                | `Object.fromEntries(pairs)`            |
| Transform an object's values        | `entries` → `map` → `fromEntries`      |
| Flatten one level of nesting        | `flat` / `flatMap`                     |
| Build grid columns from object keys | `Object.keys(row).map(...)`            |
