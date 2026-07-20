---
title: Webmentions
tags:
  - javascript
  - html
emoji: 🗣
date: 2026-07-20
---

## Go to webmention.io

Add this to your site:

```html
<link rel="webmention" href="https://webmention.io/zander.wtf/webmention" />
<link rel="pingback" href="https://webmention.io/zander.wtf/xmlrpc" />
```

### Feeds:

- `https://webmention.io/api/mentions.html?token=YOUR_API_KEY`
- `https://webmention.io/api/mentions.atom?token=YOUR_API_KEY`

### API Key

Find your API key on your [webmention.io dashboard](https://webmention.io/settings) — keep it out of your source code.

### Fetching mentions for a page

The `mentions.jf2` endpoint is CORS-enabled, so you can `fetch()` it directly:

```js
const response = await fetch(
  `https://webmention.io/api/mentions.jf2?per-page=500&target=${PAGE_URL}`
)
const mentions = await response.json()
```
