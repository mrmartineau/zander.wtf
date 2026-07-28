---
title: Regular expressions
tags:
  - javascript
  - typescript
  - cheatsheet
emoji: 🔍
date: 2026-07-28
---

A comprehensive reference for regular expressions in JavaScript/TypeScript. I write regexes rarely enough that I forget the syntax every single time, so this is the page I want to land on when that happens.

## Creating a regex

```ts
// Literal — compiled once, at parse time. Use this by default.
const re = /\d+/g

// Constructor — use when the pattern is dynamic.
const word = 'cat'
const re2 = new RegExp(`\\b${word}\\b`, 'gi')
```

The constructor takes a **string**, so every backslash must be doubled: `\d` becomes `\\d`. This is the single most common source of "why doesn't my regex work".

If you're interpolating user input into a pattern, escape it first — otherwise a stray `(` throws a `SyntaxError` and `.*` becomes an unintended wildcard:

```ts
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

new RegExp(escapeRegex('price: $9.99 (sale)'), 'i')
```

There's also a TC39 proposal for `RegExp.escape` — check support before reaching for it.

---

## Flags

| Flag | Name | What it does |
|---|---|---|
| `g` | global | Find all matches, not just the first |
| `i` | ignoreCase | Case-insensitive |
| `m` | multiline | `^` and `$` match at line breaks, not just string start/end |
| `s` | dotAll | `.` also matches newlines |
| `u` | unicode | Treat the pattern as Unicode code points; enables `\p{…}` |
| `v` | unicodeSets | Superset of `u` — set operations inside `[…]` |
| `y` | sticky | Match must start exactly at `lastIndex` |
| `d` | hasIndices | Adds `.indices` to match results |

```ts
'Line one\nLine two'.match(/^Line/gm) // ['Line', 'Line']
/a.c/.test('a\nc') // false
/a.c/s.test('a\nc') // true
```

`m` only changes what `^` and `$` mean. `s` only changes what `.` means. They're independent and frequently confused.

---

## Character classes

```
.        any char except newline (unless `s` flag)
\d       digit          [0-9]
\D       non-digit
\w       word char      [A-Za-z0-9_]
\W       non-word char
\s       whitespace     space, tab, newline, \r, \f, \v, unicode spaces
\S       non-whitespace
\t \n \r tab, newline, carriage return
\0       NUL
\xHH     char by 2-digit hex, e.g. \x41 === 'A'
\uHHHH   char by 4-digit hex, e.g. \u00e9 === 'é'
\u{1F600} code point — requires the `u` or `v` flag
```

`\w` is ASCII-only. It does **not** match `é`, `ñ`, or `日`. For real-world text use Unicode property escapes (below).

### Custom classes

```ts
/[aeiou]/       // any one of these
/[^aeiou]/      // anything but these — ^ only negates inside brackets
/[a-z0-9_-]/    // ranges; put - first or last to match a literal hyphen
/[\d\s]/        // shorthands work inside brackets
```

Inside `[…]` most metacharacters lose their meaning — `[.+*]` matches a literal dot, plus, or asterisk. You still need to escape `]`, `\`, and `^` (when leading).

---

## Quantifiers

```
*        0 or more
+        1 or more
?        0 or 1 (optional)
{3}      exactly 3
{3,}     3 or more
{3,5}    3 to 5
```

By default quantifiers are **greedy** — they consume as much as possible, then backtrack. Add `?` to make them **lazy** (as little as possible):

```ts
const html = '<b>bold</b> and <i>italic</i>'

html.match(/<.+>/)[0] // '<b>bold</b> and <i>italic</i>'  greedy
html.match(/<.+?>/)[0] // '<b>'                            lazy
```

Lazy quantifiers are the fix for 90% of "my regex matched way too much" problems.

---

## Anchors and boundaries

```
^        start of string (or line, with `m`)
$        end of string (or line, with `m`)
\b       word boundary
\B       not a word boundary
```

```ts
/^\d+$/.test('12345') // true  — entire string is digits
/^\d+$/.test('123a') // false

