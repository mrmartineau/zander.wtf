---
slug: 2026-10-26-keyboard-shortcuts
title: "Keyboard shortcuts"
subtitle: "You can now get around this site with single-letter keys, and pressing ? shows the full list."
date: 2026-10-26
worklog: true
tags:
  - zander-wtf
  - a11y
---

You can now get around this site from the keyboard. Press `b` for the blog, `p` for projects, `l` for links, `n` for the [now page](/now) and `h` to go home. `/` still jumps to search, and `?` opens a dialog with every shortcut in it. Point at a link in the header or footer and a tooltip tells you its key. Nothing fires while you're typing in a text field, and the desktop and terminal versions of the site keep their own keys.

The key lives on the link itself, as an [`aria-keyshortcuts`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts) attribute. When you press a letter, the script finds the link with that key and clicks it, so there's no second list to keep in sync. Adding a page means adding a `key` to its nav item. The tooltip is an `::after` that reads the same attribute, so it needs no script. It has empty alt text, because screen readers already announce `aria-keyshortcuts` and would otherwise read the key out twice. It only shows on devices with a mouse.

Two small snags. CV and Code Notes both start with C, so the CV got `r` for résumé. And the dialog is a [ZUI](/projects/zui) one, but it rendered with no padding at all. Tailwind's preflight sets `dialog { padding: 0 }` outside any cascade layer, so it beats ZUI's layered styles. One override in the component sorted it.
