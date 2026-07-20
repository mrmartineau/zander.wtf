---
title: URL & URLSearchParams
date: 2026-07-20
tags:
  - javascript
---

## URL

Docs: http://developer.mozilla.org/en-US/docs/Web/API/URL

```js twoslash
const url = new URL('https://mysite.com/login?user=zander&page=news#hello')

url.hostname // mysite.com
url.pathname // /login
url.href // https://mysite.com/login?user=zander&page=news#hello
url.origin // https://mysite.com
url.search // ?user=zander&page=news
url.hash // #hello
```

## URLSearchParams

Docs: http://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams

```js twoslash
// note: don't pass a full URL string to URLSearchParams directly —
// it treats the whole thing as a query string. Go via new URL() instead.
const params = new URL('https://mysite.com/login?user=zander&page=news#hello')
  .searchParams

params.has('user') // true
params.get('user') // 'zander'

params.set('page', 'code')
params.toString() // user=zander&page=code

for (const [key, value] of params) {
  // ...
}

params.delete('page')
params.toString() // user=zander
```

### Convert a url with search params to an object:

```ts
// one liner
const params = Object.fromEntries(
  new URL('https://mysite.com/login?user=zander&page=news#hello').searchParams
)
```

```ts
// multi-line
const url = new URL('https://mysite.com/login?user=zander&page=news#hello')
const urlParams = new URLSearchParams(url.search)
const params = Object.fromEntries(urlParams)
```

## `URL.canParse()`

A quick boolean check for whether a string is a valid URL — no try/catch needed:

```js
URL.canParse('https://mysite.com') // true
URL.canParse('user=zander&page=news') // false
```

## `URL.parse()`

Like the `URL` constructor but it returns `null` on invalid input instead of throwing:

```js
const url = URL.parse('not a url') // null
const ok = URL.parse('https://mysite.com/login') // URL instance
```

## Use `proper-url-join` to construct a url

> I use this package on nearly every project to normalise urls

https://github.com/moxystudio/js-proper-url-join

Caveat: it's barely maintained these days, and the native `URL` API covers most of these cases now — I'd reach for that first.

```ts
import urlJoin from 'proper-url-join'

urlJoin('foo', 'bar') // /foo/bar
urlJoin('/foo/', '/bar/') // /foo/bar
urlJoin('foo', '', 'bar') // /foo/bar
urlJoin('foo', undefined, 'bar') // /foo/bar
urlJoin('foo', null, 'bar') // /foo/bar

// With leading & trailing slash options
urlJoin('foo', 'bar', { leadingSlash: false }) // foo/bar
urlJoin('foo', 'bar', { trailingSlash: true }) // /foo/bar/
urlJoin('foo', 'bar', { leadingSlash: false, trailingSlash: true }) // foo/bar/

// Absolute URLs
urlJoin('http://google.com', 'foo') // http://google.com/foo

// Protocol relative URLs
urlJoin('//google.com', 'foo', { protocolRelative: true }) // //google.com/foo

// With query string as an url part
urlJoin('foo', 'bar?queryString') // /foo/bar?queryString
urlJoin('foo', 'bar?queryString', { trailingSlash: true }) // /foo/bar/?queryString

// With query string as an object
urlJoin('foo', { query: { biz: 'buz', foo: 'bar' } }) // /foo?biz=buz&foo=bar

// With both query string as an url part and an object
urlJoin('foo', 'bar?queryString', { query: { biz: 'buz', foo: 'bar' } }) // /foo/bar?biz=buz&foo=bar&queryString
```
