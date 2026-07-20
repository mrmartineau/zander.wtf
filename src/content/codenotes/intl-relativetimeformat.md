---
title: Intl.RelativeTimeFormat
tags:
  - javascript
emoji: ⏳
link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat
date: 2026-07-20T15:30:00Z
---

The built-in way to get "2 days ago", "in 3 hours", "yesterday" — no date library needed. Rounds out the `Intl` family alongside [`Intl.NumberFormat`](/notes/intl-numberformat) and [`Intl.PluralRules`](/notes/intl-pluralrules) (which it uses under the hood, so "1 day ago" vs "2 days ago" plurals are handled for you, in any locale).

```js
const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' })

rtf.format(-1, 'day') // 'yesterday'
rtf.format(2, 'day') // 'in 2 days'
rtf.format(-3, 'hour') // '3 hours ago'
rtf.format(1, 'week') // 'next week'
```

Negative numbers are the past, positive the future. Units: `second`, `minute`, `hour`, `day`, `week`, `month`, `quarter`, `year`.

## `numeric: 'auto'` vs `'always'`

The one option that matters. `'auto'` uses natural phrasing when one exists, `'always'` (the default) keeps everything numeric:

```js
new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' }).format(-1, 'day')
// 'yesterday'

new Intl.RelativeTimeFormat('en-GB', { numeric: 'always' }).format(-1, 'day')
// '1 day ago'
```

I nearly always want `'auto'`.

---

## My helper

The API's catch: it doesn't take dates. You must work out the delta and pick a sensible unit yourself — "90 seconds ago" should be "2 minutes ago", "40 days ago" should be "last month". This helper does the unit-picking, accepts anything date-ish, and handles past and future:

```ts
// Module-level cache — formatter construction is the expensive part,
// same deal as Intl.NumberFormat.
const formatterCache = new Map<string, Intl.RelativeTimeFormat>()

const getRelativeTimeFormat = (
  locale?: string,
  options?: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat => {
  const key = `${locale}:${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

// Each entry: how many of this unit fit in the next one up.
const DIVISIONS: Array<{
  amount: number
  unit: Intl.RelativeTimeFormatUnit
}> = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' }, // average weeks per month
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
]

/**
 * Formats a date relative to now, picking the largest sensible unit.
 * @param date - A Date, timestamp, or ISO string. Past or future.
 * @param locale - BCP 47 locale tag. Default 'en-GB'; pass undefined for the visitor's locale.
 * @returns e.g. 'yesterday', '2 hours ago', 'in 3 weeks', 'last month'.
 * @throws TypeError if the date can't be parsed.
 */
export const formatRelativeTime = (
  date: Date | number | string,
  locale: string | undefined = 'en-GB',
): string => {
  const timestamp = new Date(date).getTime()
  if (Number.isNaN(timestamp)) {
    throw new TypeError('formatRelativeTime: Invalid date')
  }

  const formatter = getRelativeTimeFormat(locale, { numeric: 'auto' })

  // Negative = past, positive = future
  let duration = (timestamp - Date.now()) / 1000

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }

  // Unreachable — the last division catches everything — but TS wants a return.
  return formatter.format(Math.round(duration), 'years')
}
```

```ts
formatRelativeTime(Date.now() - 30 * 1000) // '30 seconds ago'
formatRelativeTime(Date.now() - 90 * 1000) // '2 minutes ago' — unit picked for you
formatRelativeTime('2026-07-19') // 'yesterday'
formatRelativeTime(Date.now() + 3 * 86400 * 1000) // 'in 3 days'
```

### A "just now" threshold

"12 seconds ago" is usually noise. Small wrapper:

```ts
export const timeAgo = (date: Date | number | string): string => {
  const seconds = (Date.now() - new Date(date).getTime()) / 1000
  if (seconds >= 0 && seconds < 60) {
    return 'just now'
  }
  return formatRelativeTime(date)
}
```

---

## Gotchas

- **It won't pick a unit for you** — `format(-90, 'second')` happily returns "90 seconds ago". That's what the helper above is for.
- **Relative strings go stale.** "2 minutes ago" rendered once is wrong five minutes later. On a live page, re-render on an interval (a minute is usually fine), or reach for the `<relative-time>` custom element [from GitHub](https://github.com/github/relative-time-element) if you want it handled for you. Also worth pairing with a `title` attribute holding the absolute date.
- **Static sites**: this runs at build time in Astro frontmatter — "2 days ago" is frozen at deploy. Fine for a rebuilt-often site, misleading otherwise; prefer absolute dates there.
- For absolute date formatting, the sibling API is `Intl.DateTimeFormat` — same locale/options/caching patterns as everything above.
