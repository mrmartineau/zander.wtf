---
title: Eleventy
link: https://www.11ty.dev/docs/
tags:
  - 11ty
date: 2023-06-22
emoji: ⓫
---

## Eleventy config

### Add a filter

```js
eleventyConfig.addFilter('readableDate', (dateObj) => {
  return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd LLL, yyyy')
})
```

Usage:

```njk
{{ page.date | readableDate }}
```
