---
slug: styling-react
title: Styling React 2023 edition
subtitle: My approach for using PostCSS, Tailwind, cva and a few others tools to style react apps and components
date: 2023-11-01
tags:
  - css
  - react
---

Over the past few years, I've worked with React apps utilising various CSS-in-JS libraries, starting with [styled-components](https://styled-components.com/), transitioning through [emotion](https://emotion.sh/docs/introduction), [Theme UI](https://theme-ui.com/), and finally [Stitches](https://stitches.dev/). I've also integrated MUI, Mantine, and Chakra in numerous client projects.

While I didn't always opt for CSS-in-JS, I frequently chose it for its ubiquity — everyone was using it, and I was aboard the hype train 🚂. I knew there was an performance overhead when compared to vanilla CSS however, I was oblivious to how detrimental its impact on performance was until I read Sam Magura's article, ["Why We're Breaking Up with CSS-in-JS"](https://dev.to/srmagura/why-were-breaking-up-wiht-css-in-js-4g9b). This piece prompted me to search for a new standard in styling React apps. I believe I've found it, not in a single tool, but in a harmonious blend of various utilities.

TL;DR these are the tools I use to style React apps:

- [PostCSS](https://postcss.org/) (or Sass)
- [Tailwind](https://tailwindcss.com/)
- [CVA](https://cva.style/docs) (class-variance-authority)
- [Utopia](https://utopia.fyi/)
- [Open Props](https://open-props.style/)
- [clsx](https://github.com/lukeed/clsx) & [tailwind-merge](https://github.com/dcastil/tailwind-merge)

## Tools

### PostCSS

I use [PostCSS](https://postcss.org/) to extend CSS’s features and to add a few things that make writing styles a little more convenient, but it could easily be swapped for another preprocessor like Sass or vanilla CSS. It’s up to you. You can view my PostCSS config [here](https://github.com/mrmartineau/Otter/blob/main/postcss.config.json).

Typically styles are colocated with the components or pages that they concern, but I also include a base line of styles that are used across the app. I use a [`global.css`](https://github.com/mrmartineau/otter-2/blob/main/app/globals.css) file to import these files, which is then imported into the main app entrypoint.

### Tailwind

I find [Tailwind](https://tailwindcss.com/) useful when used sparingly, it is perfect for allowing me to append certain styles to an element on an ad-hoc basis. For example, I like to use it to add classes to elements to add some margin or to make a flex container when I don’t want to make a new bespoke class declaration. I got the idea from Andy Bell’s ["Be the browser’s mentor, not its micromanager"](https://www.youtube.com/watch?v=5uhIiI9Ld5M) talk from All Day Hey 2022.

You can view my Tailwind config [here](https://github.com/mrmartineau/otter-2/blob/main/tailwind.config.js), it is a little different to the default config, I have extended the spacing and font-size scales, added a few extra colours and some other bits and bobs.

### CVA

[CVA](https://cva.style/docs) or **class-variance-authority** is a excellent package that makes it easy to create style variants for components. I do not use CVA for all components, only the ones that need different variants, e.g. buttons and other UI primitives.

### Utopia

> Utopia is not a product, a plugin, or a framework. It’s a memorable/pretentious word we use to refer to a way of thinking about fluid responsive design.

Using the various tools on Utopia’s [website](https://utopia.fyi/), you can copy the CSS custom properties that are output and add them to your styles. These properties are responsive, which means the values scale based on the viewport size. Follow [this link](https://utopia.fyi/type/calculator?c=320,18,1.2,1240,20,1.25,5,2,&s=0.75|0.5|0.25,1.5|2|3|4|6,s-l&g=s,l,xl,12) for an example font-size scale.

### Open Props

[Open Props](https://open-props.style/) adds to the set by providing extra custom properties for things like easing functions or animations.

### clsx and tailwind-merge

[clsx](https://github.com/lukeed/clsx) is a tiny utility for constructing `className` strings conditionally, I use it in conjunction with [tailwind-merge](https://github.com/dcastil/tailwind-merge) which merges Tailwind CSS classes without style conflicts.

I use a `cn()` function that was ripped from [shadcn/ui](https://ui.shadcn.com), it is a simple utility that conditionally joins classnames together.

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Examples

### 1. Basic component

For a simple component, I import a CSS file (`TheComponent.css`) into the component file (`TheComponent.jsx`).

```css
// TheComponent.css
.component-wrapper {
  background-color: var(--color-primary);
}
```

```jsx
// TheComponent.jsx
import './TheComponent.css';

export const TheComponent = ({ children }) => {
  return <div className="component-wrapper">{children}</div>;
};
```

### 2. Component without variants

In this slightly more complex example the `cn` function is used to merge a specific class with the classes passed to the component.

```tsx
import { ReactNode, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/src/utils/classnames';
import './TheComponent.css';

interface TheComponentProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
  isActive?: boolean;
}

export const TheComponent = ({
  className,
  children,
  isActive,
  ...rest
}: TheComponentProps) => {
  const thecomponentClass = cn(
    className,
    { active: isActive },
    'component-wrapper',
  );

  return (
    <div className={thecomponentClass} {...rest}>
      {children}
    </div>
  );
};
```

### 3. Component with variants

As mentioned above, when using variants, I use CVA. The way that the `Props` TypeScript types are setup ensure that the `cva` variants are included in the component's props.

```tsx
import { cn } from '@/src/utils/classnames';
import { VariantProps, cva } from 'class-variance-authority';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

import './Button.css';

export const buttonVariants = cva('button-base', {
  variants: {
    variant: {
      primary: 'button-primary',
      secondary: 'button-secondary',
    },
    size: {
      s: 'button-s',
      m: 'button-m',
      l: 'button-l',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'm',
  },
});

interface Props
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
}

export const Button = ({
  className,
  variant,
  size,
  children,
  ...rest
}: Props) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    >
      {children}
    </button>
  );
};
```

and used like this:

```tsx
<Button variant="primary" size="l">
  Hello
</Button>
```

or you can use the `buttonVariants` helper to create a link that looks like a button:

```tsx
<a className={buttonVariants({ variant: 'secondary' })}>Click here</a>
```

[shadcn/ui](https://ui.shadcn.com) served as an excellent source of inspiration for this approach to styling React apps. It leans more heavily on Tailwind, so if that's your thing, I recommend checking it out.

---

The great thing about this approach is that it is flexible, you can use as much or as little of it as you like and without much modification, it can be used in an Astro, Svelte or Vue app. I've found that it works well for me, and I hope it works well for you too.

You can see methods from this post used in practice for [<img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/public/otter-logo.svg" width="30" height="30" class="mx-2 inline border-none" /> Otter ](https://github.com/mrmartineau/Otter), my personal bookmarking app side-project.
