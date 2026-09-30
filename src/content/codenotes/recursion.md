---
title: Recursion
tags:
  - javascript
  - typescript
  - react
  - interview
date: 2026-09-29
emoji: 🪆
---

A recursive function calls itself. Each call works on a **smaller piece** of the problem, until the piece is so small that the answer is obvious.

Recursion fits data that is shaped like itself: a folder holds folders, a comment holds replies, a menu item holds a sub-menu, JSON holds JSON. For that kind of data, a recursive function is usually the shortest and clearest code. For a flat list, a loop or an array method is simpler.

## The two parts

Every recursive function needs:

1. **A base case**: the input is small enough to answer directly. This stops the recursion.
2. **A recursive case**: split off a smaller piece and call the function on it.

```js
function sum(numbers) {
  if (numbers.length === 0) return 0 // base case
  const [first, ...rest] = numbers
  return first + sum(rest) // recursive case: a smaller list
}

sum([1, 2, 3]) // 1 + sum([2, 3]) → 1 + 2 + sum([3]) → 1 + 2 + 3 + sum([]) → 6
```

No base case, or a recursive case that doesn't get smaller, means it never stops: `RangeError: Maximum call stack size exceeded`.

`sum` is a toy (use `reduce`). Recursion earns its place on trees.

## The sample tree

A file system, used for the rest of the note. Every node has the same shape, and `children` holds more nodes:

```js
const tree = {
  id: 'root',
  name: 'project',
  children: [
    {
      id: 'src',
      name: 'src',
      children: [
        { id: 'app', name: 'App.tsx', size: 1200, children: [] },
        {
          id: 'components',
          name: 'components',
          children: [
            { id: 'button', name: 'Button.tsx', size: 400, children: [] },
            { id: 'card', name: 'Card.tsx', size: 650, children: [] },
          ],
        },
      ],
    },
    { id: 'readme', name: 'README.md', size: 300, children: [] },
  ],
}
```

## Walking a tree

Most tree functions have the same shape: do something with this node, then call yourself on each child, then combine the results.

### Add up a value

```js
function totalSize(node) {
  const own = node.size ?? 0
  return own + node.children.reduce((sum, child) => sum + totalSize(child), 0)
}

totalSize(tree) // → 2550
```

### Find a node

Depth-first search (DFS): go all the way down one branch before you try the next.

```js
function findNode(node, id) {
  if (node.id === id) return node
  for (const child of node.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return undefined
}

findNode(tree, 'card') // → { id: 'card', name: 'Card.tsx', … }
```

### Get the path to a node (breadcrumbs)

```js
function pathTo(node, id, path = []) {
  const here = [...path, node.name]
  if (node.id === id) return here
  for (const child of node.children) {
    const found = pathTo(child, id, here)
    if (found) return found
  }
  return undefined
}

pathTo(tree, 'card') // → ['project', 'src', 'components', 'Card.tsx']
```

### Flatten a tree into a list

```js
const flatten = (node, depth = 0) => [
  { ...node, depth },
  ...node.children.flatMap((child) => flatten(child, depth + 1)),
]

flatten(tree).map((n) => '  '.repeat(n.depth) + n.name).join('\n')
// project
//   src
//     App.tsx
//     components
//       Button.tsx
//       Card.tsx
//   README.md
```

The `depth` is useful for indenting, and a flat list is what a virtualised list needs.

## Changing a tree without mutating it

In React state you must not edit the tree in place. Return a new tree instead.

### Update one node

```js
function updateNode(node, id, update) {
  if (node.id === id) return update(node)
  const children = node.children.map((child) => updateNode(child, id, update))
  const changed = children.some((child, i) => child !== node.children[i])
  return changed ? { ...node, children } : node // unchanged branches keep the same object
}

const renamed = updateNode(tree, 'readme', (node) => ({ ...node, name: 'README.txt' }))
```

Only the nodes on the path to the change are new. Every other branch is the same object as before, so `memo` and `===` checks can skip it.

### Remove a node

```js
function removeNode(node, id) {
  return {
    ...node,
    children: node.children.filter((child) => child.id !== id).map((child) => removeNode(child, id)),
  }
}
```

### Filter a tree (search)

Keep a node if it matches **or** any of its children match, so the parent folders stay visible around each result.

```js
function filterTree(node, matches) {
  const children = node.children.map((child) => filterTree(child, matches)).filter(Boolean)
  if (matches(node) || children.length > 0) return { ...node, children }
  return null
}

filterTree(tree, (node) => node.name.includes('Card'))
// project → src → components → Card.tsx
```

## Flat list → tree

Databases and APIs often send a tree as a flat list, where each row has a `parentId`:

```js
const rows = [
  { id: 1, parentId: null, text: 'Great post' },
  { id: 2, parentId: 1, text: 'Agreed' },
  { id: 3, parentId: 2, text: 'Me too' },
  { id: 4, parentId: null, text: 'Typo in para 2' },
]
```

The recursive way reads well, but it searches the whole list for every node, so it's O(n²):

```js
const childrenOf = (parentId) =>
  rows.filter((row) => row.parentId === parentId).map((row) => ({ ...row, children: childrenOf(row.id) }))

const comments = childrenOf(null)
```

For big lists, don't recurse. Index every row by id in a `Map`, then attach each row to its parent in one loop. That's O(n):

```js
function buildTree(rows) {
  const byId = new Map(rows.map((row) => [row.id, { ...row, children: [] }]))
  const roots = []
  for (const node of byId.values()) {
    const parent = byId.get(node.parentId)
    parent ? parent.children.push(node) : roots.push(node)
  }
  return roots
}
```

More on the `Map` trick in [Reshaping data in JavaScript](/notes/js-data-transformation/).

## Recursion vs a loop

Any recursive function can be written as a loop with your own stack. Do that when the tree can be very deep, or when you need breadth-first order.

### The call stack limit

Each call adds a frame to the call stack, and the stack has a limit. It's about 10,000 frames in Chrome and Node, more in other browsers, and fewer if each frame is big. A tree 50 levels deep is fine. A linked list with 100,000 items, handled one item per call, is not. JavaScript doesn't optimise tail calls (except in Safari), so you can't rely on that.

### Depth-first with a stack

Same result as the recursive `findNode`, with no limit on depth:

```js
function findNodeIterative(root, id) {
  const stack = [root]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node.id === id) return node
    stack.push(...node.children.toReversed()) // reversed, so the first child is checked first
  }
  return undefined
}
```

### Breadth-first with a queue

Breadth-first search (BFS) checks every node on one level before it goes down a level. Use it to find the **nearest** match, or to process a tree level by level. Instead of a stack, keep the current level in an array, and build the next level from its children:

```js
function levels(root) {
  const result = []
  let level = [root]
  while (level.length > 0) {
    result.push(level.map((node) => node.name))
    level = level.flatMap((node) => node.children)
  }
  return result
}

levels(tree)
// [['project'], ['src', 'README.md'], ['App.tsx', 'components'], ['Button.tsx', 'Card.tsx']]
```

### Which one to use

| Use recursion when… | Use a loop when… |
| --- | --- |
| the data is a tree or nested JSON | the data is a flat list |
| the depth is small (menus, comments, folders) | the depth could be thousands |
| you want the code to mirror the data | you need breadth-first order |
| it's a React component tree | you need to pause, resume or cancel part-way |

## Built-ins that already recurse

Check for these before you write your own:

- `array.flat(Infinity)` flattens any depth of nested arrays.
- `structuredClone(value)` makes a deep copy, and handles circular references.
- `JSON.parse(text, reviver)` and `JSON.stringify(value, replacer)` visit every nested value.
- `fs.readdir(dir, { recursive: true })` (Node 20+) lists every file in every subfolder.
- `element.querySelectorAll('…')` searches the whole DOM subtree.

## Memoisation: overlapping sub-problems

Some recursive functions solve the same sub-problem again and again. The classic is Fibonacci: `fib(5)` calls `fib(3)` twice, `fib(2)` three times, and so on. That's O(2ⁿ), see [Big O notation](/notes/big-o-notation/).

Cache each answer the first time you work it out:

```js
function fib(n, memo = new Map()) {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)
  const result = fib(n - 1, memo) + fib(n - 2, memo)
  memo.set(n, result)
  return result
}

fib(90) // instant; the naive version would take years
```

Now each `n` is computed once: O(n).

## Generators: walk a tree lazily

A recursive generator yields nodes one at a time. `yield*` hands over to the recursive call. The caller can stop early, and no array of every node is built.

```js
function* walk(node, depth = 0) {
  yield { node, depth }
  for (const child of node.children) yield* walk(child, depth + 1)
}

for (const { node, depth } of walk(tree)) {
  if (node.name.endsWith('.tsx')) console.log(depth, node.name)
}

// first file larger than 1 KB, and stop there
const big = walk(tree).find(({ node }) => node.size > 1000) // iterator helpers, Baseline 2025
```

## Async recursion

`await` works inside a recursive function. For example, fetch every page of a paginated API:

```js
async function fetchAll(url, results = []) {
  const res = await fetch(url)
  const { items, next } = await res.json()
  results.push(...items)
  return next ? fetchAll(next, results) : results
}
```

