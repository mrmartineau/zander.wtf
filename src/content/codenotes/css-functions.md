---
title: CSS Functions
emoji: 🧮
tags:
  - css
date: 2026-03-18
link: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
---

A reference of modern CSS functions — the ones worth knowing about beyond the basics like `rgb()`, `calc()`, and `var()`.

## Colour

### `color-mix()`

Mix two colours together in a given colour space. The percentage controls how much of the second colour is mixed in.

```css
.card {
  /* 50/50 mix */
  background: color-mix(in srgb, royalblue, white);

  /* 25% white into royalblue = a lighter blue */
  background: color-mix(in srgb, royalblue, white 25%);

  /* Mix in oklch for perceptually uniform results */
  background: color-mix(in oklch, #e63946, #457b9d);

  /* Create a semi-transparent version of a colour */
  background: color-mix(in srgb, currentColor, transparent 50%);

  /* Works with custom properties */
  --primary: royalblue;
  background: color-mix(in srgb, var(--primary), black 20%);
}
```

### `light-dark()`

Returns one of two values depending on the user's colour scheme. Requires `color-scheme` to be set.

```css
:root {
  color-scheme: light dark;
}

body {
  background: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#111111, #eeeeee);
}

.card {
  border: 1px solid light-dark(#ddd, #444);
  box-shadow: 0 2px 8px light-dark(rgb(0 0 0 / 0.1), rgb(0 0 0 / 0.4));
}

a {
  color: light-dark(royalblue, cornflowerblue);
}
```

### `color()`

Access wider-gamut colour spaces like Display P3:

```css
.vibrant {
  /* Standard sRGB fallback */
  background: #ff4500;
  /* P3 — more vivid on supported displays */
  background: color(display-p3 1 0.27 0);
}

.subtle {
  background: color(display-p3 0.5 0.8 0.6);
}
```

### `oklch()` and `oklab()`

Perceptually uniform colour spaces. Great for generating palettes where lightness and chroma are predictable:

```css
:root {
  /* oklch(lightness chroma hue) */
  --blue-50: oklch(0.95 0.05 250);
  --blue-100: oklch(0.9 0.08 250);
  --blue-200: oklch(0.8 0.12 250);
  --blue-500: oklch(0.6 0.2 250);
  --blue-900: oklch(0.3 0.12 250);

  /* Rotate hue to create related colours */
  --primary: oklch(0.6 0.2 250);
  --secondary: oklch(0.6 0.2 310);
  --accent: oklch(0.6 0.2 30);
}
```

### Relative colour syntax

Transform an existing colour by adjusting individual channels:

```css
:root {
  --brand: royalblue;

  /* Make it 20% lighter */
  --brand-light: oklch(from var(--brand) calc(l + 0.2) c h);

  /* Make it 20% darker */
  --brand-dark: oklch(from var(--brand) calc(l - 0.2) c h);

  /* Desaturate */
  --brand-muted: oklch(from var(--brand) l calc(c * 0.5) h);

  /* Set alpha */
  --brand-faded: oklch(from var(--brand) l c h / 0.5);

  /* Shift hue */
  --brand-complement: oklch(from var(--brand) l c calc(h + 180));
}
```

---

## Math

### `min()`, `max()`, `clamp()`

Responsive sizing without media queries:

```css
.container {
  /* The smaller of 90vw or 1200px */
  width: min(90vw, 1200px);

  /* At least 300px wide */
  width: max(300px, 50vw);

  /* Fluid with a floor and ceiling */
  width: clamp(300px, 50vw, 1200px);
}

h1 {
  /* Fluid typography */
  font-size: clamp(1.5rem, 1rem + 2vw, 3rem);
}

.card {
  /* Fluid padding */
  padding: clamp(1rem, 3vw, 2.5rem);
}
```

### `round()`

Round a value to the nearest interval:

```css
.grid-item {
  /* Snap width to nearest 100px */
  width: round(33.3vw, 100px);

  /* Round down */
  width: round(down, 33.3vw, 50px);

  /* Round up */
  width: round(up, 33.3vw, 50px);
}
```

### `abs()` and `sign()`

```css
.element {
  /* Absolute value */
  margin-top: abs(-2rem); /* 2rem */

  /* sign() returns -1, 0, or 1 */
  --direction: sign(-50px); /* -1 */
  transform: translateX(calc(var(--direction) * 100px));
}
```

### `rem()` and `mod()`

```css
.striped {
  /* rem() — remainder with the sign of the dividend */
  --offset: rem(17px, 5px); /* 2px */

  /* mod() — remainder with the sign of the divisor */
  --offset: mod(17px, 5px); /* 2px */
  --offset: mod(-17px, 5px); /* 3px (different from rem) */
}
```

### Trig functions

```css
.dial {
  --angle: 45deg;
  --radius: 100px;

  /* Position a point on a circle */
  --x: calc(cos(var(--angle)) * var(--radius));
  --y: calc(sin(var(--angle)) * var(--radius));
  transform: translate(var(--x), var(--y));
}

.element {
  transform: rotate(atan2(100px, 200px));
}
```

