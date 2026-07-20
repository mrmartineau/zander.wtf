---
title: Native browser loading state
tags:
  - javascript
link: https://twitter.com/_developit/status/1625612424576376840
date: 2026-07-20
---

With the [Navigation API](http://developer.mozilla.org/en-US/docs/Web/API/Navigation) — now shipped in all major browsers (Chromium since 2022, Safari and Firefox since) — you can show the native spinner + stop button for any asynchronous operation - all you need is a Promise.

```js
function showLoading(promise) {
  navigation.addEventListener(
    'navigate',
    (event) => {
      event.intercept({
        scroll: 'manual',
        handler: () => promise,
      })
    },
    { once: true }
  )
  return navigation.navigate(location.href).finished
}

// show browser loading UI
showLoading(new Promise((r) => setTimeout(r, 1500)))
```

One caveat: `navigation.navigate(location.href)` pushes/replaces a history entry as a side effect — pass `{ history: 'replace' }` if you don't want a new entry.

### Further reading

- https://developer.chrome.com/docs/web-platform/navigation-api/#intercepting
