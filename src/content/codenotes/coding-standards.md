---
title: Coding standards
emoji: ✅
date: git Last Modified
tags:
  - javascript
  - typescript
  - react
  - css
---

The rules I write code by, and the ones I hand to coding agents. The aim is a codebase that reads the same everywhere, so the next person (or agent) can guess a name or a path before they search for it.

Every rule has a reason next to it. A rule without one is easy to ignore, and impossible to argue with when it's wrong.

## General

### Match the project first

Before applying any of this, look at the files next to the one you're changing. If a project already does it differently, match the project. A half-renamed codebase is worse than either scheme on its own.

### Reuse before you write

Look in this order, and stop at the first one that works:

1. **The codebase.** Search `lib/` or `utils/` for a function that already does the job. Two `formatMoney` functions drift apart, and then the UI shows two answers for the same number.
2. **The platform.** `Intl`, `URL`, `structuredClone`, `crypto.randomUUID()`, `<dialog>`, `<details>`, CSS instead of JavaScript.
3. **A dependency you already have.**
4. **A new dependency**, last.

### Names

Descriptive and succinct, never obscure or abbreviated: `customerTotal`, not `custTot`. Well-known short forms (`id`, `url`, `i` in a loop) are fine.

- Booleans read as a question: `isOpen`, `hasError`, `shouldRetry`.
- Functions start with a verb: `formatPence`, `getErrorMessage`.
- Numbers say their unit: `totalPence`, `timeoutMs`.

### Files and folders

Every file and folder name is `kebab-case`, named after its main export: `line-item-table.tsx` exports `LineItemTable`. macOS ignores letter case in file names and Linux doesn't, so with mixed case a renamed file works on your Mac and then breaks on CI. File finders ignore case and hyphens, so typing `LineItemTable` still finds it.

- **One thing, one file**, when someone will want to find it, test it or reuse it: a component, a hook, a table's column definitions, a formatter. A small helper that only its own file uses can stay put.
- **Group by feature** (`components/line-items/`), not by kind (`components/buttons/`).
- **Colocate.** Tests and styles sit next to the file they belong to. No `__tests__/` folders.
- **Logic that isn't UI goes in `lib/`**, where it's easy to test.
- **No barrel `index.ts` files** that only re-export. They slow the bundler and hide where code lives.
- **Types live in the file that uses them** until a second file needs them.

### Functions

- **Return early**, then write the main path with no nesting.
- **Prefer pure functions.** Keep side effects (fetch, storage, the clock) at the edges.
- **Don't change arguments.** Return a new value.
- **More than three arguments, or any boolean argument: use one options object.**

```ts
// What are true, false and 3?
createInvoice(project, customer, true, false, 3)

// Every value is named, the order can't be wrong,
// and adding an option breaks no caller
createInvoice({ project, customer, includeVat: true, isDraft: false, dueInDays: 3 })
```

### Money, dates and numbers

- **Money is whole pence**, never a float. `0.1 + 0.2` is `0.30000000000000004`.
- **An instant is UTC.** Show it in the viewer's time zone.
- **A calendar date is a `YYYY-MM-DD` string**, not midnight UTC. Midnight UTC on 8 November is still 7 November in New York.
- **Format with `Intl` for display only.** Never store a formatted string.

### Errors

- **Throw in `lib/`, catch at the edge**, where you know how to tell the person.
- **Say what failed in words they understand:** "Could not upload invoice.pdf: bigger than 50 MB", not "Error 413".
- **Never swallow an error silently.** An empty `catch` needs a comment saying why.
- **Validate at trust boundaries** (API handlers, form submits, parsed JSON). Inside the app, trust the types.

### Logging

Log once, where the error is handled. Include a source tag and the IDs you'd need to find the problem. `console.error` for a bug someone must fix, `console.warn` for a problem you planned for. No stray `console.log` in a commit.

### Security

- Secrets stay on the server. Anything in a `VITE_` or `PUBLIC_` variable is public.
- Check permissions on the server, every request. Hiding a button isn't a check.
- Never load a row by ID alone; also filter by who owns it.
- Session cookies are `HttpOnly`, `Secure` and `SameSite=Lax`.

### Testing

- Test logic directly, through what it exports.
- Test UI through what the person sees and does. Find elements by role first (`getByRole('button', { name: 'Save' })`) and by test ID last.
- A bug fix starts with a test that fails because of the bug.

### Patterns to avoid

| Avoid | Why | Instead |
| :---- | :-- | :------ |
| A shared helper that grows a flag for each caller | Every caller pays for every other caller's case | Copy until the third use shows what's really shared |
| `isLoading`, `isError` and `data` side by side | They allow states that can't happen | One status: `{ status: 'error', error } \| { status: 'ready', data }` |
| Magic values like `setTimeout(fn, 86400000)` | Nobody knows what the number means | A named constant with its unit: `ONE_DAY_MS` |
| `Date.now()` deep inside logic | You can't test it | Pass it in: `isOverdue(invoice, now)` |
| `?? 0` on data that must exist | The bug shows up as a wrong total instead of an error | Fail loudly where data must exist |
| Clever one-liners and nested ternaries | The next reader has to decode them first | Plain `if` statements and named steps |

## TypeScript

