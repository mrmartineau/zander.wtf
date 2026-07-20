---
title: Intl.PluralRules
tags:
  - javascript
emoji: 🔢
link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
date: 2026-07-20
---

The standards-based way to pick the right plural form, instead of hand-rolling `count === 1 ? 'item' : 'items'`. English only has two plural forms, but many languages have more — Polish has three, Arabic has six — and `Intl.PluralRules` knows the rules for all of them.

`select(n)` returns a plural category: one of `zero`, `one`, `two`, `few`, `many`, or `other`. You map those categories to your strings.

```js
const rules = new Intl.PluralRules('en-GB')

rules.select(0) // 'other'
rules.select(1) // 'one'
rules.select(2) // 'other'
```

## A pluralize helper

```js
const pluralize = (count, singular, plural) => {
  const rules = new Intl.PluralRules('en-GB')
  const word = rules.select(count) === 'one' ? singular : plural
  return `${count} ${word}`
}

pluralize(1, 'note', 'notes') // '1 note'
pluralize(7, 'note', 'notes') // '7 notes'
```

For more than two forms (or more languages), map categories explicitly:

```js
const rules = new Intl.PluralRules('pl-PL')

const words = {
  one: 'plik', // 1 file
  few: 'pliki', // 2–4 files
  many: 'plików', // 5+ files
}

const formatFiles = (count) => `${count} ${words[rules.select(count)]}`

formatFiles(1) // '1 plik'
formatFiles(3) // '3 pliki'
formatFiles(5) // '5 plików'
```

## Ordinals

Pass `{ type: 'ordinal' }` for 1st/2nd/3rd/4th-style suffixes — the default is `'cardinal'`:

```js
const ordinals = new Intl.PluralRules('en-GB', { type: 'ordinal' })

const suffixes = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
}

const formatOrdinal = (n) => `${n}${suffixes[ordinals.select(n)]}`

formatOrdinal(1) // '1st'
formatOrdinal(2) // '2nd'
formatOrdinal(3) // '3rd'
formatOrdinal(11) // '11th' — knows 11 isn't '11st'
formatOrdinal(21) // '21st'
```

That `11` vs `21` case is exactly the sort of thing you get wrong doing it by hand.

## Ranges

`selectRange(start, end)` (ES2023) picks the category for a range:

```js
new Intl.PluralRules('en-GB').selectRange(1, 3) // 'other' → '1–3 items'
```

---

Support is universal — every modern browser and Node for years. If you're formatting the number itself as well, reach for [`Intl.NumberFormat`](/notes/intl-numberformat), and for "2 days ago"-style strings there's [`Intl.RelativeTimeFormat`](/notes/intl-relativetimeformat), which uses these same plural rules under the hood.
