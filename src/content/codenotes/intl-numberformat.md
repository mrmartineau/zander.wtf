---
title: Intl.NumberFormat
tags:
  - javascript
emoji: 💯
link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
date: 2026-07-20
---

Locale-aware number formatting, built in. Currency symbols, thousands separators, compact "1.2M"-style notation, units, percentages — no library needed. I use this all the time.

```js
new Intl.NumberFormat('en-GB').format(1234567.891)
// '1,234,567.891'

new Intl.NumberFormat('de-DE').format(1234567.891)
// '1.234.567,891' — separators flip for German
```

## The options I actually use

### Currency

```js
new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
}).format(1099.5)
// '£1,099.50'

// currencyDisplay: 'narrowSymbol' gives '$' instead of 'US$'
new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
}).format(1099.5)
// '$1,099.50'
```

### Compact notation

Great for stats, follower counts, chart axes:

```js
const compact = new Intl.NumberFormat('en-GB', { notation: 'compact' })

compact.format(1234) // '1.2K'
compact.format(1234567) // '1.2M'
compact.format(1234567890) // '1.2B'
```

### Units

```js
new Intl.NumberFormat('en-GB', {
  style: 'unit',
  unit: 'kilometer-per-hour',
}).format(50)
// '50 km/h'

new Intl.NumberFormat('en-GB', {
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'narrow',
}).format(250)
// '250MB'
```

### Percentages

```js
new Intl.NumberFormat('en-GB', { style: 'percent' }).format(0.85)
// '85%' — note: takes the fraction, not 85
```

### Signs

`signDisplay: 'exceptZero'` is handy for deltas ("+3.2%" in green, "-1.4%" in red):

```js
const delta = new Intl.NumberFormat('en-GB', {
  style: 'percent',
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
})

delta.format(0.032) // '+3.2%'
delta.format(-0.014) // '-1.4%'
```

### Ranges

```js
new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
}).formatRange(35, 60)
// '£35–£60'
```

---

## My helpers

Wrappers I've used across past projects — a validating base function plus thin presets on top.

Constructing an `Intl.NumberFormat` is comparatively expensive — `.format()` calls are cheap. Earlier versions of these helpers built a fresh formatter on every call, which is fine until you're formatting a table with a few thousand cells. The fix is a small cache keyed by locale + options, so each distinct configuration only ever constructs one formatter:

