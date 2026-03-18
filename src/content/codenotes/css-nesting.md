---
title: Native CSS Nesting
emoji: 🪺
tags:
  - css
date: 2026-03-18
link: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting
---

Native CSS nesting lets you nest selectors inside other selectors without a preprocessor like Sass. It's supported in all modern browsers.

## Basic nesting

Nest child selectors inside a parent rule block:

```css
.card {
  padding: 1rem;
  background: white;

  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .body {
    line-height: 1.6;
    color: #333;
  }
}
```

This is equivalent to:

```css
.card {
  padding: 1rem;
  background: white;
}
.card .title {
  font-size: 1.5rem;
  font-weight: bold;
}
.card .body {
  line-height: 1.6;
  color: #333;
}
```

## The `&` selector

Use `&` to reference the parent selector. It's required when you need to attach something directly to the parent (pseudo-classes, pseudo-elements, compound selectors):

```css
.button {
  background: royalblue;
  color: white;

  &:hover {
    background: darkblue;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  &::after {
    content: ' →';
  }

  &.primary {
    background: rebeccapurple;
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

## Deep nesting

You can nest multiple levels deep, though keep it reasonable:

```css
.nav {
  display: flex;
  gap: 1rem;

  .nav-list {
    list-style: none;
    display: flex;

    .nav-item {
      padding: 0.5rem;

      a {
        text-decoration: none;
        color: inherit;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
```

## Nesting media queries and other at-rules

At-rules like `@media`, `@container`, and `@supports` can be nested directly inside a rule:

```css
.sidebar {
  width: 100%;
  padding: 1rem;

  @media (min-width: 768px) {
    width: 300px;
    padding: 2rem;
  }

  @media (min-width: 1200px) {
    width: 400px;
  }

  @container (min-width: 500px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

This is equivalent to:

```css
.sidebar {
  width: 100%;
  padding: 1rem;
}
@media (min-width: 768px) {
  .sidebar {
    width: 300px;
    padding: 2rem;
  }
}
@media (min-width: 1200px) {
  .sidebar {
    width: 400px;
  }
}
```

## Combining selectors

Nest multiple selectors using selector lists:

```css
.card {
  border: 1px solid #ddd;

  .title,
  .subtitle {
    margin: 0;
    color: #111;
  }

  .title {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #666;
  }
}
```

## Using `&` to reverse context

Place `&` on the right side to style an element based on an ancestor:

```css
.icon {
  width: 1rem;
  height: 1rem;
  fill: currentColor;

  .button & {
    width: 1.25rem;
    height: 1.25rem;
  }

  .dark-theme & {
    fill: white;
  }
}
```

This compiles to `.button .icon` and `.dark-theme .icon`.

## Nesting with sibling combinators

All combinators work inside nested rules:

```css
.stack {
  display: flex;
  flex-direction: column;

  > * {
    margin: 0;
  }

  > * + * {
    margin-top: 1rem;
  }

  ~ .aside {
    margin-top: 2rem;
  }

  + .footer {
    border-top: 1px solid #eee;
  }
}
```

## Real-world example: a component

```css
.dialog {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 0.5);

  .dialog-content {
    background: white;
    border-radius: 0.5rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  .dialog-footer {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  @media (max-width: 640px) {
    .dialog-content {
      width: 100%;
      min-height: 100dvh;
      border-radius: 0;
    }
  }
}
```

## Differences from SCSS

If you're coming from Sass/SCSS, native CSS nesting will feel familiar but there are some important differences.

### No string concatenation with `&`

In SCSS, `&` is a string you can concatenate to build class names. Native CSS doesn't support this — `&` is a full selector reference.

```scss
/* ✅ SCSS — works */
.card {
  &__title {
    font-size: 1.5rem;
  }
  &--large {
    padding: 2rem;
  }
}
/* Outputs: .card__title and .card--large */
```

```css
/* ❌ Native CSS — does NOT work */
.card {
  &__title {
    font-size: 1.5rem; /* this is invalid */
  }
}

/* ✅ Native CSS — use full class names instead */
.card {
  .card__title {
    font-size: 1.5rem;
  }
  .card--large {
    padding: 2rem;
  }
}
```

### Specificity differences with `&`

In SCSS, `&` is replaced with the parent selector as a string, so specificity is straightforward. In native CSS, `&` is treated as an `:is()` selector, which takes the specificity of its most specific argument:

```css
/* Native CSS */
.card, #special {
  .title {
    color: red;
  }
}
/* Equivalent to: */
:is(.card, #special) .title {
  color: red;
}
/* .title gets ID-level specificity (1,0,1) even inside .card
   because :is() uses the highest specificity in the list */
```

In SCSS the same code would output two separate rules, each with their own specificity:

```scss
/* SCSS output */
.card .title {
  color: red; /* specificity: 0,2,0 */
}
#special .title {
  color: red; /* specificity: 1,0,1 */
}
```

### Side-by-side cheat sheet

| Feature | SCSS | Native CSS |
|---|---|---|
| Basic nesting | `.a { .b { } }` | `.a { .b { } }` |
| Parent ref | `&:hover` | `&:hover` |
| String concat | `&__child` ✅ | `&__child` ❌ |
| Nested `@media` | ✅ | ✅ |
| Variables | `$var` | `var(--var)` |
| Mixins | `@mixin` / `@include` | ❌ (no equivalent) |
| Color functions | `lighten()`, `darken()` | `color-mix()` |
| Selector lists specificity | Individual | Uses `:is()` (highest wins) |
| Build step required | Yes | No |

## Things to know

- **Specificity**: nested rules use `:is()` semantics — the parent selector's specificity is determined by the most specific selector in a list
- **Element selectors**: bare element selectors like `div` or `p` work directly inside nesting without needing `&` (this was updated from the original spec)
- **No string concatenation**: unlike Sass, you can't do `&__element` to construct BEM class names — `&` is a selector, not a string
- **Browser support**: available in Chrome 120+, Firefox 117+, Safari 17.2+
