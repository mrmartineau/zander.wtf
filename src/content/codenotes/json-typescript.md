---
title: TypeScript JSON type
tags:
  - typescript
date: 2023-09-28
---

```ts
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

interface JSONObject {
  [k: string]: JSONValue
}
interface JSONArray extends Array<JSONValue> {}
```
