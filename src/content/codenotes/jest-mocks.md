---
title: Jest global mocks
tags:
  - javascript
  - testing
emoji: 🧪
date: 2026-07-20
---

## Some useful mocks

### `window.matchMedia`

jsdom still doesn't implement `matchMedia`. The mock needs the modern `addEventListener`/`removeEventListener`/`dispatchEvent` shape — I keep the deprecated `addListener`/`removeListener` in there too for older libs that still call them.

```js
/**
 * Contract + integration tests will use node env, not jsdom;
 * window doesn't exist in node and will make jest fail.
 * Put any mocks referencing 'window' in this 'if' block.
 */
if (typeof window !== 'undefined') {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    // deprecated, but some libs still use them
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }))
}
```

### `next/link`

```js
jest.mock('next/link', () => {
  return ({ children }) => {
    return children
  }
})
```

### Next.js router

For the App Router, mock `next/navigation`:

```js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

Legacy (Pages Router only):

```js
jest.mock('next/router', () => {
  return {
    push: () => {},
    replace: () => {},
    prefetch: () => {},
  }
})
```

### `next/config` (legacy)

`publicRuntimeConfig` only exists in the Pages Router — it's unavailable in the App Router, where plain env vars are preferred. Keeping this for old codebases:

```js
import config from 'config'

const mockPublicConfigData = {
  env: config.get('env'),
  base: config.get('base'),
  client: config.get('client'),
}

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: mockPublicConfigData,
}))
```

I used to stub `MutationObserver` here too, but jsdom has shipped a real implementation since 2020, so that's no longer needed.
