---
title: Object.groupBy
link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
tags:
  - javascript
  - typescript
date: 2026-09-29
emoji: 🧺
---

`Object.groupBy` splits a list into groups. Your callback returns the group name for each item, and you get back an object with one array per group.

It's a static method on `Object`, not an array method, so it works with any iterable: arrays, `Set`s, `Map` values, generators. It's Baseline 2024: all current browsers and Node 21+.

```js
Object.groupBy(items, (item, index) => groupKey)
```

## Basic usage

```js
const inventory = [
  { name: 'asparagus', type: 'vegetable', quantity: 5 },
  { name: 'banana', type: 'fruit', quantity: 0 },
  { name: 'goat', type: 'meat', quantity: 23 },
  { name: 'cherry', type: 'fruit', quantity: 5 },
]

const byType = Object.groupBy(inventory, (item) => item.type)
// {
//   vegetable: [{ name: 'asparagus', … }],
//   fruit: [{ name: 'banana', … }, { name: 'cherry', … }],
//   meat: [{ name: 'goat', … }],
// }
```

Destructure the groups you want:

```js
const { fruit = [], vegetable = [] } = Object.groupBy(inventory, (item) => item.type)
```

## Make up your own groups

The key doesn't have to be a field. Return anything you can work out from the item.

```js
// by a range
const byStock = Object.groupBy(inventory, ({ quantity }) =>
  quantity === 0 ? 'soldOut' : quantity < 10 ? 'low' : 'ok',
)

// by month
const byMonth = Object.groupBy(posts, (post) => post.date.slice(0, 7)) // '2026-09'

// by first letter, for an A–Z index
const byLetter = Object.groupBy(people, (person) => person.name[0].toUpperCase())
```

### Split into two lists

```js
const { done = [], todo = [] } = Object.groupBy(tasks, (task) => (task.completed ? 'done' : 'todo'))
```

Return names, not `true`/`false`. Keys are always strings, so a boolean becomes `'true'` and `'false'`.

## Group, then summarise

Turn the groups into rows with `Object.entries`:

```js
const orders = [
  { id: 1, category: 'tech', price: 1200 },
  { id: 2, category: 'home', price: 40 },
  { id: 3, category: 'tech', price: 80 },
]

const summary = Object.entries(Object.groupBy(orders, (order) => order.category)).map(
  ([category, items]) => ({
    category,
    count: items.length,
    revenue: items.reduce((total, order) => total + order.price, 0),
  }),
)
// [
//   { category: 'tech', count: 2, revenue: 1280 },
//   { category: 'home', count: 1, revenue: 40 },
// ]
```

If you only need the counts, `reduce` is lighter, because it doesn't build the arrays:

```js
const counts = orders.reduce((acc, order) => {
  acc[order.category] = (acc[order.category] ?? 0) + 1
  return acc
}, {})
// { tech: 2, home: 1 }
```

## `Map.groupBy`

The same, but it returns a `Map`. Use it when the key isn't a string: an object, a number you want to keep as a number, or a date.

```js
const alice = { name: 'Alice' }
const bob = { name: 'Bob' }

const tasks = [
  { title: 'Write tests', owner: alice },
  { title: 'Fix bug', owner: bob },
  { title: 'Deploy', owner: alice },
]

const byOwner = Map.groupBy(tasks, (task) => task.owner)
byOwner.get(alice) // [{ title: 'Write tests', … }, { title: 'Deploy', … }]
```

A `Map` also keeps the keys in the order they were first seen, and you can loop over it directly:

```js
for (const [owner, ownerTasks] of byOwner) {
  console.log(owner.name, ownerTasks.length)
}
```

## TypeScript

Needs `"lib": ["ES2024"]` (or `ESNext`) in `tsconfig.json`, and TypeScript 5.4+.

```ts
type Item = { name: string; type: 'fruit' | 'vegetable' | 'meat' }

const byType = Object.groupBy(inventory, (item) => item.type)
// Partial<Record<'fruit' | 'vegetable' | 'meat', Item[]>>

byType.fruit // Item[] | undefined
```

The result is `Partial`, because a group only exists if at least one item returned that key. Handle `undefined`:

```ts
const fruit = byType.fruit ?? []
```

## In React

Group once, then render a heading per group:

```tsx
function Contacts({ people }: { people: Person[] }) {
  const byLetter = Object.groupBy(people, (person) => person.name[0].toUpperCase())

  return Object.entries(byLetter).map(([letter, group = []]) => (
    <section key={letter} aria-labelledby={`letter-${letter}`}>
      <h2 id={`letter-${letter}`}>{letter}</h2>
      <ul>
        {group.map((person) => (
          <li key={person.id}>{person.name}</li>
        ))}
      </ul>
    </section>
  ))
}
```

Sort the list **before** you group it. Each group keeps the items in their original order.

## Gotchas

- **Number-like keys are sorted.** Objects put keys such as `'2024'` or `'3'` first, in number order, whatever order they were seen in. Use `Map.groupBy` if the order matters.
- **The result has no prototype.** It's made with `Object.create(null)`, so `result.hasOwnProperty(…)` and `result.toString()` don't exist. Use `Object.hasOwn(result, key)` or `key in result`. `JSON.stringify` and `Object.entries` work as normal.
- **The groups hold the same objects**, not copies. Changing an item in a group changes it in the original list.
- **Keys become strings.** `undefined`, `null`, numbers and booleans are all turned into strings. Return `'none'` or similar for items without a value.

## Older runtimes

The `reduce` version, if you can't use `Object.groupBy`:

```js
const byType = inventory.reduce((groups, item) => {
  ;(groups[item.type] ??= []).push(item)
  return groups
}, {})
```

More in [Array methods](/notes/array-methods/) and [JS data transformation](/notes/js-data-transformation/).
