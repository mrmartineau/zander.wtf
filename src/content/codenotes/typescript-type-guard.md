---
title: TypeScript type guards and narrowing
tags:
  - typescript
  - interview
date: 2026-09-30
link: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
---

**Narrowing** is TypeScript working out a more specific type inside a block of code, based on a check you made. A **type guard** is that check. It runs at runtime (it's real JavaScript), and TypeScript uses it to narrow the type at compile time.

```ts
function format(value: string | number) {
  // value: string | number
  if (typeof value === 'string') {
    return value.toUpperCase() // value: string
  }
  return value.toFixed(2) // value: number
}
```

**In an interview, one sentence:** "A type guard is a runtime check, like `typeof`, `instanceof`, `in` or a function that returns `value is Type`, that tells TypeScript a value's type is narrower inside that branch."

Common narrowing:

- `unknown` or `any` → `string`
- `string | object | number` → `string`
- `number | null | undefined` → `number`
- `Cat | Dog` → `Cat`

## Built-in type guards

### `typeof`: primitives

```ts
function double(value: string | number) {
  if (typeof value === 'number') return value * 2
  return value.repeat(2)
}
```

`typeof` returns `'string'`, `'number'`, `'bigint'`, `'boolean'`, `'symbol'`, `'undefined'`, `'object'` or `'function'`. Careful: `typeof null === 'object'`.

### Truthiness

```ts
function greet(name?: string) {
  if (name) return `Hi ${name}` // name: string
  return 'Hi there'
}
```

This also rules out `''`. If an empty string (or `0`) is a valid value, check `!== undefined` instead.

### Equality

```ts
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    x.toUpperCase() // both must be string
  }
}

function len(value: string | null) {
  if (value === null) return 0
  return value.length // value: string
}
```

`value != null` (loose) rules out both `null` and `undefined` in one check.

### `instanceof`: classes

```ts
function describe(value: Date | string) {
  if (value instanceof Date) return value.toISOString()
  return value
}

try {
  riskyThing()
} catch (error) {
  // error: unknown
  if (error instanceof Error) console.error(error.message)
}
```

### `in`: does it have this property?

```ts
type Fish = { swim: () => void }
type Bird = { fly: () => void }

function move(animal: Fish | Bird) {
  if ('swim' in animal) return animal.swim() // animal: Fish
  return animal.fly() // animal: Bird
}
```

`in` also narrows `unknown` objects: after `typeof data === 'object' && data !== null && 'id' in data`, TypeScript knows `data.id` exists (as `unknown`).

### `Array.isArray`

```ts
function toArray(value: string | string[]) {
  return Array.isArray(value) ? value : [value]
}
```

## Discriminated unions

The most useful pattern. Give every member of a union the same property with a different literal value (the **discriminant**). Checking that property narrows to one member.

```ts
type State =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: string[] }

function render(state: State) {
  switch (state.status) {
    case 'loading':
      return 'Loading…'
    case 'error':
      return state.error.message // only exists on the error member
    case 'success':
      return state.data.join(', ')
  }
}
```

This is why React Query, reducers and API results often use `status` or `type` fields. You can't read `data` until you've checked the status.

### Exhaustive checks with `never`

If every case is handled, the value in the `default` branch has type `never`. Assign it to `never`: when someone adds a new member to the union, this line stops compiling and shows where to handle it.

```ts
function render(state: State) {
  switch (state.status) {
    case 'loading':
      return 'Loading…'
    case 'error':
      return state.error.message
    case 'success':
      return state.data.join(', ')
    default: {
      const unhandled: never = state
      throw new Error(`Unhandled status: ${JSON.stringify(unhandled)}`)
    }
  }
}
```

## Custom type guards: `value is Type`

When the built-in checks aren't enough, write a function that returns a **type predicate**: `value is Type`. If it returns `true`, TypeScript narrows the argument to `Type`.

### String

```ts
const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}
```

### Number

This rules out `NaN`, `Infinity`, `null` and `undefined`:

```ts
export const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value)
}
```

```ts
describe('isFiniteNumber', () => {
  it('should return true', () => {
    expect(isFiniteNumber(-1000)).toBe(true)
    expect(isFiniteNumber(0)).toBe(true)
    expect(isFiniteNumber(10)).toBe(true)
    expect(isFiniteNumber(Number.MAX_VALUE)).toBe(true)
  })
  it('should return false', () => {
    expect(isFiniteNumber(Infinity)).toBe(false)
    expect(isFiniteNumber(NaN)).toBe(false)
    expect(isFiniteNumber(undefined)).toBe(false)
    expect(isFiniteNumber(null)).toBe(false)
    expect(isFiniteNumber('Some value')).toBe(false)
    expect(isFiniteNumber({ some: 'value' })).toBe(false)
    expect(isFiniteNumber(() => 20)).toBe(false)
  })
})
```

### `isDefined`

```ts
const isDefined = <Value>(value: Value | undefined | null): value is Value => {
  return value !== null && value !== undefined
}
```

### An object from an API

Data from `fetch` or `JSON.parse` has no real type. Accept `unknown` and check it:

```ts
type User = { id: number; name: string }

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'name' in value &&
    typeof value.name === 'string'
  )
}

const data: unknown = await res.json()
if (isUser(data)) {
  data.name // data: User
}
```

For anything bigger than a few fields, use a schema library such as [Zod](https://zod.dev) or [Valibot](https://valibot.dev). A schema gives you the check **and** the type from one definition, so they can't drift apart:

```ts
import { z } from 'zod'

const User = z.object({ id: z.number(), name: z.string() })
type User = z.infer<typeof User>

const user = User.parse(await res.json()) // throws if the shape is wrong
```

### Filtering arrays

A type predicate works as a `filter` callback, and the result type narrows too:

```ts
const values = ['a', undefined, 'b', null]

const strings = values.filter(isDefined) // string[]
```

Since TypeScript 5.5, TypeScript **infers** the predicate for simple arrow functions, so you often don't need to write one:

```ts
const strings = values.filter((value) => value != null) // string[] in TS 5.5+
```

### A type guard can lie

TypeScript trusts your predicate completely. It doesn't check that the function body matches the type:

```ts
const isNumber = (value: unknown): value is number => true // compiles, but wrong
```

Keep guards small, and test them (like `isFiniteNumber` above).

## Assertion functions: `asserts value is Type`

An assertion function **throws** if the check fails, instead of returning a boolean. After the call, TypeScript treats the value as narrowed for the rest of the scope, with no `if` needed.

```ts
function assertIsDefined<T>(value: T, message = 'Value is not defined'): asserts value is NonNullable<T> {
  if (value === null || value === undefined) throw new Error(message)
}

const root = document.getElementById('root') // HTMLElement | null
assertIsDefined(root, '#root is missing')
root.append('Hello') // root: HTMLElement
```

A plain `asserts condition` version works like Node's `assert`:

```ts
function assert(condition: unknown, message = 'Assertion failed'): asserts condition {
  if (!condition) throw new Error(message)
}

assert(typeof id === 'string', 'id must be a string')
id.toUpperCase() // id: string
```

Assertion functions must be declared with an explicit type (a `function` declaration, or a `const` with a type annotation). A plain arrow function assigned to an un-annotated `const` doesn't work as an assertion.

## Type guard vs assertion function vs `as`

|  | Type guard | Assertion function | `as` (type assertion) |
| --- | --- | --- | --- |
| Signature | `(v): v is T` | `(v): asserts v is T` | `value as T` |
| Runtime check | yes | yes | **none** |
| On failure | returns `false` | throws | nothing: bugs later |
| Use with | `if`, `filter`, ternaries | validating inputs at the start | last resort, when you know more than TypeScript |

`as` doesn't check or convert anything. It only tells TypeScript to trust you. Prefer a guard.

## `unknown` vs `any`

- `any` turns type checking **off**. You can do anything with it, and mistakes aren't caught.
- `unknown` means "could be anything, so check first". You can't use it until you narrow it with a type guard.

Use `unknown` for data from outside (API responses, `JSON.parse`, `catch` errors), then narrow it.

## Summary

| Type guard | Use it to |
| --- | --- |
| Truthiness | rule out `null`, `undefined`, `''`, `0`, `false` |
| Equality (`===`, `!= null`) | narrow to a literal, or rule out `null`/`undefined` |
| `typeof` | narrow to a primitive (`string`, `number`, …) |
| `instanceof` | narrow to a class (`Date`, `Error`, …) |
| `in` | check a property exists; tell object types apart |
| `Array.isArray` | tell arrays from single values |
| Discriminated union | narrow a union on a shared `status`/`type` field |
| `value is T` function | reusable custom checks, `filter` callbacks |
| `asserts value is T` function | throw if an invariant is false, then carry on |

Related: [type check helpers](/notes/type-check-helpers/), [TypeScript functions](/notes/typescript-functions/), [TypeScript](/notes/typescript/), [typing `catch` errors](/notes/typescript-catch/).
