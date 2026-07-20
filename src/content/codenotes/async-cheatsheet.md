---
title: Async cheatsheet
tags:
  - javascript
  - cheatsheet
date: 2026-07-20
---

Pending promises can become either...

- `value`: Fulfilled with a value, or...
- `error`: Rejected with an error.
- `outcome`: Either way, they are settled with an outcome.

## Combining promises

Use `all()` to turn an array of promises into a promise to an array.

```js
Promise.all([value1, value2, value3]) -> [value1, value2, value3]
```

If any promise is rejected, the error will be passed through.

```js
Promise.all([?, ?, error]) -> error
```

Use `race()` instead to pass through the first settled promise.

```js
Promise.race([?, ?, value]) -> value
```

Use `allSettled()` (ES2020) when you want every outcome — it never rejects, and resolves to an array of `{ status, value }` / `{ status, reason }` objects.

```js
Promise.allSettled([value, error]) -> [
  { status: 'fulfilled', value },
  { status: 'rejected', reason: error },
]
```

Use `any()` (ES2021) to get the first *fulfilled* promise — it only rejects (with an `AggregateError`) if every promise rejects.

```js
Promise.any([error, value]) -> value
```

`Promise.withResolvers()` (ES2024) gives you a promise plus its `resolve`/`reject` functions without the constructor callback dance.

```js
const { promise, resolve, reject } = Promise.withResolvers()
```

`Promise.try()` (ES2025) wraps a function that might return a value, a promise, or throw synchronously — either way you get a promise back.

```js
Promise.try(() => maybeAsyncMaybeThrows())
```

## Combining promises

### `promise.then(onFulfilled, onRejected)`

Calls `onFulfilled` once the promise is fulfilled.

```js
value.then(value => nextValue, ...) -> nextValue
value.then(value => outcome, ...) -> outcome
value.then(value => throw error, ...) -> error
```

Calls onRejected if the promise is rejected.

```js
error.then(..., error => value) -> value
error.then(..., error => outcome) -> outcome
error.then(..., error => throw nextError) -> nextError
```

Passes errors through if onRejected is undefined.

```js
error.then(...) -> error
```

### `promise.catch( onRejected )`

Behaves identically to then when `onFulfilled` is omitted.

```js
error.catch(onRejected) <=> error.then(..., onRejected)
```

Passes fulfilled values through.

```js
value.catch(...) -> value
```

### `promise.finally( onFinally )`

Calls `onFinally` with no arguments once any outcome is available. Passes through input promise.

```js
outcome.finally(() => ...) -> outcome
```

The `onFulfilled`, `onRejected` and `onFinally` functions will not be executed until at least the next tick, even for promises that already have an outcome.

## Making promises

The function passed to new `Promise` will be executed synchronously.

```js
new Promise((resolve, reject) => {
  doImportantStuff((error, value) => {
    if (error) {
      reject(error)
    } else {
      resolve(value)
    }
  })
})
```

Use `resolve()` or `reject()` to create promises from values.

```js
Promise.resolve(value) -> value
Promise.reject(error) -> error
```

If you put a fulfilled promise into a fulfilled promise, they'll collapse into one.

```js
Promise.resolve(value) -> value
```

Sometimes you might not need reject, or might not resolve to a value.

```js
function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
```

## async/await

**Calling an async function always results in a promise.**

```js
(async () => value)() -> value
(async () => outcome)() -> outcome
(async () => throw error)() -> error
```

await waits for a promise to be fulfilled, then returns its value.

```js
async function() {
  try {
    let value = await outcome
    // ...
  }
  catch (error) {
    // ...
  }
}
```

You can pass non-promise values to await

```js
const fn = async () => {
  let value = await value
  // ...
}
```

`await` may only be used within async functions.

`await` will wait until at least the next tick before returning, even when awaiting already-fulfilled promises or non-promise values.
