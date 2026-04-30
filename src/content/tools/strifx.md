---
title: '@mrmartineau/strifx'
subtitle: Like clsx for strings — conditionally compose any string, not just classNames.
date: 2026-03-01
repo: 'https://github.com/mrmartineau/strifx'
showReadme: true
status: active
tech: TypeScript
tags:
  - typescript
  - npm
  - utilities
---

A tiny utility for conditionally composing strings. Think of it like `clsx` but for any string — not just CSS class names. Useful for building dynamic strings from conditions and arrays.

### Some examples


Tagged templates

```tsx
import { strifx, when } from '@mrmartineau/strifx';

strifx`Hello ${when(name)} world`;
// name = "Zander" → "Hello Zander world"
// name = undefined → "Hello world"
```

Join parts with an explicit separator. Nullish/false parts are excluded automatically.

```ts
strifx.join(', ')('apples', when(bananas), 'cherries');
// bananas = "bananas" → "apples, bananas, cherries"
// bananas = undefined → "apples, cherries"

strifx.join(' AND ')(
  `status = 'active'`,
  when(minAge, { transform: v => `age >= ${v}` }),
  when(region, { transform: v => `region = '${v}'` }),
);
// minAge = 21, region = "EU" → "status = 'active' AND age >= 21 AND region = 'EU'"
```

Object syntax for more complex conditions.

```ts
strifx({
  base: 'Dear ',
  name: user.name,
  greeting: [user.isNew, ', welcome!'],  // [condition, text]
  closing: '\nBest regards',
});
// user = { name: 'Zander', isNew: true } → "Dear Zander, welcome!\nBest regards"
// user = { name: 'Zander', isNew: false } → "Dear Zander!\nBest regards"
```