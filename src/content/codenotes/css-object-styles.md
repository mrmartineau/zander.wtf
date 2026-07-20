---
title: CSS Object styles
tags:
  - react
  - css
  - javascript
emoji: 💄
date: 2026-07-20
---

Instead of writing css properties in `kebab-case` like regular css, you write them in `camelCase`, for example `background-color` would be `backgroundColor`. Object styles are especially useful with the css prop because you don't need a css call like with string styles but object styles can also be used with styled.

Worth saying up front: the runtime CSS-in-JS era this note comes from (Emotion, Theme UI) has largely fallen out of favour — runtime styles don't work with React Server Components. The zero-runtime successors (vanilla-extract, Panda CSS, Linaria, StyleX) or plain CSS/Tailwind are the usual picks now. The camelCase object syntax below is still accurate for any lib that uses it, though.

- https://theme-ui.com/guides/object-styles
- https://emotion.sh/docs/object-styles

#### [Pseudo elements](https://theme-ui.com/guides/object-styles#pseudo-elements)

```js
{
  '&::before': {
    content: '""',
    display: 'block',
    width: 32,
    height: 32,
    backgroundColor: 'tomato',
  }
}
```

### Media queries

```js
{
  color: 'darkorchid',
  '@media(min-width: 420px)': {
    color: 'orange'
  }
}
```

### Numbers

```js
{
  padding: 8,
  zIndex: 200
}
```

### Vendor prefixes

Prefixes for interface names are upper-cased in object styles, e.g. `WebkitTextStrokeColor` for `-webkit-text-stroke-color` (there is no unprefixed `text-stroke` — only the `-webkit-` version exists):

```js
{
  WebkitTextStrokeColor: 'red',
  WebkitTextStrokeWidth: '1px',
}
```