'cat catalogue'.match(/\bcat\b/g) // ['cat'] — not 'catalogue'
```

Gotcha: `\b` is defined in terms of `\w`, so it behaves oddly around accented characters and emoji.

Also: `^…$` with the `m` flag will happily let a multi-line string pass a "validation" regex. If you're validating a whole input, don't use `m`.

---

## Groups

```
(…)          capturing group
(?:…)        non-capturing group — grouping without a capture slot
(?<name>…)   named capturing group
\1           backreference to group 1
\k<name>     backreference to a named group
```

```ts
const date = '2026-07-28'

// Numbered
const [, y, m, d] = date.match(/(\d{4})-(\d{2})-(\d{2})/)!

// Named — far more readable, and survives reordering
const { year, month, day } = date.match(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
)!.groups!
```

Backreferences match the same **text** that a group captured, which makes them good at finding repetition:

```ts
// Doubled words
'the the quick brown brown fox'.match(/\b(\w+)\s+\1\b/g)
// ['the the', 'brown brown']

// Matching quote styles
/(["'])(.*?)\1/.exec(`say "hi" now`)[0] // '"hi"' — closing quote must match the opener
```

Use `(?:…)` whenever you only need grouping — it keeps capture numbering clean and is marginally faster.

---

## Alternation

```ts
/cat|dog|bird/.test('I have a dog') // true

// Alternation has the lowest precedence — group it when it matters
/^(cat|dog)s?$/.test('dogs') // true
/^cat|dog$/ // means: (^cat) OR (dog$) — probably not what you want
```

Order matters: the engine takes the **first** alternative that matches, not the longest. Put longer alternatives first: `/\b(JavaScript|Java)\b/`, not the reverse.

---

## Lookaround

Zero-width assertions — they check for a pattern without consuming it.

```
(?=…)    positive lookahead   — followed by
(?!…)    negative lookahead   — not followed by
(?<=…)   positive lookbehind  — preceded by
(?<!…)   negative lookbehind  — not preceded by
```

```ts
// Number followed by 'px', capture just the number
'width: 20px'.match(/\d+(?=px)/)![0] // '20'

// Number NOT followed by 'px'
'20px 30em'.match(/\d+(?!px|\d)/g) // ['30']

// Price preceded by £
'£42 and $99'.match(/(?<=£)\d+/)![0] // '42'

// Words not preceded by '@'
'hello @world'.match(/(?<!@)\b\w+/g) // ['hello']
```

Lookbehind is supported in all modern engines (Node 8.3+, Safari 16.4+), but bear in mind older Safari throws a `SyntaxError` at *parse* time — which can take down an entire bundle, not just the one feature. If you must support ancient Safari, feature-detect in a `try/catch`.

Classic use: password validation without writing four separate tests.

```ts
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/
```

Each lookahead scans from position 0 independently, so order is irrelevant.

---

## Unicode property escapes

Requires the `u` or `v` flag. This is how you handle non-English text properly.

```ts
/\p{L}/u          // any letter, any language
/\p{Lu}/u         // uppercase letter
/\p{N}/u          // any number
/\p{Script=Cyrillic}/u
/\p{Emoji_Presentation}/u
/\P{L}/u          // capital P negates
```

```ts
// A "word" regex that actually works internationally
const words = 'Café naïve 日本語 tests'.match(/[\p{L}\p{N}_]+/gu)
// ['Café', 'naïve', '日本語', 'tests']

// vs. \w, which mangles it
'Café naïve'.match(/\w+/g) // ['Caf', 'na', 've']
```

The `v` flag adds set operations, which are genuinely useful for emoji and script filtering:

```ts
/[\p{Script=Greek}--[\p{Lu}]]/v // Greek letters, minus uppercase (difference)
/[\p{L}&&\p{ASCII}]/v // ASCII letters only (intersection)
```

### Splitting strings with emoji

`.length` and `split('')` count UTF-16 code units, which breaks on anything outside the BMP:

```ts
'👨‍👩‍👧'.length // 8
;[...'👨‍👩‍👧'].length // 5 — code points (3 people + 2 joiners)

// Grapheme clusters — what a human calls "a character"
const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
;[...seg.segment('👨‍👩‍👧')].length // 1
```

Use `Intl.Segmenter` over regex for anything user-facing that involves counting characters.

---

## The methods

### `test` — boolean

```ts
/\d/.test('abc1') // true
```

Fastest option when you only need yes/no. **Never** use a `g`-flagged regex with `test` in a loop or a reused variable — see the `lastIndex` gotcha below.

### `match` — one match, or all matches

```ts
// Without `g`: rich result object
const m = '2026-07-28'.match(/(\d{4})-(\d{2})/)
m[0] // '2026-07' full match
m[1] // '2026'    group 1
m.index // 0
m.input // '2026-07-28'
m.groups // named groups, or undefined

// With `g`: flat array of full matches only — no groups, no index
'a1b2c3'.match(/\d/g) // ['1', '2', '3']

// No match: null, NOT []
'abc'.match(/\d/g) // null
```

That `null` return is a constant source of `TypeError: Cannot read properties of null`. Guard it, or use `matchAll`/`??  []`.

### `matchAll` — all matches, with full detail

```ts
const css = 'margin: 10px 20px 30px'

for (const m of css.matchAll(/(\d+)(px|em)/g)) {
  console.log(m[1], m[2], m.index)
}

// Or collect
const all = [...css.matchAll(/(\d+)px/g)].map((m) => Number(m[1]))
// [10, 20, 30]
```

Requires the `g` flag (throws `TypeError` without it). Returns an iterator, so it's `[...]` or `for…of`. This is what you want almost any time you'd reach for a `while (exec())` loop.

### `exec` — stateful iteration

```ts
const re = /(\d+)/g
let m: RegExpExecArray | null

while ((m = re.exec('a1b22c333')) !== null) {
  console.log(m[1], re.lastIndex)
}
```

Same result shape as non-global `match`. Only reach for this over `matchAll` if you need to mutate `lastIndex` mid-loop.

### `replace` / `replaceAll`

```ts
'2026-07-28'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1') // '28/07/2026'
```

Replacement string patterns:

| Pattern | Inserts |
|---|---|
| `$&` | the whole match |
| `` $` `` | text before the match |
| `$'` | text after the match |
| `$1`, `$2` | numbered group |
| `$<name>` | named group |
| `$$` | a literal `$` |

```ts
// Named groups read much better
'2026-07-28'.replace(
  /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/,
  '$<d>/$<m>/$<y>',
)
```

A **function** replacer gives you real logic. Args are `(match, ...groups, offset, string, groups?)`:

```ts
// kebab-case → camelCase
const camel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
camel('background-image-url') // 'backgroundImageUrl'

// camelCase → kebab-case
const kebab = (s: string) =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
kebab('backgroundImageUrl') // 'background-image-url'

// Named groups arrive as the last argument
'2026-07-28'.replace(
  /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/,
  (...args) => {
    const { y, m, d } = args.at(-1) as Record<string, string>
    return `${d}/${m}/${y}`
  },
)

// Templating
const template = (str: string, data: Record<string, unknown>) =>
  str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''))

template('Hi {{name}}, you have {{count}} messages', {
  name: 'Zander',
  count: 3,
})
```

`replace` with a non-global regex only replaces the first occurrence. `replaceAll` replaces every one, and **throws** if given a regex without `g` — which is a genuinely useful safety net.

### `search` and `split`

```ts
'hello world'.search(/world/) // 6, or -1
'a1b22c'.split(/\d+/) // ['a', 'b', 'c']
'a1b22c'.split(/(\d+)/) // ['a', '1', 'b', '22', 'c'] — captures included
'a,b;c d'.split(/[,;\s]/) // ['a', 'b', 'c', 'd']
```

`split` with capture groups keeping the delimiters is a nice trick for tokenising.

---

## Gotchas

### `lastIndex` state

A `g` or `y` flagged regex object carries mutable state. Reusing one is a bug factory:

```ts
const re = /\d/g

re.test('a1') // true  — lastIndex now 2
re.test('a1') // false — resumed from index 2!
re.test('a1') // true  — lastIndex reset to 0 after failure
```

Fixes, in order of preference:

1. Drop the `g` flag — `test` doesn't need it.
2. Create the regex inline rather than hoisting it to module scope.
3. Reset manually: `re.lastIndex = 0`.

The same trap applies to a module-level regex shared across function calls, or a regex in a React component body reused across renders.

### Catastrophic backtracking (ReDoS)

Nested quantifiers over overlapping character sets can blow up exponentially:

```ts
// DON'T — hangs on 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!'
const bad = /^(a+)+$/

// DON'T — a classic vulnerable "email" regex
const alsoBad = /^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@)/
```

The problems to look for: `(x+)+`, `(x*)*`, `(a|ab)+`, and alternations where branches can match the same text. Fixes: make the inner pattern unambiguous, use a lazy quantifier, bound the repetition with `{1,20}`, or split the job into two simpler passes. If a pattern comes from user input, put a hard length cap on it.

### Don't parse HTML

Genuinely — use `DOMParser` or the actual DOM. Regex can't handle nesting, and every "just this once" HTML regex eventually meets a nested tag or an attribute containing `>`.

### Email validation

The full RFC 5322 grammar is not worth expressing as a regex. Do a sanity check and then send a confirmation email:

```ts
const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
```

---

## Useful patterns

```ts
// Trim + collapse internal whitespace
const normalise = (s: string) => s.trim().replace(/\s+/g, ' ')

// Slugify
const slugify = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

slugify('Héllo, World! (2026)') // 'hello-world-2026'

// Thousands separators
const commas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
commas(1234567) // '1,234,567'

// Hex colour, 3/4/6/8 digit
const hex = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

// URL — leans on the URL constructor for the hard part
const isUrl = (s: string) => {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

// UUID v4
const uuidV4 =
  /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i

// ISO 8601 date (shape only — doesn't reject Feb 31st)
const isoDate = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/

// Semver, from semver.org's official pattern
const semver =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*))*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/

// Markdown links → [text](url)
const links = [...md.matchAll(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g)]

// Fenced code blocks, with optional language
// (backticks written as \u0060 so this snippet can live inside a code fence)
const blocks = [...md.matchAll(/^\u0060{3}(\w+)?\n([\s\S]*?)^\u0060{3}$/gm)]

// Frontmatter
const fm = /^---\n([\s\S]*?)\n---/.exec(md)?.[1]

// Duplicate lines
const dupes = text.match(/^(.*)$\n(?=^\1$)/gm)

// Strip ANSI escape codes
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '')
```

---

## TypeScript specifics

`match` and `exec` return `null`, and `.groups` is `Record<string, string> | undefined` regardless of what your pattern guarantees. TypeScript can't infer group names from a pattern, so narrow explicitly rather than reaching for `!`:

```ts
const parseDate = (input: string) => {
  const m = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/.exec(input)
  if (!m?.groups) return null

  const { year, month, day } = m.groups as {
    year: string
    month: string
    day: string
  }
  return { year: +year, month: +month, day: +day }
}
```

With the `d` flag you get positional info too:

```ts
const m = /(?<num>\d+)/d.exec('abc 42')!
m.indices?.groups?.num // [4, 6]
```

For anything with real parsing requirements, a regex-backed schema in Zod or Valibot gives you the types *and* the validation in one place.

---

## Tooling

- [regex101](https://regex101.com) — the good one. Set the flavour to ECMAScript, use the explanation pane, and watch the step counter for backtracking blowups.
- [RegExr](https://regexr.com) — nice cheatsheet sidebar, good for learning.
- [Regexper](https://regexper.com) — renders a regex as a railroad diagram, which is the fastest way to understand someone else's monstrosity.
- [regexes.dev](https://regexes.dev) — vetted, copy-pasteable patterns.
- [MDN regex reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) — the actual spec behaviour, including flag interactions.
- [`super-regex`](https://github.com/sindresorhus/super-regex) — runs a regex with a timeout, so a ReDoS pattern can't take out your server.

If a pattern needs a comment to explain it, it probably wants to be two simpler patterns, or a small parser. Regex is write-once, read-never — be kind to whoever hits it next.
