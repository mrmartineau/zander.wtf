---
title: Async cheatsheet
tags:
  - javascript
  - cheatsheet
date: git Last Modified
---

Pending promises can become either...

- `value`: Fulfilled with a value, or...
- `error`: Rejected with an error.
- `outcome`: Either way, they are settled with an outcome.

## Making promises

Most of the time you don't need `new Promise` — `fetch` and most modern APIs already return one. Wrap them in a function and return the promise.

`fetch` only rejects on a network failure. A 404 or a 500 still fulfils, so check `response.ok` yourself. More in the [Fetch](/notes/fetch/) note.

```js
function getJson(url) {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  })
}
```

Reach for `new Promise` when an API uses events or callbacks instead. The function passed to `new Promise` will be executed synchronously.

```js
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${src}`))
    img.src = src
  })
}
```

Sometimes you might not need reject, or might not resolve to a value.

```js
function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

await delay(1000)
```

Use `resolve()` or `reject()` to create promises from values. Handy when a function always returns a promise but sometimes already has the answer.

```js
function getUser(id) {
  if (!id) return Promise.reject(new Error('Missing user id'))
  if (cache.has(id)) return Promise.resolve(cache.get(id))
  return getJson(`/api/users/${id}`)
}
```

If you pass a promise to `Promise.resolve()`, you get the same promise back. They don't nest.

```js
const request = getJson('/api/user')
Promise.resolve(request) === request // true
```

`Promise.withResolvers()` (ES2024) gives you a promise plus its `resolve`/`reject` functions without the constructor callback dance. Useful when something outside the function settles the promise.

```js
// Before
let resolve, reject
const promise = new Promise((res, rej) => {
  resolve = res
  reject = rej
})

// ES2024
const { promise, resolve, reject } = Promise.withResolvers()
```

A real case: a confirm dialog you can `await`. `window.confirm()` does the same job, but it blocks the page and you can't style it.

`<form method="dialog">` does the button wiring for you. Clicking either button closes the dialog and puts the button's `value` in `dialog.returnValue`.

```html
<dialog id="confirm-dialog">
  <form method="dialog">
    <p></p>
    <button value="cancel">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>
```

The `close` listener is set up once, and it runs long after `confirmDialog()` has returned. It can't reach a `resolve` that only exists inside a `new Promise` callback. So `confirmDialog()` stores the resolvers in `answer`, and the listener settles them.

```js
const dialog = document.querySelector('#confirm-dialog')
let answer

// Set up once. Runs every time the dialog closes: either button, or the Esc key.
dialog.addEventListener('close', () => {
  answer.resolve(dialog.returnValue === 'confirm')
})

function confirmDialog(message) {
  answer = Promise.withResolvers()
  dialog.querySelector('p').textContent = message
  dialog.returnValue = '' // dialog.close() with no argument keeps the last answer, so clear it
  dialog.showModal()
  return answer.promise
}

// Usage
if (await confirmDialog('Delete this post?')) {
  await deletePost(post.id)
}
```

The same shape works whenever the answer arrives through a listener you set up once: a WebSocket reply, a message from an iframe, a third-party script's "ready" callback.

`Promise.try()` (ES2025) wraps a function that might return a value, a promise, or throw synchronously — either way you get a promise back, so one `.catch()` handles every case.

```js
// A plugin hook might be sync or async, and might throw
Promise.try(() => plugin.onLoad(config))
  .then(() => console.log(`${plugin.name} loaded`))
  .catch((error) => console.error(`${plugin.name} failed`, error))
```

## Chaining promises

Each `.then()` returns a new promise, so steps run one after another. One `.catch()` at the end handles a failure in any step.

```js
showSpinner()

getJson('/api/user')
  .then((user) => getJson(`/api/posts?author=${user.id}`))
  .then((posts) => renderPosts(posts))
  .catch((error) => showError(error.message))
  .finally(() => hideSpinner())
```

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

## Combining promises

### `Promise.all()`

Turns an array of promises into a promise of an array, in the same order. All the requests start at once, so this is as slow as the slowest one, not the sum of all of them.

```js
const [user, posts, settings] = await Promise.all([
  getJson('/api/user'),
  getJson('/api/posts'),
  getJson('/api/settings'),
])
```

If any promise rejects, `Promise.all` rejects straight away with that error. The other requests keep running, but their results are thrown away.

```js
// /api/settings returns a 500
await Promise.all([getJson('/api/user'), getJson('/api/settings')])
// -> rejects with Error('HTTP 500')
```

### `Promise.allSettled()`

Use `allSettled()` (ES2020) when you want every outcome — it never rejects, and resolves to an array of `{ status, value }` / `{ status, reason }` objects. Good for batches where one failure shouldn't stop the rest, such as uploads.

```js
const results = await Promise.allSettled(files.map((file) => uploadFile(file)))
// [
//   { status: 'fulfilled', value: { url: '/uploads/cat.jpg' } },
//   { status: 'rejected', reason: Error('File too large') },
// ]

const failed = files.filter((file, i) => results[i].status === 'rejected')
```

### `Promise.race()`

Settles with whichever promise settles first, fulfilled or rejected. The classic use is a timeout.

```js
const timeout = (ms) =>
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timed out')), ms))

const user = await Promise.race([getJson('/api/user'), timeout(5000)])
```

The losing promise isn't cancelled — the request carries on in the background. For `fetch`, `AbortSignal.timeout(5000)` actually cancels it. See the [AbortController](/notes/abort-controller/) note.

### `Promise.any()`

Use `any()` (ES2021) to get the first *fulfilled* promise. Rejections are ignored unless every promise rejects. Good for trying several mirrors and taking the fastest that works.

```js
const status = await Promise.any([
  getJson('https://eu.example.com/status'),
  getJson('https://us.example.com/status'),
])
```

If they all fail, it rejects with an `AggregateError`, and `error.errors` holds every reason.

## async/await

**Calling an async function always results in a promise.**

```js
(async () => value)() -> value
(async () => outcome)() -> outcome
(async () => { throw error })() -> error
```

`await` waits for a promise to settle. If it fulfils, you get the value. If it rejects, `await` throws the error, so you handle it with `try`/`catch`, like any other error.

```js
async function loadDashboard() {
  showSpinner()

  try {
    const user = await getJson('/api/user')
    const posts = await getJson(`/api/posts?author=${user.id}`)
    renderDashboard(user, posts)
  } catch (error) {
    // A rejected await lands here, and so does anything renderDashboard throws
    showError(`Could not load your dashboard: ${error.message}`)
  } finally {
    hideSpinner()
  }
}
```

Inside `try`, use `return await`, not just `return`. Without the `await`, the function returns the promise before it settles, so the `catch` never sees the error.

```js
async function getUserOrNull(id) {
  try {
    return await getJson(`/api/users/${id}`)
  } catch {
    return null
  }
}
```

Each `await` waits before the next line runs. In `loadDashboard` that's right, because the posts request needs `user.id`. When requests don't depend on each other, start them together with [`Promise.all()`](#promiseall).

You can pass non-promise values to `await`. You get the value back.

```js
const count = await 42 // 42
```

`await` only works inside async functions, or at the top level of an ES module.

`await` will wait until at least the next tick before returning, even when awaiting already-fulfilled promises or non-promise values.