### `pow()`, `sqrt()`, `log()`, `exp()`

```css
:root {
  /* Type scale using pow() */
  --step-0: 1rem;
  --step-1: calc(1rem * pow(1.25, 1)); /* 1.25rem */
  --step-2: calc(1rem * pow(1.25, 2)); /* 1.5625rem */
  --step-3: calc(1rem * pow(1.25, 3)); /* 1.953rem */

  --hypotenuse: calc(1px * sqrt(pow(3, 2) + pow(4, 2))); /* 5px */
}
```

---

## Layout & sizing

### `repeat()`

Create repeating grid tracks:

```css
.grid {
  /* 3 equal columns */
  grid-template-columns: repeat(3, 1fr);

  /* Auto-fill — as many 200px columns as fit */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  /* Auto-fit — same but collapses empty tracks */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

  /* Complex patterns */
  grid-template-columns: repeat(3, 1fr 2fr);
  /* = 1fr 2fr 1fr 2fr 1fr 2fr */
}
```

### `minmax()`

Set a size range for grid tracks:

```css
.layout {
  grid-template-columns: minmax(200px, 300px) 1fr;
  grid-template-rows: minmax(100px, auto);

  /* Prevent content blow-out with min() inside minmax() */
  grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
}
```

### `fit-content()`

Size a track to its content up to a maximum:

```css
.layout {
  grid-template-columns: fit-content(200px) 1fr fit-content(300px);
}

.label {
  width: fit-content(100%);
}
```

---

## Selectors & filters

### `:is()`

Matches any selector in the list. Takes the specificity of the most specific argument:

```css
/* Instead of: header a, nav a, footer a */
:is(header, nav, footer) a {
  color: royalblue;
}

/* Deeply nested — great for reducing repetition */
:is(h1, h2, h3, h4) :is(a, span) {
  text-decoration: underline;
}
```

### `:where()`

Same as `:is()` but with **zero specificity** — great for default styles that are easy to override:

```css
/* Base styles with no specificity baggage */
:where(ul, ol) {
  padding-left: 1.5rem;
}

:where(.card) :where(h2, h3) {
  margin-top: 0;
}

/* Easily overridden with any class */
.my-list {
  padding-left: 0;
}
```

### `:has()`

The "parent selector" — style an element based on what it contains:

```css
/* Card that contains an image */
.card:has(img) {
  padding: 0;
}

/* Form group when its input is invalid */
.form-group:has(:invalid) {
  border-color: red;
}

/* Style the parent based on a checked child */
.option:has(input:checked) {
  background: lavender;
}

/* Style a sibling */
h2:has(+ p) {
  margin-bottom: 0.5rem;
}

/* Page-level layout based on sidebar presence */
body:has(.sidebar) .main {
  grid-template-columns: 300px 1fr;
}
```

### `:not()`

Exclude elements matching a selector:

```css
/* All links except those with a class */
a:not([class]) {
  text-decoration: underline;
}

/* All children except the last */
li:not(:last-child) {
  border-bottom: 1px solid #eee;
}

/* Combine with :has() */
.card:not(:has(img)) {
  background: #f5f5f5;
}
```

---

## Shapes & gradients

### `conic-gradient()`

```css
.pie {
  background: conic-gradient(royalblue 0% 70%, #eee 70% 100%);
  border-radius: 50%;
}

.colour-wheel {
  background: conic-gradient(in oklch, red, yellow, lime, aqua, blue, magenta, red);
  border-radius: 50%;
}
```

### `linear-gradient()` with interpolation

```css
.smooth {
  /* Interpolate in oklch for smoother gradients */
  background: linear-gradient(in oklch, royalblue, coral);

  /* Avoid the grey-zone between complementary colours */
  background: linear-gradient(in oklch longer hue, blue, red);
}
```

---

## Transform

### Individual transform functions

```css
.element {
  /* These are now individual properties, not just functions */
  translate: 50% -20px;
  rotate: 15deg;
  scale: 1.1;

  /* Still works as functions inside transform */
  transform: rotate3d(1, 1, 0, 45deg) perspective(500px);
}
```

---

## Misc

### `env()`

Access environment variables like safe area insets:

```css
.app-bar {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 1rem); /* fallback */
}
```

### `attr()` (enhanced)

Reference HTML attributes as CSS values (limited support — currently only works in `content`, broader support coming):

```css
.tooltip::after {
  content: attr(data-tooltip);
}

/* Future: typed attr() in any property */
/* div { width: attr(data-width px, 100px); } */
```

### `counter()` and `counters()`

```css
ol {
  counter-reset: section;

  li {
    counter-increment: section;

    &::before {
      content: counter(section) '. ';
      font-weight: bold;
    }
  }
}

/* Nested counters with a separator */
ol ol li::before {
  content: counters(section, '.') ' ';
}
```
