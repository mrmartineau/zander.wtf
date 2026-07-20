---
title: Clickable box
tags:
  - javascript
  - react
link: https://github.com/danoc/clickable-box
emoji: 📦
date: 2026-07-20
---

**Just use a native `<button>`.** You get focus, keyboard activation, `disabled`, and screen reader semantics for free — recreating all of that on a div/span is a lot of effort for a worse result. (The [clickable-box](https://github.com/danoc/clickable-box) library this note was based on is abandoned, which rather proves the point.)

If you genuinely can't use a `<button>`, here's the minimum for a11y parity. Note `event.key` — `event.keyCode` is deprecated — and that `role="button"` must activate on both <kbd>Enter</kbd> and <kbd>Space</kbd>:

```jsx
<span
  // Make the element clickable
  onClick={handleClick}
  // Make the element focusable by keyboard
  tabIndex={0}
  // Native buttons activate on both Enter and Space
  onKeyDown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }}
  // Tell screen readers that the element is a button
  role="button"
  aria-label="Close modal"
>
  <CloseIcon />
</span>
```

See [MDN on `KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) for the key values.
