---
title: Fetch
tags:
  - javascript
emoji: 🐕
link: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
date: 2026-07-20
---

Usage synopsis (use the argument links to find out more):

```js
fetch(url, options)
```

## GET

```js
const response = await fetch(url, { headers: {} })
const data = await response.json()

if (!data) {
  throw new Error('No data')
}

return data
```

## POST

Using `async/await`:

```js
const response = await fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin',
})

const data = await response.json()

if (!data) {
  throw new Error('No data')
}

return data
```

Using `then()`:

```js
const response = fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin',
}).then(
  (response) => {
    response.status //=> number 100–599
    response.statusText //=> String
    response.headers //=> Headers
    response.url //=> String

    return response.json()
  },
  function (error) {
    error.message //=> String
  }
)
```

## Timeout / cancellation with `AbortSignal`

Fetch has no `timeout` or `cancel()` of its own - cancellation is handled by the more general [`AbortController`/`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) API. The idea: an `AbortController` is the thing you hold on to and call `.abort()` on; its `.signal` is the read-only token you hand to the async operation you might want to cancel. When the controller aborts, anything holding that signal stops and the pending promise rejects.

### Cancelling a request manually

Pass `controller.signal` as the `signal` option, then call `controller.abort()` whenever you want to bail - user clicked cancel, component unmounted, whatever:

```js
const controller = new AbortController()

cancelButton.addEventListener('click', () => {
  controller.abort()
})

try {
  const response = await fetch(url, { signal: controller.signal })
  const data = await response.json()
} catch (error) {
  if (error.name === 'AbortError') {
    // cancelled on purpose - usually nothing to do
  } else {
    throw error
  }
}
```

A few things worth knowing:

- One controller can cancel **multiple** fetches - pass the same `signal` to each and a single `abort()` kills them all.
- A controller is single-use. Once aborted, it stays aborted - make a new one for the next request (the classic "cancel the previous search request" pattern).
- `abort()` takes an optional reason: `controller.abort(new Error('user cancelled'))` - the promise rejects with that instead of the default `AbortError`.
- Aborting also cancels a body read in progress (`response.json()` etc), not just the initial connection.

### Timeouts with `AbortSignal.timeout()`

For the common "give up after n ms" case you don't need a controller at all - `AbortSignal.timeout(ms)` makes a signal that aborts itself:

```js
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000),
})
// throws a TimeoutError DOMException if it takes longer than 5s
```

Note the different error names: a timeout rejects with a `TimeoutError`, a manual `abort()` rejects with an `AbortError`. Handy for distinguishing "too slow" from "cancelled on purpose":

```js
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
} catch (error) {
  if (error.name === 'TimeoutError') {
    // took too long
  } else if (error.name === 'AbortError') {
    // deliberately cancelled
  } else {
    throw error // network failure etc
  }
}
```

### Combining signals with `AbortSignal.any()`

Want both a timeout _and_ a manual cancel button? `AbortSignal.any()` (Baseline 2024) merges signals - the request aborts when the first one fires:

```js
const controller = new AbortController()

