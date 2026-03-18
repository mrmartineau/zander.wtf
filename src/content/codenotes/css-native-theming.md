---
title: CSS Native Element Theming
emoji: 🎨
tags:
  - css
date: 2026-03-18
---

Modern CSS properties for theming native HTML elements — inputs, checkboxes, scrollbars, carets, and more — without reaching for custom components.

## `accent-color`

Tint native form controls (checkboxes, radio buttons, range sliders, progress bars) with a single property. The browser automatically handles contrast for check marks and labels.

```css
html {
  accent-color: orangered;
}
```

Target individual elements:

```css
input[type='checkbox'] {
  accent-color: royalblue;
}

input[type='radio'] {
  accent-color: rebeccapurple;
}

input[type='range'] {
  accent-color: coral;
}

progress {
  accent-color: mediumseagreen;
}
```

Pair with `color-scheme` to let the browser adapt the control's background and unchecked state:

```css
html {
  accent-color: hotpink;
  color-scheme: light dark;
}
```

## `caret-color` and `caret-shape`

Style the text cursor in editable fields.

```css
input,
textarea,
[contenteditable] {
  caret-color: orangered;
}
```

Change the caret shape (support is still limited):

```css
input {
  /* bar (default) | block | underscore */
  caret-shape: block;
}

/* Shorthand — colour and shape together */
input {
  caret: orangered block;
}
```

Use `transparent` to hide the caret entirely (useful for custom cursor implementations):

```css
.custom-input {
  caret-color: transparent;
}
```

Adapt to theme:

```css
:root {
  color-scheme: light dark;
}

input {
  caret-color: light-dark(royalblue, cornflowerblue);
}
```

## `color-scheme`

Tells the browser which colour schemes your page supports. This affects all native UI: form controls, scrollbars, system colours, and the default page background.

```css
/* Support both — browser follows OS preference */
:root {
  color-scheme: light dark;
}

/* Force a specific scheme */
:root {
  color-scheme: dark;
}
```

Apply per-element to create mixed-scheme UIs:

```css
body {
  color-scheme: light dark;
}

/* Force this section to always be dark */
.dark-panel {
  color-scheme: dark;
}

/* Force this widget to always be light */
.light-widget {
  color-scheme: light;
}
```

Via HTML for the earliest possible application (before CSS loads):

```html
<meta name="color-scheme" content="light dark" />
```

## `light-dark()`

Returns one of two values depending on the active colour scheme. Requires `color-scheme` to be set.

```css
:root {
  color-scheme: light dark;
}

body {
  background: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#111, #eee);
}

a {
  color: light-dark(royalblue, cornflowerblue);
}

.card {
  background: light-dark(#f9f9f9, #2a2a2a);
  border: 1px solid light-dark(#ddd, #444);
  box-shadow: 0 2px 8px light-dark(rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.4));
}

hr {
  border-color: light-dark(#eee, #333);
}
```

Build a full set of design tokens with `light-dark()`:

```css
:root {
  color-scheme: light dark;

  --text-primary: light-dark(#111, #eee);
  --text-secondary: light-dark(#555, #aaa);
  --bg-page: light-dark(#fff, #111);
  --bg-surface: light-dark(#f5f5f5, #222);
  --bg-elevated: light-dark(#fff, #2a2a2a);
  --border: light-dark(#ddd, #444);
  --accent: light-dark(royalblue, cornflowerblue);
}
```

## Putting it all together

A minimal theme with all native elements styled:

```css
:root {
  color-scheme: light dark;

  --accent: light-dark(royalblue, cornflowerblue);
  --text: light-dark(#111, #eee);
  --surface: light-dark(#fff, #1a1a1a);
  --border: light-dark(#ddd, #444);
}

html {
  accent-color: var(--accent);
  color: var(--text);
  background: var(--surface);
}

input,
textarea,
select {
  caret-color: var(--accent);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

::selection {
  background: var(--accent);
  color: white;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```
