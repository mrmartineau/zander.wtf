---
title: TypeScript functions
tags:
  - typescript
  - interview
date: 2026-09-30
link: https://www.typescriptlang.org/docs/handbook/2/functions.html
---

How to type functions in TypeScript: parameters, return types, callbacks, generics, overloads and more.

## Parameters and return types

```ts
function add(a: number, b: number): number {
  return a + b
}

const multiply = (a: number, b: number): number => a * b
```

TypeScript always needs parameter types. It **infers** the return type, so you can often leave it out. Write it anyway when:

- the function is exported (the type is part of your public API, and a change to the body can't silently change it)
- the function is recursive (TypeScript can't infer it)
- you want an error inside the function if you return the wrong thing, rather than at every caller

### Optional, default and rest parameters

```ts
function greet(name: string, greeting?: string) {
  // greeting: string | undefined
  return `${greeting ?? 'Hello'}, ${name}`
}

function greet2(name: string, greeting = 'Hello') {
  // greeting: string (inferred from the default)
  return `${greeting}, ${name}`
}

function sum(...numbers: number[]) {
  return numbers.reduce((total, n) => total + n, 0)
}
```

Optional parameters must come after the required ones.

### Destructured parameters

The type goes after the whole pattern, not inside it:

```ts
type ButtonProps = { label: string; disabled?: boolean }

function Button({ label, disabled = false }: ButtonProps) {
  // …
}
```

`{ label: string }` inside a destructuring pattern would **rename** `label` to a variable called `string`. That's JavaScript syntax, not a type.

## Function types

Describe a function's shape with an arrow-like type:

```ts
type Formatter = (value: number) => string

const toPounds: Formatter = (value) => `£${value.toFixed(2)}` // value: number, inferred

function formatAll(values: number[], format: Formatter) {
  return values.map(format)
}
```

With an interface, use a call signature. This also lets the function have properties:

```ts
interface Counter {
  (): number // callable
  reset: () => void // and has a property
}
```

## `void` vs `undefined`

A function type that returns `void` means "the return value is ignored", **not** "returns nothing". So a callback typed `() => void` may still return something:

```ts
const list: number[] = []
;[1, 2, 3].forEach((n) => list.push(n)) // fine: push returns a number, forEach ignores it
```

A function **declaration** with `: void` must not return a value. Use `: undefined` only when callers need the actual `undefined`.

## `never`: functions that don't return

```ts
function fail(message: string): never {
  throw new Error(message)
}
```

After a call to a `never` function, TypeScript knows the code below it can't run. That's useful for narrowing:

```ts
function getPort(value: string | undefined) {
  const port = value ?? fail('PORT is not set')
  return Number(port) // port: string
}
```

## Generics

A generic function works with many types while keeping the link between input and output. The type parameter (`T`) is like a function parameter, but for types.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0]
}

first([1, 2, 3]) // number | undefined
first(['a', 'b']) // string | undefined
```

Without generics you'd write `any[]` and lose the type, or write one function per type.

### Constraints: `extends`

Limit what `T` can be, so you can use its properties:

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

longest('apple', 'fig') // string
longest([1, 2], [1, 2, 3]) // number[]
```

### `keyof`: a key of another parameter

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key])
}

const users = [{ name: 'Ada', age: 36 }]
pluck(users, 'name') // string[]
pluck(users, 'email') // error: "email" is not a key of the user
```

### `const` type parameters

`const` keeps literal types instead of widening them (TypeScript 5.0+):

```ts
function routes<const T extends readonly string[]>(paths: T) {
  return paths
}

routes(['/', '/about']) // readonly ['/', '/about'], not string[]
```

### Generic arrow functions in `.tsx`

In a `.tsx` file, `<T>` before an arrow function looks like JSX. Add a comma:

```tsx
const identity = <T,>(value: T) => value
```

## Overloads

Overloads let one function have different signatures, when the return type depends on the arguments in a way a union can't express. Write the public signatures first, then one implementation that handles them all:

```ts
function parse(value: string): number
function parse(value: string[]): number[]
function parse(value: string | string[]): number | number[] {
  return Array.isArray(value) ? value.map(Number) : Number(value)
}

parse('42') // number
parse(['1', '2']) // number[]
```

The implementation signature is hidden: callers only see the overloads above it.

Try a union or a generic first. Overloads are only needed when the return type **depends** on which argument type came in, as above.

## Typing `this`

Declare `this` as a fake first parameter. It's removed from the output:

```ts
function onClick(this: HTMLButtonElement, event: MouseEvent) {
  this.disabled = true
}

button.addEventListener('click', onClick)
```

Arrow functions don't have their own `this`, so they can't declare one.

## Async functions

An `async` function always returns a `Promise`:

```ts
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return res.json()
}
```

`res.json()` returns `Promise<any>`, so the `Promise<User>` return type is what gives callers a real type. That's a promise you're making, not a check. See [type guards](/notes/typescript-type-guard/) for validating the data.

## Type guards and assertion functions

Two special return types narrow the argument for the caller:

```ts
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new Error('Not a string')
}
```

Full details in [TypeScript type guards and narrowing](/notes/typescript-type-guard/).

## Getting types from functions

Reuse a function's types without writing them again:

```ts
function createUser(name: string, age: number) {
  return { id: crypto.randomUUID(), name, age }
}

type NewUser = ReturnType<typeof createUser> // { id: string; name: string; age: number }
type CreateUserArgs = Parameters<typeof createUser> // [name: string, age: number]

type LoadedUser = Awaited<ReturnType<typeof getUser>> // unwraps the Promise
```

More utility types in the [TypeScript](/notes/typescript/) note.

## React event handlers

```tsx
function Search() {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <form onSubmit={onSubmit}>
      <input onChange={onChange} />
    </form>
  )
}
```

To pass a handler as a prop, reuse the element's own type:

```tsx
type Props = { onClick: React.ComponentProps<'button'>['onClick'] }
```

Or write the handler inline: TypeScript infers the event type from the JSX attribute.

## Common interview questions

- **What's the difference between `unknown` and `any`?** `any` turns checking off. `unknown` forces you to narrow before use.
- **What's `never`?** The type with no values: a function that never returns, or a case that can't happen (exhaustive checks).
- **`void` vs `undefined`?** `void` means the return value is ignored. `undefined` is an actual value.
- **Why use generics?** To keep the link between input and output types without `any`.
- **When would you use overloads?** When the return type depends on the argument type in a way a union or generic can't express.
- **What's a type guard?** A runtime check that narrows a type in that branch. See [type guards](/notes/typescript-type-guard/).
