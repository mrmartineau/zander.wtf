---
title: Keycode
tags:
  - javascript
emoji: 🔑
link: https://omatsuri.app/events-keycode
date: 2026-07-20
---

```ts
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.target instanceof Node && isFormField(event.target)) {
    return
  }
  if (event.isComposing) {
    // ignore keystrokes while an IME composition is in progress
    return
  }
  // do something
})
```

`event.isComposing` is all you need to detect IME composition these days — the old `keyCode === 229` check is dead along with `keyCode` itself. If you need finer control, listen for `compositionstart`/`compositionend`.

Use `event.key` (the character/action, e.g. `'Enter'`, `'a'`) or `event.code` (the physical key, e.g. `'KeyA'`) to identify which key was pressed.

Alt link: http://keycode.info/

## `isFormField()` util

```ts
export function isFormField(element: Node): boolean {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  const name = element.nodeName.toLowerCase()
  const type = (element.getAttribute('type') || '').toLowerCase()
  return (
    name === 'select' ||
    name === 'textarea' ||
    (name === 'input' && type !== 'submit' && type !== 'reset') ||
    element.isContentEditable
  )
}
```
