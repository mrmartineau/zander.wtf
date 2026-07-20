---
title: Text wrapping & word breaking
tags:
  - css
link: 'https://zander.wtf/blog/css-text-wrapping'
date: 2026-07-20T15:30:00Z
---

- `text-wrap` — overall line-wrapping strategy: `balance` (headings), `pretty` (body, avoids orphans), `nowrap`, `stable` (editable content)
- `overflow-wrap` — break too-long words (URLs etc.) as a last resort. **Use this 95% of the time**. Prefer `anywhere` over `break-word` — it affects `min-content`, so it also works inside flex/grid
- `word-break` — `break-all` breaks between any characters, all the time. Aggressive; for hashes/tokens or CJK. `keep-all` prevents breaks in CJK
- `word-wrap` — legacy alias for `overflow-wrap`, don't use
- `hyphens: auto` — dictionary-correct breaks with a hyphen; needs `lang` attribute

```css
/* sensible defaults */
h1, h2, h3, h4 {
  text-wrap: balance;
}
p, li {
  text-wrap: pretty;
}

/* stop long URLs/user content blowing out layouts */
.user-content {
  overflow-wrap: anywhere;
}

/* dense wrapping for hashes/tokens */
.commit-hash {
  word-break: break-all;
}
```
