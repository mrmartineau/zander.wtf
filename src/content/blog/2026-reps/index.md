---
slug: reps
title: "Reps: Wordle, but with JavaScript"
subtitle: A write-up of the interesting parts of the daily JavaScript puzzle game I built in June. Puzzles as YAML data, a Web Worker sandbox, and a CI pipeline that deploys a playable preview of every submitted puzzle.
date: 2026-09-24
tags:
  - side-project
  - javascript
  - cloudflare
  - github-actions
  - react
---

I built Reps at the end of May and [launched it a few days later](/blog/2026-06-03-reps). In this age of AI I write less code than I used to, and it felt like I was losing a skill. Not the big stuff, that's fine. The muscle memory. The bit where you know what `reduce` is going to do before you've finished typing it. Reviewing an agent's diff keeps the judgement sharp. It does nothing for the hands.

So I wanted a short daily thing. Like Wordle: one puzzle a day, five minutes, no backlog to feel guilty about. Write a small function in the browser, watch three tests run, share a row of coloured squares. [Reps](https://reps.zander.wtf) is what came out of that.


**TL;DR**

- Every puzzle is a plain YAML file: prompt, three tests, a reference solution. There are 118 of them now.
- Your code runs in a fresh Web Worker per test, with a 2 second kill switch.
- The validator compiles every reference solution and runs it against its own tests. That's the entire test suite.
- Open a PR with a puzzle and CI deploys a playable Cloudflare preview and comments the link.
- Promoting accepted puzzles into the live rotation is a workflow that commits back to `main`.
- Vite, React, Monaco, [ZUI](https://zui.zander.wtf), Cloudflare Workers. No backend at all.

## The shape of it

Every day you get one puzzle: a prompt with a worked example, and a Monaco editor with some starter code in it. Write the function, hit run, and three tests go green or red one at a time. Solve it and you get a spoiler-free share string, coloured squares and a time, never your code.

The three tests are always in the same order: happy path, a second normal case, then an edge case. That's a rule for contributors rather than a coincidence. The third one is where you find out your solution was hardcoded.

The recommended solution sits behind a button you can press at any point, with no penalty. Reps is a warm-up, not an exam, and a puzzle you failed and can't learn from is just a bad morning. So each one also carries an explanation written for someone who tried and couldn't see the path. I press that button plenty.


## How puzzles are made

I took this idea from [Astro](https://astro.build). Reps has its own content collection, made of YAML files, working much the way Astro's content collections do. Content is files on disk, a schema says what shape those files have to be, and a check runs over them before any of it ships. No database, no CMS, no admin panel. Adding a puzzle is adding a file.


So every puzzle is one YAML file. No registration, no imports, nothing to wire up:

```yaml
id: 11
title: 'Chunk an Array'
difficulty: medium
prompt: |
  Implement `chunk(arr, size)` so it splits `arr` into sub-arrays of length
  `size` (the last chunk may be shorter).

  For example, `chunk([1, 2, 3, 4, 5], 2)` returns `[[1, 2], [3, 4], [5]]`.
functionName: chunk
starterCode: |
  function chunk(arr, size) {
    // your code here
  }
tests:
  - name: 'Even split'
    args: [[1, 2, 3, 4, 5], 2]
    expected: [[1, 2], [3, 4], [5]]
  - name: 'Exact fit'
    args: [[1, 2, 3], 3]
    expected: [[1, 2, 3]]
  - name: 'Empty input'
    args: [[], 3]
    expected: []
solution: |
  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }
```

`args` is spread into the call, so `args: [[1,2,3], 2]` calls `chunk([1,2,3], 2)`. A deep equality that handles arrays, plain objects and `NaN` compares the result against `expected`. It doesn't handle `Map` or `Set`, so puzzles have to convert those before returning. The validator hard-fails if you try.

A separate `index.json` holds the schedule: a launch date and an ordered list of puzzle ids that the app walks through a day at a time, wrapping back to the start when it reaches the end. Adding a puzzle file doesn't put it in rotation, someone has to add it to that list, so the difficulty pacing stays curated.

## Running a stranger's code in their own browser

There's no backend. Your solution never leaves your machine, which removes an entire category of problem and introduces one. An infinite loop would lock the tab.

So each test gets its own Web Worker, and the runner holds a hard timeout over it:

```js
const timer = setTimeout(() => {
  worker.terminate()
  resolve({ name: test.name, pass: false, error: `Timed out after ${TIMEOUT_MS} ms` })
}, TIMEOUT_MS)
```

`while(true)` gives you a clean red "Timed out after 2000 ms" instead of a beachball. A fresh worker per test also means one bad test can't take the other two down with it.

Inside the worker, three details that each came from something going wrong:

```js
const factory = new Function(
  'console',
  `"use strict";\n${code}\n;return typeof ${functionName} === "function" ? ${functionName} : undefined;`
)
const fn = factory(captureConsole)
const args = structuredClone(test.args)
const received = fn(...args)
```

`"use strict"` stops accidental globals leaking between runs. `structuredClone` on the arguments means a solution that mutates its input can't poison the comparison for the next test, and you can mutate freely without being punished for it. And `console` is passed in as a parameter, shadowing the global, so every `console.log` you left in your working gets captured and shown next to the test result rather than disappearing into a worker's devtools context nobody opens.

That last one was [a whole commit on its own](https://github.com/mrmartineau/reps.zander.wtf/commit/86a66a4) and it's the single change that made debugging a failing puzzle feel normal.

### React puzzles

A puzzle can set a `kind` and ask for a React component or a custom hook instead of a pure function. JSX is compiled in the browser with [Sucrase](https://github.com/alangpierce/sucrase), and component tests assert against the rendered DOM with a small declarative DSL:

```yaml
kind: react-component
componentName: TaskList
tests:
  - name: 'Renders one <li> per task'
    props: { tasks: ['a', 'b', 'c'] }
    assert: { selector: 'ul li', count: 3 }
```

React needs the DOM, and a Web Worker doesn't have one. So these render on the main thread into a hidden container that's torn down after each test, which means they get none of the worker's timeout protection. A mistyped render loop can hang the tab, so a sandboxed `<iframe>` I can terminate is the obvious next job. Two samples ship outside the daily rotation at `?preview=900` and `?preview=901` if you want to try them.

## How puzzles are submitted

This is the part I enjoyed building most, because the tension is real. I want contributions to be easy, and I want to keep control of pacing. If contributors picked their own day numbers they'd collide, and the difficulty spread would drift into three hard puzzles in a row and scare off anyone new.

So nobody picks a day number:

1. Drop a `.yaml` file in `submissions/` with `id: 0`.
2. Run `pnpm validate-submissions`.
3. Open a PR.
4. If it's accepted, a workflow assigns the real id and slots it into the rotation.

`submissions/` is a holding area that never ships to the live site. Two `example-*.yaml` files live there permanently as templates, and the prefix is reserved so promotion skips them.

### The validator is the test suite

There's no Vitest, no Jest, nothing. `scripts/validate-puzzles.mjs` checks the structure, then compiles each puzzle's `solution` and runs it against that puzzle's own three tests, asserting deep equality with `expected`.

```
node scripts/validate-puzzles.mjs public/puzzles      # the live set
node scripts/validate-puzzles.mjs submissions         # drafts
```

That closes the gap where a stored `expected` value drifts away from a working answer. You can't hand-write an `expected` that's subtly wrong and have it sit there for months, because the reference solution has to produce it. It mirrors `src/lib/equal.js` on purpose, so validation matches in-browser behaviour exactly. Two copies of a deep-equal function is a small sin I'll take over the build complexity of sharing one between a browser bundle and a Node script.

### An agent skill for writing puzzles

The repo has `.claude/skills/new-puzzle/SKILL.md`, a skill that walks anyone, or any agent, from a puzzle idea to a validated draft. It encodes the calibration rules: reject one-liners with no decision in them, reject anything impure or locale-dependent, reject anything you'd have to look up, be honest about difficulty because the badge drives ordering.

There's a nice symmetry to it. The thing I built to stop leaning on AI is itself authored with AI. I generated most of the 118 puzzles with Claude working through that skill, because writing 118 puzzles by hand is exactly the kind of work I don't want to be doing. The reps are in solving them, not in typing out YAML.

It also means the set is harder than one I'd have written alone, and I'm glad of that. Left to myself I'd have written 118 puzzles sitting comfortably inside what I already know. A fair number of these I can't do quickly, and I hit the reveal button like everyone else.

## Every PR gets a playable preview

`pr-preview.yml` runs on any PR touching puzzles or source. It validates the live set and the submissions, always, including PRs from forks.

Then, if the PR changed a file in `submissions/`, it does something better than a screenshot. It deploys a Cloudflare Workers **version**, not a deployment:

```yaml
- uses: cloudflare/wrangler-action@v3
  with:
    command: versions upload --preview-alias pr-${{ github.event.pull_request.number }}
```

`versions upload` uploads new code without routing production traffic to it, and `--preview-alias` gives that version a stable, guessable URL: `pr-5-reps.zanderwtf.workers.dev`. The alias comes from the PR number, so pushing a new commit updates the same link rather than generating a new one.

A `github-script` step then comments on the PR with deep links straight to each changed submission. [PR #5](https://github.com/mrmartineau/reps.zander.wtf/pull/5) added 60 drafts in one go, so its comment runs to 60 links:

> ### 🧩 Submission preview
>
> Preview the submission(s) in this PR on the deployed site:
>
> - [`affordable-items.yaml`](https://pr-5-reps.zanderwtf.workers.dev/submissions.html?file=affordable-items.yaml)
> - [`array-diff.yaml`](https://pr-5-reps.zanderwtf.workers.dev/submissions.html?file=array-diff.yaml)
> - (57 more)
> - [`zip.yaml`](https://pr-5-reps.zanderwtf.workers.dev/submissions.html?file=zip.yaml)
>
> All submissions: https://pr-5-reps.zanderwtf.workers.dev/submissions.html

That PR merged months ago and its preview is still serving all 60 drafts, if you want to see what a contributor sees: [pr-5-reps.zanderwtf.workers.dev/submissions](https://pr-5-reps.zanderwtf.workers.dev/submissions).

The comment carries an HTML marker, `<!-- reps-preview -->`, and the script looks for it before posting. If it's there, it edits that comment in place. One comment per PR, always pointing at the latest commit, no wall of bot noise.

Fork PRs can't read secrets or write comments, by design, so the preview block is gated and they skip it. A fork contributor still gets their puzzle validated, just not deployed.

The preview page is a second Vite entry: `index.html` is the game, `submissions.html` is the contributor preview.

## Promoting drafts into the rotation

`promote-submissions.yml` is manually triggered, guarded to `main` only, and it does the whole promotion:

- Validates every draft first, and refuses to continue if one fails.
- Assigns each the next free id, taken as the highest across both the live files and the index, so the two can't drift into a collision.
- Renames it to `puzzle-NNN.yaml`, zero-padded, because that's the path the loader fetches, and appends `{ id, title }` to `days[]`.
- Re-validates, then commits back to `main`.

Three decisions in there I'd defend. The workflow only ever appends to `days[]` and never inserts, so a date that showed puzzle 12 last week still shows puzzle 12 forever. It shuffles the drafts before assigning ids, because `readdirSync` order is alphabetical and promoting 76 at once would have put every puzzle starting with "a" in the same week. And it rewrites only the `id` line, with a regex rather than a YAML load-and-dump, because round-tripping through `js-yaml` reflows the whole document and turns a clean review diff into noise.

## Deploying by hand

`deploy.yml` is `workflow_dispatch` only. Push to `main` doesn't ship. For a daily game where a bad deploy means a broken puzzle for everyone that morning, a manual button is fine, and I'd rather have it.

## The stack

- **Vite 8** with `@vitejs/plugin-react`, and the [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), which emits a deployable `dist/wrangler.json` for a static-assets Workers site. There's no Worker entry at all, just assets with an SPA fallback.
- **React 19** for the UI.
- **[Monaco](https://microsoft.github.io/monaco-editor/)** via `@monaco-editor/react`. It's about a megabyte gzipped, which for an editor-centric game is the cost of the thing rather than a regression, so the build's size warning is turned up rather than ignored.
- **[ZUI](https://zui.zander.wtf)**, my own CSS-first component library, which is why there's almost no CSS of my own in the repo.
- js-yaml for puzzles, react-markdown and remark-gfm for prompts, Sucrase for the JSX transform.
- pnpm, wrangler, Cloudflare Workers.

## Where it would go next

More languages is the obvious one. The same puzzle with idiomatic implementations per language: JS and TS run in the browser today, Python via Pyodide and Rust via wasm could, and Go, PHP or Swift would want a sandboxed backend runner. The YAML schema would need a `language` field with per-language `starterCode` and `tests`, so one file still describes one puzzle.

Before that, the React puzzles need their `<iframe>` sandbox, because a spike with a known hole shouldn't stay a spike forever.

Did it do what I wanted? For a few months, yes. Five minutes of writing a function from nothing, with no agent and no autocomplete worth the name, is a completely different activity from reviewing a diff. Both are useful. Only one of them is practice.

[Play today's puzzle](https://reps.zander.wtf), or read the short version on [its project page](/projects/reps). If you write one you like, [the contributor guide](https://github.com/mrmartineau/reps.zander.wtf/blob/main/CONTRIBUTORS.md) explains the format, and CI will deploy it for you to play before anyone reviews it.

---

**P.S.** I don't play it every day any more. I used it properly for a couple of months, then got busy with other side projects, and the daily habit was the first thing to go. That's the usual fate of a side project built to fix a habit, and I'd rather say so than pretend otherwise.

The nice part is that nothing has rotted. It's a static site with no backend, no database and no tokens to expire, and the cycling calendar means it never runs out of puzzles to serve. It's been quietly handing out a puzzle a day the whole time I wasn't looking. I'll come back to it when the React sandbox starts annoying me enough.
