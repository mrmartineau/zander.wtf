---
title: Useful JavaScript functions & snippets
tags:
  - javascript
date: 2026-07-20
---

## Automatically remove an event listener after it has executed

```js
el.addEventListener('click', console.log, {
  once: true,
})
```

## The magical `handleEvent` function

```js
// Get a reference to the <button>
const btn = document.querySelector('button')

// Define object with `handleEvent` function
const myObject = {
  handleEvent: (event) => {
    alert(event.type)
  },
}

// Listen for 'click' events on the <button> and handle them with `myObject`... WHAT?!?!
btn.addEventListener('click', myObject)
```

[More info](https://dev.to/rikschennink/the-fantastically-magical-handleevent-function-1bp4)

## Remove query param

```ts
export const removeSearchParam = (name: string): void => {
  const url = new URL(location.href)
  url.searchParams.delete(name)
  history.replaceState(null, '', url)
}
```
