---
slug: lil-debugger
title: "Lil' Debugger"
subtitle: "A tiny dev tool for any framework. Add a data-debug attribute to any element, hold Ctrl+Shift, and the page shows what each element holds."
date: 2026-10-02
type: package
status: unreleased
repo: 'https://github.com/mrmartineau/lil-debugger'
link: '/lil-debugger'
tech: TypeScript
tags:
  - devtools
  - debug
  - typescript
  - npm
---

You put a `data-debug` attribute on any element, with a label, an ID or a JSON blob. Hold <kbd>Ctrl</kbd>+<kbd>Shift</kbd> and every debug element gets an outline, and a small panel shows the value of whatever you hover, then the values of its parents. It has no dependencies and works with any framework, or none.

- <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> keeps it on, and `?lil-debug` in the URL starts it locked
- <kbd>Alt</kbd>+click copies a value to the clipboard
- JSON values show on many lines, next to the tag, classes and size of the element
- Four CSS custom properties theme it, or turn the styles off and bring your own
- Safe to call on the server, and it survives client-side routers swapping the page

[The demo and docs](/lil-debugger) run the real thing. It's not on npm yet.
