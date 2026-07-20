---
title: Postman.io
tags:
  - javascript
emoji: 📨
date: 2026-07-20
---

## Save a variable from a response

```js
const jsonData = pm.response.json()
pm.collectionVariables.set('ref', jsonData.refs[0].ref)
```

Collection variables are usually the right target these days. Use `pm.environment.set(...)` instead if the value should differ per environment.
