---
title: Type check helpers
tags:
  - javascript
  - typescript
  - cheatsheet
emoji: 🧪
date: 2026-09-30
---

Small functions that answer "is this value a…?" at runtime. Each one is a TypeScript [type guard](/notes/typescript-type-guard/): it returns `value is Type`, so after an `if (isString(x))` TypeScript knows `x` is a string.

All of these are also in my [kit package](https://github.com/mrmartineau/kit#type-checks), with tests, so you can import them from `@mrmartineau/kit/utils` instead of copying them.

```ts
import { isDefined, isPlainObject, isString } from '@mrmartineau/kit/utils'

const data: unknown = JSON.parse(localStorage.getItem('settings') ?? 'null')

if (isPlainObject(data) && isString(data.theme)) {
  document.documentElement.dataset.theme = data.theme // data.theme: string
}

const ids = [1, null, 2, undefined].filter(isDefined) // number[]
```

Use them on data you don't control: API responses, `JSON.parse`, `localStorage`, `postMessage`, `catch` errors. For whole objects from an API, a schema library ([Zod](https://zod.dev), [Valibot](https://valibot.dev)) is usually better than a pile of these.

## Why not just `typeof`?

`typeof` is fine for most primitives, but it has some well-known surprises:

| Value | `typeof` says |
| --- | --- |
| `null` | `'object'` |
| `[]` | `'object'` |
| `new Date()` | `'object'` |
| `NaN` | `'number'` |
| `class Foo {}` | `'function'` |
| an undeclared variable | `'undefined'` (no error) |

The helpers below deal with each of these.

## Primitives

```ts
export const isString = (value: unknown): value is string => typeof value === 'string'

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const isBigInt = (value: unknown): value is bigint => typeof value === 'bigint'

export const isSymbol = (value: unknown): value is symbol => typeof value === 'symbol'

export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === 'function'

type Primitive = string | number | bigint | boolean | symbol | null | undefined

export const isPrimitive = (value: unknown): value is Primitive =>
  value === null || (typeof value !== 'object' && typeof value !== 'function')
```

`isString` and friends don't match wrapper objects like `new String('a')`. Nobody should be making those.

## Numbers

`typeof NaN === 'number'`, so decide whether `NaN` and `Infinity` count. Usually they don't:

```ts
// any number, including NaN and Infinity
export const isNumber = (value: unknown): value is number => typeof value === 'number'

// a real, usable number: not NaN, not Infinity
export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isInteger = (value: unknown): value is number => Number.isInteger(value)
```

Use `Number.isFinite`, `Number.isInteger` and `Number.isNaN`, not the global `isFinite` and `isNaN`. The global ones convert the value first, so `isNaN('hello')` is `true` and `isFinite('42')` is `true`.

To check a string that should contain a number (a form field, a URL parameter), convert it first:

```ts
export const isNumericString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))

isNumericString('42') // true
isNumericString('4.2e3') // true
isNumericString('') // false: Number('') is 0
isNumericString('12px') // false
```

## `null` and `undefined`

```ts
export const isNull = (value: unknown): value is null => value === null

export const isUndefined = (value: unknown): value is undefined => value === undefined

// null or undefined ("nil")
export const isNil = (value: unknown): value is null | undefined => value == null

// the opposite, and it keeps the rest of the type
export const isDefined = <T>(value: T): value is NonNullable<T> => value != null
```

`value == null` is the one place loose equality is the right choice: it's `true` for `null` and `undefined` and nothing else.

`isDefined` is the one you'll use most, often with `filter`:

```ts
const ids = [1, null, 2, undefined, 3].filter(isDefined) // number[]
```

## Objects

"Object" means different things, so there are three helpers.

```ts
// anything typeof calls 'object', minus null: arrays, dates, maps, class instances…
export const isObjectLike = (value: unknown): value is object =>
  typeof value === 'object' && value !== null

// an object with string keys, not an array
export const isObject = (value: unknown): value is Record<string, unknown> =>
  isObjectLike(value) && !Array.isArray(value)

// only {} literals and Object.create(null): no arrays, dates, maps or class instances
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!isObjectLike(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
```

| Value | `isObjectLike` | `isObject` | `isPlainObject` |
| --- | --- | --- | --- |
| `{ a: 1 }` | ✅ | ✅ | ✅ |
| `Object.create(null)` | ✅ | ✅ | ✅ |
| `[]` | ✅ | ❌ | ❌ |
| `new Date()` | ✅ | ✅ | ❌ |
| `new Map()` | ✅ | ✅ | ❌ |
| `new (class Foo {})()` | ✅ | ✅ | ❌ |
| `null` | ❌ | ❌ | ❌ |

Use `isPlainObject` when you're about to go through the keys: merging settings, flattening nested objects (see [Looping and iterating](/notes/js-array-looping/#nested-objects)), deep-cloning JSON. A `Date` or `Map` has no useful keys and would be copied wrong.

`isPlainObject` returns `false` for a `{}` made in an iframe, because that iframe has its own `Object.prototype`. That rarely matters.

### Does it have this key?

```ts
export const hasKey = <K extends PropertyKey>(value: unknown, key: K): value is Record<K, unknown> =>
  isObjectLike(value) && Object.hasOwn(value, key)

if (hasKey(data, 'id') && isString(data.id)) {
  data.id.toUpperCase()
}
```

`Object.hasOwn` only looks at the object's own keys. `key in value` also finds inherited ones, like `toString`.

## Arrays

```ts
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

// an array where every item passes a check
export const isArrayOf = <T>(value: unknown, check: (item: unknown) => item is T): value is T[] =>
  Array.isArray(value) && value.every(check)

isArrayOf(['a', 'b'], isString) // true
isArrayOf(['a', 1], isString) // false
```

Always `Array.isArray`, never `instanceof Array`. See [Check if value is array](/notes/check-if-js-array/) for why.

## Built-in objects

```ts
// a Date that holds a real date, not new Date('nonsense')
export const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime())

export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp

export const isMap = (value: unknown): value is Map<unknown, unknown> => value instanceof Map

export const isSet = (value: unknown): value is Set<unknown> => value instanceof Set

export const isError = (value: unknown): value is Error => value instanceof Error
```

`new Date('nonsense')` is still a `Date`, so `instanceof Date` alone isn't enough. It's an "Invalid Date" whose `getTime()` is `NaN`.

`Error.isError(value)` is a newer built-in that also works for errors from other realms, like iframes. Check browser support before you rely on it. See [typing `catch` errors](/notes/typescript-catch/) for using `isError` in a `catch` block.

## Promises and iterables

```ts
// anything with a .then method: real promises and "thenables" from other libraries
export const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  isObjectLike(value) && typeof (value as { then?: unknown }).then === 'function'

// arrays, strings, Maps, Sets, NodeLists…: anything for...of can loop over
export const isIterable = (value: unknown): value is Iterable<unknown> =>
  value != null && typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] === 'function'
```

`isIterable('abc')` is `true`, because strings are iterable. Check `!isString(value)` as well if you want collections only.

## Empty values

"Empty" depends on the type, so one helper handles each:

```ts
export const isEmpty = (value: unknown): boolean => {
  if (value == null) return true
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0
  if (value instanceof Map || value instanceof Set) return value.size === 0
  if (isPlainObject(value)) return Object.keys(value).length === 0
  return false
}

isEmpty('') // true
isEmpty([]) // true
isEmpty({}) // true
isEmpty(new Map()) // true
isEmpty(0) // false: 0 is a value, not "empty"
isEmpty(new Date()) // false
```

`isEmpty(' ')` is `false`. Use `value.trim() === ''` if spaces should count as empty. For the single-type versions, see [Check if JavaScript array is empty](/notes/check-if-js-array-empty/) and [Check if JavaScript object is empty](/notes/check-if-js-object-empty/).

## Putting them together

The helpers combine into checks for whole objects:

```ts
type User = { id: number; name: string; tags: string[] }

export const isUser = (value: unknown): value is User =>
  isPlainObject(value) &&
  isFiniteNumber(value.id) &&
  isString(value.name) &&
  isArrayOf(value.tags, isString)

const data: unknown = await res.json()
if (!isUser(data)) throw new Error('Unexpected response')
data.tags.join(', ') // data: User
```

Past three or four fields, this is where a schema library pays off: you write the shape once and get both the check and the type.

## The `Object.prototype.toString` trick

Older libraries check types with this, because it gives a precise name for built-ins:

```ts
const typeName = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1)

typeName([]) // 'Array'
typeName(null) // 'Null'
typeName(new Date()) // 'Date'
typeName(/x/) // 'RegExp'
typeName(new Map()) // 'Map'
```

Any object can change its answer with `Symbol.toStringTag`, so it can be tricked. Prefer the specific helpers above.