- **`interface` for object shapes**, props included. It's what the TypeScript team recommends: clearer errors, faster checks. `type` for unions, tuples and mapped types.
- **String-literal unions, not enums:** `type Pricing = 'fixed' | 'tbc' | 'weekly'`.
- **No `any`.** Use `unknown` and narrow it.
- **Strict mode, plus `noUncheckedIndexedAccess`**, so `items[0]` is `Item | undefined` and the empty case can't be forgotten.
- **Avoid `as`, `!` and `@ts-ignore`.** Each one tells the compiler to stop checking, and the error turns up somewhere else.

## JavaScript

### Events and callbacks

`on` names the moment; `handle` names the code that responds to it.

```tsx
function handleSave(project: Project) { … }
<ProjectForm onSave={handleSave} />
```

- Name `on` props after what happened, not what the parent will do: `onSave`, not `onSaveToDatabase`.
- Never name your own function `onSomething`. It reads like a prop that was passed in.
- An `on` callback returns nothing. If its return value is used, it's not an event: call it `getRowId` or `renderItem`.
- `onClick={refetch}` passes the click event as `refetch`'s first argument. Wrap it: `onClick={() => refetch()}`.

### Cancelling async work

Every async function that does I/O takes an `AbortSignal` in its options and passes it on. The code that starts the work owns the controller. More in my [AbortController](/notes/abort-controller/) note.

### Traps

| Code | What goes wrong |
| :--- | :-------------- |
| `price \|\| 10` | A price of `0` becomes 10. Use `??` |
| `[10, 9, 1].sort()` | Sorts as text: `[1, 10, 9]` |
| `items.forEach(async …)` | Doesn't wait, and errors are lost |
| `new Date(2026, 11, 8)` | Months start at 0, so that's December |
| `array.sort()` on data you were given | Changes the caller's array. Use `toSorted()` |

## React

- **Function components, named exports, props typed on the parameter.** No `React.FC`.
- **Composition before another prop.** A component with fifteen props changes every time any screen needs something new, and each change can break a screen that didn't ask for it. Let the caller pass the part in:

```tsx
// A prop for every variation
<Card title="Invoice 12" showIcon icon={<FileIcon />} showFooter footerText="Paid" />

// The caller composes what it needs
<Card>
  <Card.Header><FileIcon /> Invoice 12</Card.Header>
  <Card.Footer>Paid</Card.Footer>
</Card>
```

- **Derive, don't sync.** Work values out during render. Don't keep a second `useState` in step with a `useEffect`.
- **Server data lives in TanStack Query**, not `useState`, and every `queryFn` passes its `signal` on.
- **React 19:** `ref` is a normal prop (no `forwardRef`), and defaults go in the destructuring (no `defaultProps`).
- **Avoid:** components defined inside components, `{count && <Badge />}` (renders `0`), and `key={index}` on lists that change order.

## CSS

I write plain CSS, so every class is global. Two things keep that safe.

### Cascade layers

Declare the order once, at the top of the main stylesheet, and put every rule in a layer:

```css
@layer reset, library, base, components, utilities;
```

A later layer beats an earlier one, whatever the specificity, so nobody needs `!important`. Watch out for two things: styles outside any layer beat every layer, and a layer's position is fixed the first time it appears.

### Class names

Loosely based on BEM, from my old [Kickoff](https://github.com/TryKickoff/kickoff) project:

```css
.amountDue { }              /* block: the component, camelCase */
.amountDue-label { }        /* child: a single hyphen */
.amountDue-row--total { }   /* modifier: a double hyphen, after its base rule */
```

Every class in a component's stylesheet starts with its block, so two components can't clash.

### State lives in ARIA

Style state from the attribute that screen readers already use, so what people see and what they hear can't disagree:

```css
.tabs-tab[aria-selected="true"] { }
.menu-trigger[aria-expanded="true"] { }
.nav-link[aria-current="page"] { }
```

Use an `.is-` class only when no ARIA or HTML state exists.

### Native nesting

Fine for states and media queries. Never write `&-label`: native CSS doesn't join strings like Sass does, so it silently matches nothing.

### Layout

Space siblings with `gap`, not margins. Use logical properties (`inline-size`, `padding-block`). Use container queries inside components and media queries for the page.

## Accessibility

- Use the native element first: `<button>` for actions, `<a href>` for navigation.
- Every control has a name: a `<label>` for each input, an `aria-label` for icon-only buttons.
- Everything you can click, you can reach and use with the keyboard.
- Focus is always visible. Style `:focus-visible`.
- A field error uses `aria-describedby`. Keep `role="alert"` for errors the person must hear right now.

> [!TIP]
> **Turn this into a skill for your coding agent.** Coding agents like Claude Code, Codex and Amp support [Agent Skills](https://agentskills.io/home): a folder with a `SKILL.md` that the agent loads when a task matches its description. Copy the parts of this note you agree with into `~/.claude/skills/coding-standards/SKILL.md`, add a `name` and a `description` in the frontmatter that says when to use it ("Use when writing, structuring or reviewing code…"), and change the rules to match how *you* work. That's what I did. Mine has the general rules in `SKILL.md` and a reference file per subject (TypeScript, React, CSS, accessibility, APIs, databases and so on), so the agent only reads what the task needs. Then add a line to each project's `AGENTS.md` pointing at the skill, and every agent working in that repo follows the same rules.
