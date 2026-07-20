---
title: is-mobile check
tags:
  - javascript
emoji: 📱
date: 2026-07-20
link: https://github.com/faisalman/ua-parser-js
---

UA-string sniffing is mostly a dead end now — browsers ship reduced/frozen user agent strings, so device detection from them is increasingly unreliable. On the client, use these instead:

```js
// UA Client Hints — Chromium only, so fall back to a capability check
const isMobile =
  navigator.userAgentData?.mobile ??
  matchMedia('(pointer: coarse)').matches
```

`navigator.userAgentData.mobile` is the browser telling you directly. Where it's unavailable (Safari, Firefox), `(pointer: coarse)` checks the primary input device — which is usually the question I'm actually asking anyway.

## Server-side (UA string is all you have)

For parsing a `User-Agent` header, [ua-parser-js](https://github.com/faisalman/ua-parser-js) still works:

```js
import { UAParser } from 'ua-parser-js'

const isUserAgentSignallingMobile = (userAgentString) => {
  const { device } = UAParser(userAgentString)
  return device.type === 'mobile'
}
```

Two caveats:

- ua-parser-js v2 (2024) relicensed to AGPLv3/commercial. The MIT version is the frozen 1.x line — pin accordingly.
- Because of frozen/reduced UA strings, treat the result as a hint, not truth.
