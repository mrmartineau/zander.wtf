---
slug: zui-modern-css
title: The modern CSS hiding inside ZUI
subtitle: A tour of the newer CSS features powering my UI library, from automatic contrast text and a derived colour system to variants without bloat and popovers with no JavaScript.
date: 2026-07-07
tags:
  - css
  - zui
  - design-systems
---

I've been building [ZUI](https://zui.zander.wtf), my CSS-first UI library, for a while now. It powers most of my side projects, and because it's mine (no legacy users, no browser-support committee) it's become a playground for modern CSS and new HTML elements. Stuff that used to need JavaScript, a preprocessor, or a build step is now just… CSS. This post is a tour of my favourite bits.

**TL;DR**

- Button text colour is computed *in CSS* from the background. No JS, no precomputed pairs
- One base colour token; every hover state, tint, and shadow is derived with `oklch(from …)`, `light-dark()`, and `color-mix()`
- Component variants only reassign custom properties. CVA is optional sugar on top
- Tooltips, popovers, and accordions use native primitives: the Popover API, anchor positioning, `@starting-style`, and `<details>`
- Cascade layers keep the whole thing overridable without specificity fights

## The party trick: automatic contrast text

This is the one that gets the "wait, CSS can do *that*?" reaction. ZUI buttons never declare a text colour for the `fill` variant. Whatever background colour you throw at them, the text works out its own contrast: dark text on light buttons, white text on dark buttons. No JavaScript, no lookup table of precomputed pairs.

The mechanism: read the background's OKLCH lightness using relative colour syntax, then abuse `clamp()` with `* -infinity` to turn a smooth ratio into a hard binary switch at a threshold.

```css
.zui-button {
  --auto-threshold: 0.6;
  --auto-light-text-l: 1;   /* white text */
  --auto-dark-text-l: 0.5;  /* dark text  */

  /* If bg lightness is below the threshold → 1 (white),
     above → clamped down to the dark value. The `* -infinity`
     turns a smooth ratio into a binary step. */
  --auto-color: oklch(
    from var(--zui-btn-bg)
      clamp(
        var(--auto-dark-text-l),
        calc((l / var(--auto-threshold) - 1) * -infinity),
        var(--auto-light-text-l)
      )
      0 0 / 1
  );

  color: var(--zui-btn-fg, var(--auto-color));
}
```

This is exactly the kind of thing you'd previously reach for JavaScript or a Sass function to do. Here it's fully reactive: change `--zui-btn-bg` at runtime and the text colour recomputes itself. And if you want to bring your own colour, you set `--zui-btn-accent`: the background, hover states, and auto-contrast text all recompute from that one variable.

Credit where it's due: I picked this pattern up while digging through the source code of [Graffiti](https://graffiti-ui.com/), Scott Tolinski's UI library, and its auto-color class. Graffiti was a big inspiration for ZUI early on more generally: how it handles its documentation shaped ZUI's doc site, right down to the theme picker. Eventually the native [`contrast-color()`](https://developer.mozilla.org/en-US/docs/Web/CSS/contrast-color) function will do this declaratively, but it's still landing in browsers. This works today.

## The colour engine: one token, infinite derivations

Zoom out and the auto-contrast trick is just one expression of a bigger principle in ZUI: **colours are computed, not curated**. There's a small set of base tokens, and everything else (hover states, subtle backgrounds, muted text, even shadow colours) is derived from them in CSS.

