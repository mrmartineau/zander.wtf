---
title: Pure ESM packages
link: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
tags:
  - javascript
date: 2026-07-20
---

My notes based on [Sindre Sorhus's pure ESM gist](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c), updated for the current state of Node.

A pure [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) package cannot be `require()`'d from CommonJS. If you hit one, you have these choices:

1. Use ESM yourself. **(preferred)**\
   Use `import foo from 'foo'` instead of `const foo = require('foo')` to import the package. You also need to put `"type": "module"` in your package.json and more. Follow the guide below.
2. If the package is used in an async context, you could use [`await import(…)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) from CommonJS instead of `require(…)`.
3. Stay on the existing version of the package until you can move to ESM.

**Make sure you're on a supported version of Node.js — 20.x at minimum, ideally 22+.** (Node.js 18 and earlier are end-of-life.)

I'd strongly recommend moving to ESM. ESM can still import CommonJS packages, but CommonJS packages cannot import ESM packages synchronously (although recent Node versions can `require()` some ESM under the `require(esm)` feature, don't build on that as a package consumer strategy).

## FAQ

### How can I move my CommonJS project to ESM?

- Add `"type": "module"` to your package.json.
- Replace `"main": "index.js"` with `"exports": "./index.js"` in your package.json.
- Update the `"engines"` field in package.json to Node.js 20+: `"node": ">=20"`.
- Remove `'use strict';` from all JavaScript files.
- Replace all `require()`/`module.export` with `import`/`export`.
- Use only full relative file paths for imports: `import x from '.';` → `import x from './index.js';`.
- If you have a TypeScript type definition (for example, `index.d.ts`), update it to use ESM imports/exports.
- Optional but recommended, use the [`node:` protocol](https://nodejs.org/api/esm.html#esm_node_imports) for imports.

### Can I import ESM packages in my TypeScript project?

Yes, but you need to convert your project to output ESM. See below.

### How can I make my TypeScript project output ESM?

- Add `"type": "module"` to your package.json.
- Replace `"main": "index.js"` with `"exports": "./index.js"` in your package.json.
- Update the `"engines"` field in package.json to Node.js 20+: `"node": ">=20"`.
- Add [`"module": "NodeNext"`](https://www.typescriptlang.org/tsconfig#module) (and `"moduleResolution": "NodeNext"`) to your tsconfig.json.
- Use only full relative file paths for imports: `import x from '.';` → `import x from './index.js';`.
- Remove `namespace` usage and use `export` instead.
- Optional but recommended, use the [`node:` protocol](https://nodejs.org/api/esm.html#esm_node_imports) for imports.
- **You must use a `.js` extension in relative imports even though you're importing `.ts` files.**

### How can I import ESM in Electron?

Electron supports ESM natively since [Electron 28](https://www.electronjs.org/docs/latest/tutorial/esm) (Dec 2023). Add `"type": "module"` to your package.json (or use `.mjs` files) and import away. Just note the [caveats](https://www.electronjs.org/docs/latest/tutorial/esm#summary-esm-support-matrix): the main process uses Node's ESM loader, sandboxed renderers/preloads use Chromium's.

### I'm having problems with ESM and Webpack

The problem is either Webpack or your Webpack configuration. First, ensure you are on the latest version of Webpack. Try asking on Stack Overflow or [open an issue on the Webpack repo](https://github.com/webpack/webpack).

### I'm having problems with ESM and Next.js

Next.js 13+ has full ESM support. For older versions, you may need to configure `transpilePackages` in `next.config.js`.

### I'm having problems with ESM and Jest

[Read this first.](https://jestjs.io/docs/ecmascript-modules) The problem is either Jest ([#9771](https://github.com/jestjs/jest/issues/9771)) or your Jest configuration. First, ensure you are on the latest version of Jest. (Or honestly, consider Vitest — it's ESM-first and this whole class of problem disappears.)

### I'm having problems with ESM and TypeScript

If you have decided to make your project ESM (`"type": "module"` in your package.json), make sure you have [`"module": "NodeNext"`](https://www.typescriptlang.org/tsconfig#module) in your tsconfig.json and that all your import statements to local files use the `.js` extension, **not** `.ts` or no extension.

### What about Create React App?

CRA was [officially deprecated in February 2025](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) and never fully supported ESM packages. Migrate to Vite (or a framework) instead of fighting it.

### How can I use TypeScript with AVA for an ESM project?

Follow [this guide](https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#for-packages-with-type-module).

### How can I make sure I don't accidentally use CommonJS-specific conventions?

Use these ESLint rules: [`unicorn/prefer-module`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md) and [`unicorn/prefer-node-protocol`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md).

### What do I use instead of `__dirname` and `__filename`?

```js
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
```

On Node 20.11+ it's even simpler — `import.meta.dirname` and `import.meta.filename` are built in.

However, in most cases, this is better:

```js
import { fileURLToPath } from 'node:url'

const foo = fileURLToPath(new URL('foo.js', import.meta.url))
```

And many Node.js APIs accept URL directly, so you can just do this:

```js
const foo = new URL('foo.js', import.meta.url)
```

### How can I import a module and bypass the cache for testing?

This used to be a "no good way" situation, but not anymore:

- Node has [module customization hooks](https://nodejs.org/api/module.html#modulemoduleregisterspecifier-parenturl-options) via `module.register()` since Node 20.6.
- For test mocking, use your test runner's ESM mocking: `vi.mock()` in Vitest or [`jest.unstable_mockModule()`](https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm) in Jest.

If you really need a manual cache-bust, the query-string trick still works (testing only — it leaks memory and only reloads the module itself, not its dependencies):

```js
const importFresh = async (modulePath) =>
  import(`${modulePath}?x=${new Date()}`)

const chalk = (await importFresh('chalk')).default
```

### How can I import JSON?

Import attributes are stable (ES2025, Node 22+):

```js
import packageJson from './package.json' with { type: 'json' }
```

Note: Node 18 used the older `assert { type: 'json' }` syntax, which is now deprecated/removed. If you need to support older Node, read and parse instead:

```js
import { promises as fs } from 'node:fs'

const packageJson = JSON.parse(await fs.readFile('package.json'))
```

### When should I use a default export or named exports?

Sindre's general rule, which I agree with: if something exports a single main thing, it should be a default export.

Keep in mind that you can combine a default export with named exports when it makes sense:

```js
import readJson, { JSONError } from 'read-json'
```

Here, the main thing is `readJson`, but an error is also exported as a named export.

#### Asynchronous and synchronous API

If your package has both an asynchronous and synchronous main API, use named exports:

```js
import { readJson, readJsonSync } from 'read-json'
```

This makes it clear to the reader that the package exports multiple main APIs. It also follows the Node.js convention of suffixing the synchronous API with `Sync`.

#### Readable named exports

Avoid overly generic names for named exports:

```js
import { parse } from 'parse-json'
```

This forces the consumer to either accept the ambiguous name (which might cause naming conflicts) or rename it:

```js
import { parse as parseJson } from 'parse-json'
```

Instead, make it easy for the user:

```js
import { parseJson } from 'parse-json'
```

#### Examples

With ESM, descriptive named exports often beat a namespace default export:

CommonJS (before):

```js
const isStream = require('is-stream');

isStream.writable(…);
```

ESM (now):

```js
import {isWritableStream} from 'is-stream';

isWritableStream(…);
```
