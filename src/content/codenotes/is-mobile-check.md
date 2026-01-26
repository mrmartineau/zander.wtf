---
title: is-mobile check
tags:
  - javascript
emoji: 📱
date: 2023-01-21
link: https://github.com/faisalman/ua-parser-js
---

```js
const parser = require('ua-parser-js')

function isUserAgentSignallingMobile(userAgentString) {
  const ua = parser(userAgentString)
  return ua.device.type === 'mobile'
}
```