A `while (url)` loop does the same job with no depth limit. Prefer it when there could be thousands of pages.

## Cycles: graphs aren't trees

In a tree, every node has one parent. In a graph (a social network, linked pages, dependencies) you can go round in a loop, and a naive recursive walk never stops. Keep a `Set` of the nodes you've already visited:

```js
function reachable(graph, start, visited = new Set()) {
  if (visited.has(start)) return visited
  visited.add(start)
  for (const next of graph[start] ?? []) reachable(graph, next, visited)
  return visited
}

const graph = { a: ['b'], b: ['c'], c: ['a', 'd'], d: [] }
reachable(graph, 'a') // → Set {'a', 'b', 'c', 'd'}
```

## Recursive React components

A component can render itself. That's the natural way to show a tree: each node renders its own children with the same component.

```tsx
type Comment = { id: number; author: string; text: string; children: Comment[] }

function CommentThread({ comments }: { comments: Comment[] }) {
  return (
    <ul>
      {comments.map((comment) => (
        <li key={comment.id}>
          <p>
            <strong>{comment.author}</strong> {comment.text}
          </p>
          {comment.children.length > 0 && <CommentThread comments={comment.children} />}
        </li>
      ))}
    </ul>
  )
}
```

The base case is the empty `children` array: nothing more to render.

### Collapsible tree with `<details>`

Each node owns its open/closed state, so there's nothing to track in a parent. The native `<details>` and `<summary>` elements give you the toggle, keyboard support and screen reader support for free:

```tsx
type FileNode = { id: string; name: string; children: FileNode[] }

function FileTree({ node }: { node: FileNode }) {
  if (node.children.length === 0) return <li>{node.name}</li>

  return (
    <li>
      <details open>
        <summary>{node.name}</summary>
        <ul>
          {node.children.map((child) => (
            <FileTree key={child.id} node={child} />
          ))}
        </ul>
      </details>
    </li>
  )
}

// <ul><FileTree node={tree} /></ul>
```

For a full keyboard-driven tree widget (arrow keys between nodes), follow the [ARIA tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). It's a lot more work, so only do it when you need it.

### Pass the depth down

```tsx
type MenuItem = { label: string; href: string; children?: MenuItem[] }

function Menu({ items, depth = 0 }: { items: MenuItem[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? 'menu' : 'submenu'}>
      {items.map((item) => (
        <li key={item.href}>
          <a href={item.href}>{item.label}</a>
          {item.children && depth < 2 && <Menu items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}
```

A depth limit (`depth < 2`) is a second base case. It keeps a bad API response from rendering 50 levels of menu.

### Large trees

- Every node is a component, so a tree with thousands of visible nodes is slow. `flatten` only the **open** nodes into a list with a `depth`, and render that list with a virtualiser (TanStack Virtual), indenting by `depth`.
- Wrap the node component in `memo` so that changing one node doesn't re-render all the others. This works because `updateNode` above reuses every node it didn't change.

## Recursive types in TypeScript

A type can refer to itself:

```ts
type TreeNode<T> = {
  value: T
  children: TreeNode<T>[]
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }
```

Recursive utility types apply a change at every level:

```ts
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T
type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T

type Settings = { theme: { colour: string; font: { size: number } } }
const patch: DeepPartial<Settings> = { theme: { font: { size: 16 } } } // everything optional
```

Very deep or complex recursive types can hit `Type instantiation is excessively deep and possibly infinite`. Simplify the type, or add a depth limit.

More in the [TypeScript](/notes/typescript/) note.

## Common interview questions

All of these are "handle this item, recurse on the rest":

- Flatten a nested array without `flat()`.
- Deep clone or deep equal two objects.
- Sum the values of a nested object.
- Build a tree from a flat list with `parentId`.
- Render nested comments in React.
- All permutations or subsets of an array.

```js
// flatten without flat()
const flattenArray = (arr) =>
  arr.reduce((out, item) => out.concat(Array.isArray(item) ? flattenArray(item) : item), [])

flattenArray([1, [2, [3, [4]]]]) // → [1, 2, 3, 4]

// deep equal (plain objects, arrays and primitives)
function deepEqual(a, b) {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]))
}

deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }) // → true
```

## Gotchas

- **Missing or unreachable base case**: the stack overflows. Check that every recursive call gets closer to the base case.
- **Too deep**: the stack runs out at about 10,000 frames (in Chrome). Use a loop with a stack for deep data.
- **Cycles**: graphs and some object structures loop back on themselves. Track visited nodes in a `Set`.
- **Repeated work**: if the same sub-problem comes up many times, memoise it.
- **Mutation**: don't edit the tree in place when it's React state or shared data. Return new nodes, and reuse the unchanged ones.
