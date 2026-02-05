---
title: aria-label notes
link: https://html5accessibility.com/stuff/2024/05/22/not-so-short-note-on-aria-label-usage-big-table-edition/
tags:
  - a11y
  - html
emoji: ♿
date: 2026-02-04
---

A summary of Steve Faulkner's comprehensive guide on `aria-label` usage.

## General labeling rules

1. Prefer visible labels over hidden labels
2. Prefer text labels over icons (if icons, provide supplementary text on focus/hover)
3. Place visible labels as expected:
   - Checkbox/radio: label immediately after the field
   - Other inputs: label immediately before the field
4. Prefer native HTML labeling mechanisms over ARIA
5. Never use placeholder text as a label

## Key points about aria-label

- Works well on **interactive elements** (buttons, links, inputs)
- Works well on **structural/landmark elements** (nav, main, section, article, aside, header, footer, form, dialog)
- Works poorly or **not at all on text-level semantics** (`span`, `div`, `p`, `strong`, `em`, etc.)
- **Prohibited** on elements with `role=generic` (div, span, b, i, etc.)
- `aria-labelledby` overrides `aria-label`, which overrides all other name sources
- Empty `aria-label=""` does nothing (unlike `alt=""` which signals decorative image)

## When aria-label masks content

On some elements, `aria-label` **masks visible text** — only the aria-label is announced:

```html
<!-- Only "some text" is announced, not "home page" -->
<a href="home.html" aria-label="some text">home page</a>

<!-- Only "some text" is announced, not "open" -->
<button aria-label="some text">open</button>
```

Be wary of [WCAG 2.5.3 Label in Name](https://www.w3.org/TR/WCAG21/#label-in-name) issues when aria-label differs from visible text.

## When aria-label does NOT mask content

On landmark/structural elements, aria-label is announced alongside content when navigated to:

- `article`, `aside`, `details`, `dialog`, `fieldset`, `figure`
- `footer`, `form`, `header`, `main`, `nav`, `section`, `search`

## Prefer native HTML attributes

| Element                       | Use instead of aria-label |
| ----------------------------- | ------------------------- |
| `img`                         | `alt` attribute           |
| `input type="image"`          | `alt` attribute           |
| `area`                        | `alt` attribute           |
| `iframe`                      | `title` attribute         |
| `input`, `select`, `textarea` | `<label>` element         |
| `table`                       | `<caption>` element       |
| `fieldset`                    | `<legend>` element        |
| `optgroup`, `option`          | `label` attribute         |

## Elements where aria-label is NOT well supported

- `h1`–`h6` (works in NVDA/VoiceOver, not JAWS)
- `address`, `blockquote`, `dd`, `dt`, `dfn`, `li`
- `summary`, `output`
- Table parts: `tbody`, `tfoot`, `thead`, `td`, `th`, `tr`

## Elements where aria-label is prohibited

Any element mapping to `role=generic`:

`a` (without href), `b`, `bdi`, `bdo`, `body`, `br`, `cite`, `code`, `data`, `del`, `div`, `em`, `i`, `ins`, `kbd`, `label`, `mark`, `p`, `pre`, `q`, `rp`, `rt`, `ruby`, `s`, `samp`, `small`, `span`, `strong`, `sub`, `sup`, `time`, `u`, `var`, `wbr`
