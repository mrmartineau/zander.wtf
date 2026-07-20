---
title: Nock
tags:
  - testing
  - javascript
emoji: 🧪
link: https://github.com/nock/nock
date: 2026-07-20
---

```js
import nock from 'nock'

const scope = nock('https://api.github.com')
  .get('/repos/atom/atom/license')
  .reply(200, {
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
      node_id: 'MDc6TGljZW5zZTEz',
    },
  })
```

Note: nock only intercepts Node's native `fetch` (undici) from v14 (2024) onwards — make sure you're on nock >= 14 if your code uses built-in `fetch`. Worth knowing about the modern alternatives too: [MSW](https://mswjs.io/) (`msw/node`) and undici's built-in `MockAgent`.
