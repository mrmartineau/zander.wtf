---
slug: zui-ecosystem
title: The ZUI ecosystem
subtitle: The tooling that has grown up around my CSS-first UI library — framework components, a VS Code extension, a Raycast extension, and a publishable Astro docs theme.
date: 2026-07-10
tags:
  - zui
  - design-systems
---

I just wrote about [the ecosystem of apps around Otter](/blog/otter-ecosystem), and it turns out I've done the same thing to [ZUI](https://zui.zander.wtf), my CSS-first UI library. The core of ZUI is, and always will be, the CSS. But a design system lives or dies by how pleasant it is to actually use day to day, so a small ecosystem of tooling has grown up around it: framework components, editor tooling, a Raycast extension, and a documentation theme. This post is a tour of those pieces.

(If you're curious about what's inside the CSS itself, I covered that in [The modern CSS hiding inside ZUI](/blog/zui-modern-css).)

**TL;DR**

- The core is one npm package: [`@mrmartineau/zui`](https://www.npmjs.com/package/@mrmartineau/zui), CSS first, classes optional
- Framework components for **React, Astro, Solid, Svelte, and Vue** ship in the same package, so you don't have to remember class names
- A **VS Code extension** published alongside each release adds autocomplete and colour previews for classes and design tokens
- A **Raycast extension** (based on the Tailwind one) searches classes, tokens, snippets, and docs without opening a browser
- The **docs site** is built with Astro and ZUI, and its guts are published as [`@mrmartineau/zui-theme`](https://www.npmjs.com/package/@mrmartineau/zui-theme) so other projects can use them

## The core: one npm package

For most users, the main part of the ecosystem is the npm package. Install it, import the stylesheet, and you have the whole library:

```sh
npm install @mrmartineau/zui
```

```css
@import '@mrmartineau/zui/css';
```

From there you can use ZUI the pure-CSS way: write HTML, apply the classes, done. Everything else in this post is optional. But "optional" is doing some heavy lifting, because the next step, actually making use of it, is where the ecosystem earns its keep.

## Framework components

If you use React, Astro, Solid, Svelte, or Vue, ZUI ships components for each of them as subpath exports of the same package:

```tsx
import { Button } from '@mrmartineau/zui/react'

export function App() {
  return <Button>Click me</Button>
}
```

```astro
---
import { Button } from '@mrmartineau/zui/astro'
---

<Button>Click me</Button>
```

You could absolutely just use the base classes directly, nothing stops you. But if you did, you'd need to remember which classes each component requires, and for anything beyond a button that gets a little tricky. The framework wrappers exist so you don't have to hold that in your head: they apply the right classes for you, expose variants as typed props, and generally make the library a lot more pleasant to use. For most people they're the preferable way in, with the raw classes there as the escape hatch rather than the default.

---

## The VS Code extension

Once ZUI is installed, two tools make day-to-day development with it much easier. The first is the [VS Code extension](https://github.com/mrmartineau/zui/tree/main/packages/vscode-zui), which is published alongside each ZUI release so it always matches the current version of the library.

It gives you autocomplete for ZUI's CSS classes, custom properties, and design tokens, plus inline colour previews for the colour tokens. It's a simple thing, but it changes the workflow from "alt-tab to the docs, find the class, copy it" to just typing and picking from a list. Exactly the kind of intuitive-feeling polish that makes a personal library feel like a real one.

## The Raycast extension

The second is my favourite, because I'm a big fan of [Raycast](https://www.raycast.com/) (this is becoming a pattern: there's [an Otter Raycast extension](/blog/otter-ecosystem) too). The [ZUI Raycast extension](https://github.com/mrmartineau/zui/tree/main/packages/raycast-zui) is based on the excellent Tailwind CSS extension, and it lets me search ZUI's CSS classes and design tokens, copy code snippets for any framework, and search the documentation, all from the launcher.

In practice it means I almost never have to dip into the documentation website while building. Forgotten the name of a spacing token, or which class a badge variant needs? Open Raycast, type a few characters, copy the answer, carry on. For a one-person design system, that speed matters: the less friction between "what was that token called" and the answer, the more the library actually gets used.

## The docs site, and the theme it spawned

ZUI's documentation lives at [zui.zander.wtf](https://zui.zander.wtf). It's built with Astro and, naturally, built *with* ZUI: the library documents itself using its own components, tokens, and theming (including the theme picker I wrote about [in the CSS post](/blog/zui-modern-css)).

While building it, I extracted the reusable parts (layouts, navigation, components, and helpers for generating documentation sites) into their own published package: [`@mrmartineau/zui-theme`](https://www.npmjs.com/package/@mrmartineau/zui-theme). It even ships a `create-zui-docs` scaffolding command, so other projects can spin up a ZUI-styled docs site without copying mine. And to keep myself honest, the ZUI docs site itself consumes the published theme, so if the theme breaks, my own docs break first.

---

Like the Otter ecosystem, none of these pieces is particularly complicated on its own. The CSS does the hard work once: the tokens, the components, the theming. Everything around it (wrappers, autocomplete, launcher search, a docs theme) is about removing the friction between knowing the library exists and actually reaching for it. If you're building your own design system, even a personal one, I'd argue the tooling around it is what turns "a stylesheet I made" into something you'll still be using in two years.