The workhorse is OKLCH with [relative colour syntax](https://developer.chrome.com/blog/css-relative-color-syntax). OKLCH is perceptually uniform, so "subtract 0.1 lightness" looks consistent across every hue, and `oklch(from …)` lets me keep some channels while tweaking others:

```css
/* Darken on hover, keep hue + chroma */
--zui-btn-accent-hover: oklch(from var(--zui-btn-accent) calc(l - 0.1) c h);

/* Same colour at 15% alpha — for subtle backgrounds */
--zui-btn-accent-subtle-bg: oklch(from var(--zui-btn-accent) l c h / 15%);

/* Muted text from the text colour — no new token needed */
--color-muted: oklch(from var(--color-text) l c h / 70%);

/* Even the shadow colour is derived from the background */
--shadow-color: oklch(from var(--color-background) calc(l - 0.3) c h);
```

ZUI uses this pattern around 57 times. The alternative is minting a new variable for every shade and opacity of every colour, which is how design token systems balloon into hundreds of entries nobody can name.

That's not to say there's no palette. ZUI ships a full set of colour tokens that match Tailwind's, defined in OKLCH (e.g. `--color-slate-200: oklch(92.9% 0.013 255.508)`), because most people already know those names, and they make good raw material. But in practice you barely touch them when theming: you pick an accent, a background, and a text colour once, and the OKLCH manipulation derives everything else. You rarely set a colour twice.

Dark mode follows the same philosophy via [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark). Each semantic token names its light and dark values inline, and the browser picks based on `color-scheme`. No duplicated `@media (prefers-color-scheme)` blocks, no `.dark` class selectors fighting specificity:

```css
:root {
  --color-background: light-dark(var(--color-mist-200), var(--color-mist-800));
  --color-text:       light-dark(var(--color-mist-700), var(--color-mist-300));
  --color-accent:     light-dark(var(--color-sky-600),  var(--color-sky-400));
}

/* Force a subtree into a fixed scheme: */
:root.zui-dark  { color-scheme: dark; }
:root.zui-light { color-scheme: light; }
```

And these compose. My favourite example is the scrollbar styling, which stacks three modern features in one tidy block. `scrollbar-gutter` reserves space so content never jumps when a scrollbar appears, the standardised `scrollbar-width`/`scrollbar-color` pair replaces the old `::-webkit-scrollbar` soup, and the thumb colour is derived from the theme, flipping direction in dark mode:

```css
html {
  scrollbar-gutter: stable; /* reserve the gutter → no layout shift */
}

* {
  scrollbar-width: thin;
  scrollbar-color:
    light-dark(
      oklch(from var(--color-theme) calc(l - 0.1) c h),
      oklch(from var(--color-theme) calc(l + 0.1) c h / 30%)
    )
    transparent; /* thumb colour, then track colour */
}
```

There's also [`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) in the mix (sorry) for muted text and faint surface tints:

```css
.zui-field-description {
  color: color-mix(in oklch, var(--color-text) 65%, transparent);
}

/* Subtle surface = 4% text colour over the surface colour */
--zui-tabs-list-bg: color-mix(in oklch, var(--color-text) 4%, var(--color-surface));
```

`color-mix(… 65%, transparent)` and `oklch(from … l c h / 65%)` do essentially the same job, and ZUI uses both. I reach for `color-mix()` when I'm blending two actual colours, and relative syntax when I'm only adjusting channels of one.

---

## Variants without the bloat

ZUI's components have variants: buttons come in `fill`, `subtle`, `outline`, `ghost`, and `link`, in multiple colours and sizes. The framework wrappers (React, Solid etc.) use [Class Variance Authority (CVA)](https://cva.style/) to map props to class names, but CVA isn't the interesting part. The interesting part is that **variants never rewrite CSS rules; they only reassign custom properties**.

The base `.zui-button` is written entirely in terms of `--zui-btn-*` variables:

```css
.zui-button {
  background-color: var(--zui-btn-bg);
  color: var(--zui-btn-fg, var(--auto-color));
  border: 1px solid var(--zui-btn-border, transparent);
}
```

A colour variant sets *one* variable, and everything else cascades from it, including the derived hover states and the auto-contrast text from earlier:

```css
.zui-button.zui-button-color-accent      { --zui-btn-accent: var(--color-accent); }
.zui-button.zui-button-color-destructive { --zui-btn-accent: var(--color-error); }
```

A style variant recomposes the same handful of variables; a size variant touches geometry only:

```css
.zui-button.zui-button-variant-outline {
  --zui-btn-bg: transparent;
  --zui-btn-fg: var(--zui-btn-accent);
  --zui-btn-border: oklch(from var(--zui-btn-accent) l c h / 30%);
  --zui-btn-hover-bg: oklch(from var(--zui-btn-accent) l c h / 20%);
}

.zui-button.zui-button-size-sm {
  --zui-btn-height: 1.5rem;
  --zui-btn-font-size: var(--step--2);
  --zui-btn-padding-inline: var(--space-2xs);
}
```

No combinatorial explosion of selectors, no duplicated declarations for every variant × colour × size combination. And because the logic lives in CSS rather than JavaScript, the React/Astro/Solid/Svelte/Vue wrappers are each around 30 lines. Essentially this:

```tsx
const classes = buttonVariants({ variant, color, size, shape, className })
return <button className={classes} {...props} />
```

Strip the wrappers away entirely and the same buttons work in plain HTML with classes. That's what "CSS-first" means in practice: the frameworks are optional sugar.

Holding this all together is a small set of [cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), declared once:

```css
@layer zui.reset, zui.base, zui.components, zui.utilities;
```

The reset can never accidentally beat a component; a utility always wins over a component, by layer order rather than selector weight. That's what lets every selector in the library stay flat and low-specificity, so *your* CSS overrides ZUI's without a fight.

---

## Interactions that used to need JavaScript

This is the cluster that's changed the most in the last couple of years. A whole category of "you'll need a library for that" UI work is now declarative.

### Tooltips and popovers

These are built on the native [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) (top-layer rendering and light-dismiss for free) and positioned with [CSS anchor positioning](https://developer.chrome.com/blog/anchor-positioning-api) rather than a JS positioning loop. No Popper.js, no floating-ui:

```css
.zui-tooltip-content          { position-area: block-start center; }
.zui-tooltip-placement-bottom { position-area: block-end center; }
.zui-tooltip-placement-left   { position-area: center inline-start; }

.zui-dialog::backdrop {
  background-color: oklch(0% 0 0 / 50%);
  backdrop-filter: blur(2px);
}
```

(Those logical keywords, `block-start` and `inline-start`, also mean placement flips correctly in RTL.)

### Enter and exit animations

This used to be the number one reason to pull in an animation library. Now [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) plus `allow-discrete` transitions handle it, including animating from and to `display: none`:

```css
.zui-tooltip-content {
  opacity: 0;
  translate: 0 4px;
  transition:
    opacity   150ms var(--ease-out),
    translate 150ms var(--ease-out),
    display   150ms var(--ease-out) allow-discrete,
    overlay   150ms var(--ease-out) allow-discrete;

  &:popover-open { opacity: 1; translate: 0 0; }

  /* the entry-from state */
  @starting-style {
    &:popover-open { opacity: 0; translate: 0 4px; }
  }
}
```

### Accordions

ZUI's are real `<details>` elements (accessible by default, zero ARIA wiring), animated via the new `::details-content` pseudo-element. Combined with `interpolate-size: allow-keywords`, you can finally transition to `height: auto`:

```css
html {
  interpolate-size: allow-keywords;
}

.zui-accordion-item::details-content {
  block-size: 0;
  overflow: clip;
  transition:
    block-size 250ms allow-discrete,
    content-visibility 250ms allow-discrete;
}
.zui-accordion-item[open]::details-content {
  block-size: auto;
}
```

### Auto-growing textareas

My favourite ratio of lines-of-code to JavaScript-deleted. One property replaces the classic "mirror the textarea into a hidden div and sync the height" dance:

```css
.zui-textarea {
  field-sizing: content;
}
```

---

## The next-gen sprinkles

A few smaller things that earn their place:

### Squircles

Behind an `@supports` guard, buttons and avatars can opt into iOS-style superellipse corners via the bleeding-edge `corner-shape` property, falling back to a plain `border-radius`:

```css
.zui-button.zui-button-shape-squircle {
  border-radius: 20px; /* fallback */
  @supports (corner-shape: squircle) {
    corner-shape: superellipse(1.25);
  }
}
```

### Spring easing without a physics library

The [`linear()`](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear) easing function approximates any curve from sampled points, so ZUI ships a spring as a token:

```css
:root {
  --ease-spring: linear(
    0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%,
    0.849 31.5%, 0.937 38.1%, 0.991 45.7%, 1.006 50.1%,
    1.015 55%, 1.017 63.9%, 1.001
  );
}
```

### Typography one-liners

Balanced headings and orphan-free descriptions, both of which used to be JavaScript plugins:

```css
h1, h2, h3             { text-wrap: balance; }
.zui-field-description { text-wrap: pretty; }
```

### Container queries

So components can respond to the space they're *in*, not the viewport. Form field groups switch to a two-column grid when their container is wide enough, so the same component lays out correctly in a full page or a narrow sidebar:

```css
.zui-field-group { container-type: inline-size; }

@container (min-width: 32rem) {
  .zui-field-responsive {
    display: grid;
    grid-template-columns: auto 1fr;
  }
}
```

And a quick-fire round of solid fundamentals baked in throughout:

- logical properties everywhere (`margin-inline`, `padding-block`) for free RTL support; the [lobotomised owl](https://alistapart.com/article/axiomatic-css-and-lobotomized-owls/) flow utility for rhythm
- `accent-color` to theme native checkboxes and radios in one line; `:focus-visible` focus rings for keyboard users only
- `dvh` units for mobile-safe full-height layouts
- native CSS nesting with no preprocessor in the pipeline at all
- and `prefers-reduced-motion` honoured globally.

---

The through-line here: **it's all just CSS.** A few years ago this library would have needed Sass, a positioning engine, an animation library, and a pile of JavaScript for contrast calculation and textarea resizing. Now the platform does all of it, the framework wrappers are thin optional layers, and cascade layers keep the whole thing overridable. If you're curious, [the source is on GitHub](https://github.com/mrmartineau/zui). And if you last looked at what CSS can do more than two years ago, it's worth another look.