```ts
const DEFAULT_DECIMAL_PLACES = 2

// Module-level cache — lives for the lifetime of the app, shared by every
// caller. Constructing an Intl.NumberFormat is the expensive part; calling
// .format() on an existing one is cheap.
const formatterCache = new Map<string, Intl.NumberFormat>()

/**
 * Returns a memoised Intl.NumberFormat for the given locale + options.
 * Each distinct configuration only ever constructs one formatter.
 * @param locale - BCP 47 locale tag e.g. 'en-GB'. Pass undefined to use the runtime's locale.
 * @param options - Standard Intl.NumberFormatOptions.
 * @returns A cached (or newly created and cached) formatter instance.
 */
const getNumberFormat = (
  locale?: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  // NOTE: JSON.stringify makes a stable key only if the options object is
  // always built with the same property order — true for the presets below.
  const key = `${locale}:${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

/**
 * Formats a number (or numeric string) using Intl.NumberFormat, with
 * validation. Throws rather than rendering 'NaN' to the user.
 * @param value - The number to format. Numeric strings ('1099.5') are parsed.
 * @param options - Standard Intl.NumberFormatOptions.
 * @returns The formatted number as a string.
 * @throws TypeError if value is null/undefined/empty, Error if it isn't parseable as a number.
 */
export const formatNumberBase = (
  value: string | number,
  options?: Intl.NumberFormatOptions,
): string => {
  // Reject empty values outright — Intl.NumberFormat would format
  // undefined as the literal string 'NaN'.
  if (value == null || value === '') {
    throw new TypeError('formatNumber: Value is not defined')
  }
  // Guard for plain-JS callers — TS already prevents these types.
  if (typeof value === 'boolean' || typeof value === 'object') {
    throw new Error('formatNumber: Invalid number format')
  }

  // API responses and form inputs often hand over numbers as strings.
  if (typeof value === 'string') {
    value = Number.parseFloat(value)
    if (Number.isNaN(value)) {
      throw new Error('formatNumber: Invalid number format')
    }
  }

  // Locale hardcoded — swap for undefined to follow the visitor's locale.
  return getNumberFormat('en-GB', options).format(value)
}
```

The cache grows unbounded in theory, but in practice an app has a handful of formatting configurations, so it tops out at a dozen entries. One real caveat: don't feed it user-assembled option objects from different sources and expect cache hits — the key depends on property order.

The string handling matters more than it looks — API responses and form inputs hand you numbers as strings all the time, and `Intl.NumberFormat` itself would happily format `NaN` as the string `'NaN'` rather than throwing.

```ts
/**
 * Formats a number as currency.
 * @param value - The number to format.
 * @param currency - The currency code e.g. USD, GBP, EUR, etc.
 * @param decimalCount - Optional. The number of decimal places to display. Default is 2.
 * @param options - Additional, optional options for formatting the number.
 * @returns The formatted currency as a string.
 */
export const formatNumberCurrency = (
  value: number | string,
  currency: string,
  decimalCount: number = DEFAULT_DECIMAL_PLACES,
  options?: Intl.NumberFormatOptions,
) => {
  return formatNumberBase(value, {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    currency,
    maximumFractionDigits: decimalCount,
    ...options,
  })
}
```

```ts
/**
 * Formats a number with decimal places.
 * @param value - The number to format.
 * @param decimalCount - Optional. The number of decimal places to display. Default is 2.
 * @param options - Additional, optional options for formatting the number.
 * @returns The formatted number as a string.
 */
export const formatNumberDecimal = (
  value: number | string,
  decimalCount: number = DEFAULT_DECIMAL_PLACES,
  options?: Intl.NumberFormatOptions,
) => {
  return formatNumberBase(value, {
    style: 'decimal',
    maximumFractionDigits: decimalCount,
    ...options,
  })
}
```

```ts
/**
 * Formats a number with a fixed number of decimal places — trailing zeros kept.
 * @param value - The number to format.
 * @param decimalCount - The number of decimal places to display. Default is 2.
 * @param options - Additional, optional options for formatting the number.
 * @returns The formatted number as a string.
 */
export const formatNumberDecimalForceDecimalPlaces = (
  value: number,
  decimalCount: number = DEFAULT_DECIMAL_PLACES,
  options?: Intl.NumberFormatOptions,
) => {
  return formatNumberDecimal(value, decimalCount, {
    ...options,
    // The `Intl.NumberFormat` constructor that `formatNumberDecimal` uses trims
    // decimal places if possible so I have ensured that the number of decimal
    // places will be kept no matter what here.
    minimumFractionDigits: decimalCount,
  })
}
```

```ts
formatNumberCurrency(1099.5, 'GBP') // '£1,099.50'
formatNumberCurrency('1099.5', 'USD') // '$1,099.50' — strings work too
formatNumberDecimal(3.14159) // '3.14'
formatNumberDecimal(3) // '3' — trims when it can
formatNumberDecimalForceDecimalPlaces(3) // '3.00' — forced
```

---

## In React

Because the helpers cache their formatters, they're safe to call straight from render — no `useMemo` gymnastics needed:

```tsx
import { formatNumberCurrency } from '~/utils/formatNumber'

const PriceList = ({ prices }: { prices: number[] }) => (
  <ul>
    {prices.map((price) => (
      <li key={price}>{formatNumberCurrency(price, 'GBP')}</li>
    ))}
  </ul>
)
```

If you're constructing a formatter directly in a component — say the locale comes from props or context — memoise it on its inputs instead:

```tsx
import { useMemo } from 'react'

const Revenue = ({ amount, locale }: { amount: number; locale?: string }) => {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'GBP',
        currencyDisplay: 'narrowSymbol',
      }),
    [locale],
  )

  return <strong>{formatter.format(amount)}</strong>
}
```

Without the `useMemo`, every render constructs a new formatter — invisible on one component, real jank on a re-rendering table of them.

---

## Gotchas
- **`percent` takes fractions** — `format(0.85)` not `format(85)`.
- **Locale hardcoded to `en-GB`** in my helpers — pass `undefined` as the first constructor argument to use the visitor's own locale instead.
- Rounding is controllable since the v3 spec (ES2023): `roundingMode: 'trunc' | 'ceil' | 'halfEven'` etc., plus `roundingPriority` / `roundingIncrement` ("round to nearest 5p").

For plural-aware strings around these numbers ("1 item" / "2 items") see my [`Intl.PluralRules`](/notes/intl-pluralrules) note — and [`Intl.RelativeTimeFormat`](/notes/intl-relativetimeformat) covers "2 days ago".