const response = await fetch(url, {
  signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
})
```

### The reusable timeout-fetch helper

```js
const fetchWithTimeout = async (url, options = {}, ms = 5000) => {
  const signals = [AbortSignal.timeout(ms)]
  if (options.signal) {
    signals.push(options.signal)
  }
  return fetch(url, { ...options, signal: AbortSignal.any(signals) })
}
```

### Beyond fetch

`AbortSignal` isn't fetch-specific. Two other uses I reach for:

```js
// Remove a batch of event listeners in one go - pass the same signal
// to addEventListener and abort() detaches them all. Great for cleanup
// in SPAs, and no need to keep references to the handler functions.
const controller = new AbortController()
window.addEventListener('resize', onResize, { signal: controller.signal })
window.addEventListener('scroll', onScroll, { signal: controller.signal })
// later…
controller.abort()
```

```js
// Make your own async functions cancellable
const doWork = async (items, { signal } = {}) => {
  for (const item of items) {
    signal?.throwIfAborted() // throws the abort reason if aborted
    await process(item)
  }
}
```

You can also check `signal.aborted` (boolean) and `signal.reason`, or listen for the `abort` event on the signal itself, if throwing isn't what you want.

## Request

Synopsis: `new Request(url, options)`

`Request` represents a HTTP request to be performed via `fetch()`. Typically a `Request` doesn't need to be constructed manually, as it's instantiated internally when `fetch()` is called.

### URL (Request or string)

The URL of the resource which is being fetched. Typically this is an absolute URL without the host component, e.g. `"/path"`. If the URL has the host of another site, the request is performed in accordance to CORS.

Any non-Request object will be converted to a `String`, making it possible to pass an instance of `URL`, for example.

A request can be initialised using another instance of `Request` in place of the `URL`. In that case, the `URL` and other options are inherited from the provided Request object.

### Options

- `method` (String) - HTTP request method. Default: `"GET"`
- `body` (String, body types) - HTTP request body
- `headers` (Object, Headers) - Default: `{}`
- `credentials` (String) - Authentication credentials mode. Default: `"same-origin"`
  - `"omit"` - don't include authentication credentials (e.g. cookies) in the request
  - `"same-origin"` - include credentials in requests to the same site
  - `"include"` - include credentials in requests to all sites

### Body types

| Class                                                                                                     | Default Content-Type                              |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| String                                                                                                    | `text/plain;charset=UTF-8`                        |
| [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)                       | `application/x-www-form-urlencoded;charset=UTF-8` |
| [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)                                     | `multipart/form-data`                             |
| [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)                                             | inherited from the `blob.type` property           |
| [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBuffer)                               |                                                   |
| [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) |                                                   |
| [DataView](https://developer.mozilla.org/en-US/docs/Web/API/DataView)                                     |                                                   |

Other data structures need to be encoded beforehand as one of the above types. For instance, `JSON.stringify(data)` can be used to serialise a data structure into a JSON string.

Note that HTTP servers often require that requests that are posted with a body also specify their type via a `Content-Type` request header.

## Response

Response represents a HTTP response from the server. Typically a Response is not constructed manually, but is available as argument to the resolved promise callback.

### Properties

- `status` (number) - HTTP response code in the 100–599 range
- `statusText` (String) - Status text as reported by the server, e.g. "Unauthorized"
- `ok` (boolean) - True if status is HTTP 2xx
- `headers` (Headers)
- `url` (String)

### Body methods

Each of the methods to access the response body returns a Promise that will be resolved when the associated data type is ready.

- `text()` - yields the response text as String
- `json()` - yields the result of JSON.parse(responseText)
- `blob()` - yields a Blob
- `arrayBuffer()` - yields an ArrayBuffer
- `formData()` - yields FormData that can be forwarded to another request

### Other response methods

- `clone()`
- `Response.error()`
- `Response.redirect()`

## Headers

Synopsis: `new Headers(hash)`

Headers represents a set of request/response HTTP headers. It allows for case-insensitive lookup of header by name, as well as merging multiple values of a single header.

### Methods

- `has(name)` (boolean)
- `get(name)` (String)
- `set(name, value)`
- `append(name, value)`
- `delete(name)`
- `forEach(function(value, name){ ... }, [thisContext])`

## Error

If there is a network error or another reason why the HTTP request couldn't be fulfilled, the fetch() promise will be rejected with a reference to that error.

Note that the promise won't be rejected in case of HTTP 4xx or 5xx server responses. The promise will be resolved just as it would be for HTTP 2xx. Inspect the response.status number within the resolved callback to add conditional handling of server errors to your code.

```js
fetch(...).then((response) => {
  if (response.ok) {
    return response.json()
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
})
```
