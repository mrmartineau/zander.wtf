---
title: Yalc
tags:
  - javascript
link: 'https://github.com/whitecolor/yalc'
date: 2026-07-20
---

> Heads up: yalc has been effectively unmaintained since ~2021, but it still works. Alternatives worth knowing about: `pnpm add ../package-a` (or the `link:` protocol), `npm pack`, or just using pnpm workspaces — though none of them quite replicate yalc's publish/push model.

## Installation

```sh
npm install -g yalc
```

## Usage

Say we have two projects. e.g. one website & one npm package that the website depends on:

`website-a` which depends on npm `package-a`

### Step 1

Run **`yalc publish`** in the `package-a` repo

### Step 2

Run **`yalc add package-a`** in the `website-a` repo

### Step 3

Run `yarn` in `website-a`

### Step 4

Whenever you update `package-a`, run **`yalc push`** in the `package-a` repo

You may need to run `yarn build && yalc push` if `package-a` needs building first. And You may need to run run `yalc add package-a` in the `website-a` repo.

> If you have a dev server running in `website-a`, it might pick up the changes after **`yalc push`** automatically so you may not need to do anything else.

### Revert

When you're done testing with Yalc, run **`yalc remove --all`** to remove all the yalced packages from `website-a`
