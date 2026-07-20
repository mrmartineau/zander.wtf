---
slug: css-text-wrapping
title: 'text-wrap, overflow-wrap and word-break: which one do I actually want?'
subtitle: A practical guide to CSS's confusingly-similar text wrapping and breaking properties, and when to reach for each one
date: 2026-07-19
tags:
  - css
---

I don't know about you, but every time a long URL blows out a layout, I do the same dance: type `word-` or `break`, stare at the autocomplete, and pick one of `word-wrap`, `word-break` or `overflow-wrap` more or less at random until the overflow goes away. I've been writing CSS for a very long time and I still couldn't have told you the actual difference between them without looking it up. So I finally looked it up properly, and wrote it down so I never have to again.

**TL;DR — the mental model:**

- ✅ `text-wrap` — controls the overall line-wrapping strategy. Layout-level stuff: balanced headings, no orphans, or no wrapping at all.
- ✅ `overflow-wrap` — lets the browser break a too-long word as a last resort. Your fix for long URLs and user-generated garbage. **Use this one 95% of the time**.
- ✅ `word-break` — lets the browser break words anywhere, all the time. **Aggressive**. Mostly for <abbr title="Chinese, Japanese and Korean">CJK</abbr> text or walls of hash-like strings.
- 🚫 `word-wrap` — doesn't really exist. It's a legacy alias for `overflow-wrap`. Stop typing it (I'm telling myself this as much as you).

If you just want the "which one do I use" cheatsheet, [skip to the end](#the-cheatsheet).

---

## overflow-wrap — the last-resort break

This is the one you almost always want. `overflow-wrap` controls whether the browser is *allowed* to break an otherwise-unbreakable string — a long URL, a `veryLongCamelCaseIdentifier`, someone's 47-character German compound noun — when it would otherwise overflow its container.

```css
.comment-body {
  overflow-wrap: anywhere;
}
```

The key word is **last resort**. Text wraps normally at spaces and hyphens like it always did; the break-anywhere behaviour only kicks in when a single word is longer than the line and there's no other option. Normal prose is completely unaffected, which is exactly the behaviour you want for user-generated content.

It has three values:

- `normal` — the default. Unbreakable words overflow. Hello, horizontal scrollbar.
- `break-word` — break long words when they'd overflow.
- `anywhere` — same as `break-word`, with one subtle difference (next paragraph).

### break-word vs anywhere

The difference is **intrinsic sizing**. With `anywhere`, the potential break points are taken into account when the browser calculates the element's `min-content` size — with `break-word`, they aren't.

In a plain block layout you'll never notice. But inside flexbox or grid — where `min-content` sizing decides how small an item is allowed to shrink — it matters a lot. A flex item containing a long URL with `overflow-wrap: break-word` can still refuse to shrink and blow out your layout, because its `min-content` width is the full unbroken word. The same item with `anywhere` shrinks happily, because its `min-content` is now roughly one character wide.

This is a close cousin of the classic `min-width: 0` flexbox fix, and it's why my default is `anywhere` rather than `break-word`.

---

## word-break — the aggressive one

`word-break` sounds like it does the same thing, and this is where most of the confusion lives. The difference:

> `overflow-wrap` breaks a word only when it *has* to. `word-break: break-all` breaks *between any two characters* whenever a line is full, whether the word would overflow or not.

With `break-all`, ordinary English words get chopped mid-word at the end of every line, with no hyphens and no regard for readability. You almost never want that for prose. Where it earns its keep:

- Tables or lists full of hashes, tokens, and other machine-generated strings, where "words" are meaningless and you just want dense wrapping.
- <abbr title="Chinese, Japanese and Korean">CJK</abbr> text handling, which is most of the reason the property exists.

```css
.commit-hash {
  word-break: break-all;
}
```

Its values:

- `normal` — default breaking rules.
- `break-all` — break between any characters (except <abbr title="Chinese, Japanese and Korean">CJK</abbr> text follows its own rules).
- `keep-all` — the opposite direction: *don't* break between <abbr title="Chinese, Japanese and Korean">CJK</abbr> characters. No effect on non-CJK text.

There's also a `word-break: break-word` value, which is deprecated — it was a compatibility shim that behaves like `overflow-wrap: anywhere`. If you have it in a codebase, replace it.

---

## text-wrap — the modern, layout-level one

`text-wrap` is the newest of the three and it's answering a different question entirely. It doesn't care about individual overflowing words — it controls the line-breaking *strategy* for the whole block.

```css
h1, h2, h3 {
  text-wrap: balance;
}

p {
  text-wrap: pretty;
}
```

The useful values:

- `wrap` / `nowrap` — wrap normally, or don't wrap at all. `text-wrap: nowrap` is the modern spelling of what we've always used `white-space: nowrap` for.
- `balance` — makes all lines roughly equal length instead of leaving a short straggler on the last line. Made for headings. Browsers limit it to short blocks (Chromium: six lines or fewer), so don't bother putting it on paragraphs.
- `pretty` — tells the browser it can spend more effort on line breaking to avoid typographic ugliness, most notably single-word orphans on the last line. Designed for body text, at a small performance cost.
- `stable` — for editable or dynamic content; ensures lines *above* the edit point don't re-wrap as you type.

Strictly speaking `text-wrap` is a shorthand for `text-wrap-mode` (`wrap`/`nowrap`) and `text-wrap-style` (`balance`/`pretty`/`stable`), but I've never needed the longhands.

My baseline for every new project these days:

```css
h1, h2, h3, h4 {
  text-wrap: balance;
}

p, li {
  text-wrap: pretty;
}
```

Two lines, zero downside, and your headings stop looking accidental.

---

## The neighbours

A few properties that hang around the same problem space and add to the confusion:

**`white-space`** — controls how whitespace *inside* the text is handled (collapse it? honour newlines?) and whether text wraps at all. `pre`, `pre-wrap` and `pre-line` are still the tools for rendering code or preserving user-entered line breaks. Fun fact: it's now officially a shorthand for `white-space-collapse` + `text-wrap-mode`, which explains the overlap with `text-wrap: nowrap`.

**`hyphens`** — the civilised alternative to breaking words. `hyphens: auto` breaks long words at *dictionary-correct* hyphenation points and adds a hyphen character. Needs a `lang` attribute on your HTML to work, and quality varies by language and browser. For justified or narrow-column text it looks far better than `overflow-wrap`'s brute-force chop. `manual` (the default) only breaks at `&shy;` soft hyphens you've placed yourself.

**`<wbr>` and `&shy;`** — HTML-level hints for a single break opportunity. `<wbr>` marks "you may break here" (great inside a long URL you're displaying), `&shy;` does the same but renders a hyphen when the break happens.

**`line-break`** — <abbr title="Chinese, Japanese and Korean">CJK</abbr>-specific strictness control for which characters can start/end a line. If you're not typesetting Japanese, you'll likely never touch it.

**`text-overflow: ellipsis`** — not a wrapping property at all: it *truncates* instead of wrapping. Needs `overflow: hidden` and a nowrap (or `line-clamp` for multi-line) to do anything.

---

## The cheatsheet

| I want… | Use |
|---|---|
| Long URLs / user content not to blow out the layout | `overflow-wrap: anywhere` |
| …and it's inside flexbox/grid and *still* overflowing | still `overflow-wrap: anywhere` (not `break-word`) — or check for a missing `min-width: 0` |
| Nicer wrapping for headings | `text-wrap: balance` |
| No orphan word on the last line of paragraphs | `text-wrap: pretty` |
| Dense wrapping of hashes/tokens/code-ish strings | `word-break: break-all` |
| Words broken at proper hyphenation points | `hyphens: auto` + `lang` attribute |
| A break hint in one specific spot | `<wbr>` or `&shy;` |
| Truncation with an ellipsis, not wrapping | `text-overflow: ellipsis` |
| To type `word-wrap` | don't — it's the legacy alias for `overflow-wrap` |

The unlock for me was realising the three properties operate at three different levels: `text-wrap` is about *lines*, `overflow-wrap` is about *emergencies*, and `word-break` is about *rewriting the rules*. Now when the autocomplete pops up I actually know which one I'm reaching for — and hopefully you do too.
