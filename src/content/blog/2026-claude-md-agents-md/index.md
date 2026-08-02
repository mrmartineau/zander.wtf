---
slug: claude-md-agents-md
title: What should actually go in your CLAUDE.md?
subtitle: The guidance contradicts itself and almost none of it is dated, so here's a map of who says what, what the research supports, and how AGENTS.md fits in.
date: 2026-08-03
tags:
  - ai
  - claude-code
---

If you go looking for advice on how to write a `CLAUDE.md` file, you'll find plenty of it. You'll also find that a lot of it disagrees. One post tells you to use a ten-section template covering your project overview, tech stack, commands and coding standards. Another tells you to keep it under sixty lines. The official docs tell you to ruthlessly prune. And the person who created Claude Code has, in the space of about seven months, publicly recommended both "add a rule every time Claude gets something wrong" and "delete your `CLAUDE.md` every six months".

None of these people are wrong, exactly. They're mostly right about different moments in time. Context files are one of the fastest-moving bits of practice in this whole space, and almost nothing you read is dated clearly enough for you to work out which era it belongs to.

So I did the research, and this is the map. Every claim here is pinned to a date and a source, because the date is the important part.

**TL;DR**

- The current consensus is minimalism. `CLAUDE.md` is loaded into every single conversation, so it should contain only rules that apply universally. Everything conditional belongs in a skill.
- The biggest live conflict is **accretion vs ablation** — growing the file by adding a rule every time the model slips, versus periodically deleting the lot and adding back only what you demonstrably need. It's the same team contradicting itself across model generations: accretion was the practice through mid-2026, ablation is the advice post-Opus 5.
- Much of the newest advice is calibrated to Opus 5 specifically. The portable version: the scaffolding you need is inversely proportional to how capable your model is. Weaker model, more rules — but a tighter budget to fit them in.
- Anything you want *guaranteed* doesn't belong in prose at all. `CLAUDE.md` is advisory; hooks are deterministic.
- The research is thinner and less flattering than the blog posts suggest. Developer-written context files help a little. LLM-generated ones (hello, `/init`) measurably hurt. Most of what `/init` writes — the overview, the architecture summary, the file map — should go. The commands and the genuine gotchas should stay.
- There's no way to make `CLAUDE.md` conditional on the model — subagents on cheap models load the identical file. You *can* make it conditional on file path (`.claude/rules/` with a `paths` glob), on task (skills), and on person (`CLAUDE.local.md`). Per-model instructions go in the subagent definition that pins the model.
- `AGENTS.md` is the cross-tool standard that nearly everything except Claude Code reads natively. The fix is one line: put `@AGENTS.md` at the top of your `CLAUDE.md`.

### Two words I'm going to keep using

These aren't my coinages — they're the vocabulary Anthropic and the Claude Code team use themselves, which is why I've stuck with them rather than reaching for "adding stuff" and "deleting stuff":

<dl>
  <dt><dfn>Accretion</dfn></dt>
  <dd>Growth by gradual accumulation. Applied to a <code>CLAUDE.md</code>: every time the model does something you didn't want, you add a line telling it not to. The file only ever gets longer, and each rule is a scar from a specific past mistake.</dd>
  <dt><dfn>Ablation</dfn></dt>
  <dd>Removal — deliberately cutting material away to see what happens without it. Applied to a <code>CLAUDE.md</code>: you delete the file (or all of it bar a line or two), work normally, watch where the model actually struggles, and add back only the rules that earn their place.</dd>
</dl>

**Ablation** in particular is a deliberate borrowing. It's the standard term in machine learning research for removing a component of a system to measure its contribution, and it's the word Anthropic uses for what it did to Claude Code's own system prompt — delete a part, measure, keep the deletion if nothing gets worse. Applying a research technique to your own project file is exactly the point.

On the accretion side, the team's own name for the practice is **compounding engineering** (a term they credit to Dan Shipper): every correction compounds into a permanent rule, so the system supposedly gets better with every mistake it makes. Accretion is the plainer description of what that does to the file.

Hold onto both — they're the whole story of the last seven months.

---

## The one big inversion

Start with the conflict that explains most of the others.

Boris Cherny created Claude Code at Anthropic in September 2024 and still runs it. His public advice is the closest thing this space has to primary source material, and it inverted itself in about seven months.

**January 2026 — accretion.** Describing the Claude Code team's own shared `CLAUDE.md`, checked into git and edited multiple times a week:

> Anytime we see Claude do something incorrectly we add it to the CLAUDE.md, so Claude knows not to do it next time.

Later the same month, a companion tip: after every correction, end your message with "update your `CLAUDE.md` so you don't make that mistake again". The team even tagged `@.claude` on pull requests to fold review learnings back into the file — their version of what Dan Shipper calls compounding engineering. The default direction is *add*.

**June 2026 — the tension shows.** In a year-in-review conversation, Cherny is a self-described context minimalist at the system prompt level: "you give it the minimal possible system prompt, the minimal possible tools, and then you let the model figure it out". Cat Wu, on the same team: "when you give the model too much context, it's like you're micromanaging it". And yet, in the same conversation, the accretive advice for `CLAUDE.md` is restated: every time Claude makes a mistake, write it to the `CLAUDE.md` or make a skill, and then "Claude can just run forever".

Minimal system prompt, accreting project file. That's the tension, and it held right up until the model got better.

**Late July 2026 — ablation.** Opus 5 shipped on 26 July. In a YC Startup School interview the following day, the advice is the opposite:

- Anthropic deleted more than 80% of Claude Code's system prompt for Opus 5, and the model performed *better*.
- The method: delete the entire prompt, use the product, watch where the model stumbles, and add instructions back one line at a time — only after repeated failures on the same specific issue. Never add a line speculatively, because the model reads it on every single turn.
- The advice to users: delete your `CLAUDE.md` files, your skills and your hooks every six months, and see what the model can do without them before you add anything back.

The 80% figure isn't just interview chatter — it has a primary source. Anthropic's own blog post on context engineering for Claude 5 generation models (Thariq Shihipar, 24 July 2026) states that the team removed over 80% of the system prompt for models like Opus 5 and Fable 5 "with no measurable loss on coding evaluations". There's also an internal calibration flag, `CLAUDE_CODE_SIMPLE=1`, which strips every system prompt including tool prompts — that one comes from the interview rather than the docs, so treat it as reported rather than documented.

The framing underneath all of this is the *unhobbling* thesis: frontier models are being held back by products designed for the weaker models that came before them. Claude Code itself was originally built to unhobble Sonnet 3.5, the first model that could write whole files at a time when the tooling only offered autocomplete or read-only chat. Scaffolding has a shelf life.

**Are these actually contradictory?** Not in mechanism — both camps say prune. But they're opposite in *default direction and cadence*. Accretion says add on every error and edit occasionally. Ablation says delete everything periodically and add back rarely. The honest reading is that the team inverted its own default as the models crossed a capability threshold somewhere between the Opus 4.x line and Opus 5.

Which means: if a post about `CLAUDE.md` doesn't tell you when it was written, you can't use it.

---

## Hang on — is this just Opus 5 advice?

Largely, yes, and it's worth being blunt about that before you go and delete anything.

The ablation turn is pegged to specific models. The 80% cut was made "for models like Opus 5 and Fable 5". The "delete everything every six months" advice comes from an interview given the day after Opus 5 shipped. None of it was tested on, or claimed for, a mid-tier or older model — and plenty of people are running Sonnet or Haiku for cost, older Opus versions for stability, or something else entirely.

So here's the underlying principle, which travels better than the specific advice:

> **The scaffolding you need is inversely proportional to the capability of the model reading it.** Every rule you write is a bet that the model can't work this out on its own. Better models win you those bets back.

That reframes the whole thing as a dial rather than a doctrine. Where you set it:

**Frontier thinking models (Opus 5 and equivalents).** Ablate aggressively. This is where the published advice applies as written — delete, observe, add back the handful of things that actually break. Expect to end up with a very short file.

**Mid-tier and older models (Sonnet, Haiku, previous Opus generations).** Keep more, but be aware the trade is worse in both directions. These models genuinely benefit from more explicit instruction — the explicit commands, the "we use `bun`, not `npm`" line, the gotchas. But their instruction budget is also *tighter*: the instruction-following research finds that frontier thinking models degrade roughly linearly as you pile on instructions, while smaller and non-thinking models degrade **exponentially**. You need more rules and you can afford fewer of them. That makes prioritisation matter more, not less — spend the budget on things that cause real, repeated failures, and push everything else into skills where it's only loaded when relevant.

**Non-Claude models entirely.** The Gloaguen benchmark covered Codex with GPT-5.x and Qwen Code with a 30B local model, and the broad finding held across all of them: hand-written context files gave a small benefit, generated ones didn't. Chroma's context rot result covered 18 frontier models across four vendors and found *every single one* degraded with length. Nothing in the minimalist case is Claude-specific. Write your content in `AGENTS.md` and it works everywhere anyway.

**Mixed teams and mixed models.** If your repo is read by Opus 5, by a colleague's Sonnet, and by CI running something cheaper, the file has to serve the least capable reader in the loop. Tune for that one — the strong model will cope with a slightly over-specified file far better than the weak model copes with an under-specified one.

The practical upgrade to the six-month rule: **re-ablate whenever you change models, not on a calendar.** Six months is just a proxy for "a model generation has probably passed". A model switch is the actual trigger. When you move up a tier, try deleting half the file and see what breaks. When you move *down* a tier — cost pressure, rate limits, an offline model — expect to add some of it back, and don't read the resulting mess as a personal failure. It's the dial moving, not you regressing.

And some of the guidance doesn't move with the dial at all. Hard guarantees belong in hooks regardless of model. Conditional context belongs in skills regardless of model. Don't restate your linter, don't let `/init` write the file for you, and don't fix an ignored rule by shouting louder — all model-independent, all still true on a 30B local model.

One honesty note: nobody has published per-model guidance on how long a context file should be. The tiers above are extrapolated from the instruction-following decay curves and my own use, not measured. Treat them as a starting position to test from.

---

## The bits nobody argues about

Underneath the noise there's a durable core. Roughly everyone — official docs, the minimalists, even most of the template-shaped posts — agrees on these.

### Only universal rules go in the file

This is the single most repeated instruction in the current docs, and the reasoning is mechanical rather than stylistic: `CLAUDE.md` is loaded every session, so anything that only matters sometimes is costing you tokens and attention all the time.

The test the docs give is a good one:

> For each line, ask: "Would removing this cause Claude to make mistakes?" If not, cut it.

And the failure mode is counterintuitive enough to be worth internalising:

> If Claude keeps doing something you don't want despite having a rule against it, the file is probably too long and the rule is getting lost.

That's the bit most people get backwards. When a rule is being ignored, the instinct is to write it again, in bold, with "IMPORTANT" in front of it. The actual fix is usually to delete four other rules.

The include/exclude split from the docs, condensed:

**Include:** bash commands Claude can't guess, non-default code style, testing instructions, repo etiquette, architectural decisions specific to your project, dev environment quirks, common gotchas.

**Exclude:** anything Claude can infer by reading the code, standard language conventions, detailed API docs (link to them instead), frequently-changing information, long explanations, file-by-file descriptions, and self-evident advice like "write clean code".

That last category is where most bloated files live. "Write clean code" and "prefer readable variable names" are pure cost.

### Conditional context goes in skills

This is the axis that dates a post most reliably. The Agent Skills spec landed in December 2025. Every `CLAUDE.md` guide written before then had nowhere else to put domain knowledge, so it went in the file — which is why so many 2025-era templates look maximalist. They weren't wrong at the time; they just predate the alternative.

The current split is four-way, not three:

- **`CLAUDE.md`** — always loaded, so: universal rules only.
- **`.claude/rules/*.md`** — one file per topic. With a `paths` glob in the frontmatter they load *only* when Claude touches matching files; without one they load at launch like `CLAUDE.md`.
- **Skills** — loaded on demand when you invoke them or Claude judges them relevant, so: workflows and domain knowledge.
- **Hooks** — deterministic, so: anything that must actually happen.

Path-scoped rules are the one I see used least and they're the most mechanical win available. If you have a section in your `CLAUDE.md` that starts "when working on API handlers…", it wants to be this:

```md
---
paths:
  - "src/api/**/*.ts"
---

# API rules

- All endpoints validate input with the shared schema helper
- Use the standard error response shape
```

That content now costs you nothing until Claude actually opens a file under `src/api/`. Rules live in `.claude/rules/`, load recursively from subdirectories, and can be symlinked in from a shared directory if you want the same set across projects.

### Hard rules belong in hooks, not prose

This one is settled, and it's the cheapest large win available. From Anthropic's own material: `CLAUDE.md` instructions are advisory, hooks are deterministic and guarantee the action happens. A "never do this" line in a markdown file is a strong suggestion to a probabilistic system. A `PreToolUse` hook is a wall.

So: "never run `npm run build`, it kills the dev server" is a hook. "Always run the formatter before finishing" is a `Stop` hook running Biome or Prettier. The related principle, put nicely by HumanLayer: **Claude is not an expensive linter**. Never spend context describing rules a deterministic tool already enforces.

The only posts still arguing for hard rules in prose are the older template-driven ones. They're behind, not wrong-headed.

### Progressive disclosure: prefer pointers to copies

Keep task-specific detail in separate documents and reference them, so the file becomes a routing table rather than an encyclopaedia.

**One important trap here.** `@path/to/file` imports look like progressive disclosure but aren't. The docs are explicit: imported files "are expanded and loaded into context at launch", and splitting content into imports "helps organization but doesn't reduce context". Breaking a 400-line `CLAUDE.md` into five tidy imported files gives you the same 400 lines in every session, just arranged more pleasantly. It's a filing improvement, not a context one.

What actually defers loading is narrower:

- **Path-scoped rules** — load when a matching file is touched.
- **Skills** — load when invoked or judged relevant.
- **Nested `CLAUDE.md` files in subdirectories** — load when Claude reads files in that directory, unlike ancestor ones which load in full at launch.
- **A plain markdown link or a bare path in backticks** — costs one line; Claude reads the file if it decides it needs it.

Use `@` imports when you genuinely want the content in every session and just don't want it inline — `@AGENTS.md` being the obvious case. Don't use them expecting a saving.

### Treat it like code

Review it when things go wrong, prune regularly, and test changes by watching whether behaviour actually shifts. That last part is the one everyone skips. If you added a rule and can't point to a behaviour change, you added noise.

### Treat `/init` output as a first draft, not a file

HumanLayer's argument is that `CLAUDE.md` is the highest-leverage point of the whole harness, so it should be hand-crafted. That was a taste argument in November 2025. As of early 2026 there's data behind it, which is the next section — and there's now a much more direct answer to "what should I delete", which gets its own section below.

---

## So what about everything `/init` generates?

This is the question I actually get asked, and it's a fair one. Run `/init` and you get a project description, a list of npm commands, an architecture section, and a map of where things live. Four categories. Which survive?

Handily, Anthropic has answered this in the most direct way possible: they shipped a tool that deletes the bad ones for you. As of Claude Code v2.1.206, `/doctor` proposes trims for a checked-in `CLAUDE.md`, and the docs describe its policy precisely — it

> cuts content Claude can derive from the codebase, such as directory layouts, dependency lists, and architecture overviews, and keeps pitfalls, rationale, and conventions that differ from tool defaults.

Read that twice, because it's a straight line through the middle of typical `/init` output. Directory layouts, dependency lists, architecture overviews: cut. Pitfalls, rationale, conventions that differ from defaults: keep. Anthropic's own tooling will strip out a good chunk of what Anthropic's own tooling generated. Taking them at their word, category by category:

**Project description / overview — cut.** Claude derives this from the README and the code in seconds. A paragraph explaining that your e-commerce app sells things is pure cost, paid on every single turn. This is precisely the overview-heavy prose that made LLM-generated files score *worse* than no file at all in the ETH Zurich benchmark.

**Commands — keep, but only the non-obvious ones.** These are top of the official include list, and for good reason: Claude cannot reliably guess them. But "keep commands" doesn't mean paste your entire `scripts` block. A model that reads `package.json` can work out that `pnpm test` runs the tests. What earns its place is anything surprising:

- The package manager, if it isn't the obvious one — "use `pnpm`, never `npm`" is the canonical example, and Claude Code's own team file has exactly this line.
- Commands with prerequisites — "`pnpm test:e2e` needs Docker running first".
- Commands that are *wrong* to run — "never run `pnpm build` while the dev server is up". Though note: that one wants to be a hook, not a sentence.

The version I'd keep from a generated file is usually about four lines. The version `/init` writes is usually about twenty.

**Architecture — mostly cut, with one real exception.** The exception is *decisions and their rationale*, particularly where you've done something unusual. "Search runs through D1 rather than a hosted service because the whole site is on Cloudflare and I wanted one bill" is genuinely useful — it's a why, and whys aren't in the code. "The app uses React with TypeScript" is not; that's visible from any file.

Test it like this: if Claude would reach the same conclusion by opening three files, it's derivable, so cut it. If Claude would reach the *wrong* conclusion — because the obvious approach isn't the one you took, or because there's a reason behind something that looks arbitrary — keep it.

**File-by-file maps — cut, and cut these first.** "File-by-file descriptions" is on the official exclude list, and a directory layout is explicitly named as something `/doctor` trims. Beyond costing context on every turn, they have a failure mode the other categories don't: **they go stale, and stale context is worse than no context**. A file map that says handlers live in `src/api/handlers/` after you moved them is actively harmful — it sends the model to a path that no longer exists, and it does so confidently. The docs put "frequently-changing information" on the exclude list for exactly this reason. Claude has search tools and is extremely good at using them. It does not need your map; it needs your map to not be wrong.

**So should you delete everything `/init` gives you?** No — but you should expect to delete most of it, and you should be doing the deleting rather than accepting the file wholesale. `/init` is a decent first draft: it surfaces the commands and conventions it discovered, which saves you the discovery. It's a poor final file, because it's optimised for describing your project to a human reader rather than for changing a model's behaviour. Those are different jobs. Run it, then cut it down to the lines that would cause a mistake if they were missing — and if you'd rather have a second opinion on which those are, `/doctor` will now make the suggestions for you.

There's one more thing worth knowing if you're a heavy `/init` user: `CLAUDE_CODE_NEW_INIT=1` switches it to an interactive multi-phase flow that asks which artifacts you want, explores with a subagent, asks follow-up questions, and shows you a reviewable proposal before writing anything. It also reads existing `AGENTS.md`, Cursor, Windsurf and Cline rules and folds them in. Still a draft, but a better-informed one.

---

## Can `CLAUDE.md` be conditional?

The other question I get: can you vary the content — by model, say, so a smaller model gets the extra hand-holding and Opus 5 doesn't?

**By model: no.** There's no conditional syntax in `CLAUDE.md` at all, and nothing model-aware anywhere in the memory system. The docs are unusually blunt about the surrounding mechanics too: only `SessionStart` hooks can receive a `model` field, "and it is not guaranteed to be present", and "there is no `$CLAUDE_MODEL` environment variable". A hook inherits your shell environment so it can read `$ANTHROPIC_MODEL` if you've set it — but that value doesn't change when you switch models with `/model` mid-session, which is exactly when you'd want it to.

So the closest thing available is a `SessionStart` hook that reads the (unguaranteed) `model` field and injects extra guidance via `additionalContext` for the models that need it. That works, technically. It's also fragile, invisible to your team, and silently wrong the moment someone switches model mid-session. I wouldn't build on it.

**By path: yes, and this is the one to use.** `.claude/rules/*.md` with a `paths` glob in the frontmatter, as above. Genuinely conditional, officially supported, no cleverness required.

**By task: yes** — that's what skills are.

**By person: yes** — `CLAUDE.local.md` sits alongside `CLAUDE.md`, is loaded the same way, and is meant to be gitignored. Worth knowing that a gitignored file only exists in the worktree you created it in, so if you use git worktrees, import from your home directory instead.

**By organisation: yes** — a managed policy `CLAUDE.md`, or a `claudeMd` string in managed settings, applies machine-wide and can't be excluded by individual users.

Which brings the model question back to the dial from earlier. Since you can't branch on model, the file has to suit whichever model reads it, so tune it for the least capable one in your rotation and let the strong model cope with slight over-specification. The alternative — if you truly run two very different tiers — is two branches or two checkouts, and I think that's more machinery than the problem deserves.

Two small mechanical things I'd missed for a long time, both from the same docs page. Block-level HTML comments are stripped before the file is injected, so `<!-- notes for humans -->` costs zero tokens — a genuinely free way to leave maintainer notes in a file you're otherwise trying to keep terse. And `CLAUDE.md` is delivered as a *user message after* the system prompt, not as part of it, which is a useful thing to know when you're reasoning about why it's advisory rather than binding.

### But I use different models for different tasks

This is the more realistic version of the question, and it has a better answer. Most people I know don't run one model — they run Opus for design work and hard debugging, something cheaper for routine edits, and route mechanical work to subagents on Haiku to keep the bill down.

The first thing to know is that **this does not get you multiple context files**. Every subagent apart from the built-in Explore and Plan agents loads the entire `CLAUDE.md` hierarchy: `~/.claude/CLAUDE.md`, the project file, project rules, `CLAUDE.local.md`, managed policy files, the lot. A Haiku subagent gets a byte-identical file to your Opus main thread. There's no branching to be had.

Worth noticing what Anthropic did about that in their own harness, though: **Explore and Plan skip `CLAUDE.md` entirely** — the docs say it's to keep research "fast and inexpensive". When the built-in agents whose job is reading code don't get your context file at all, that tells you how much of it Anthropic thinks is load-bearing for a task that isn't writing code.

The seam that *does* exist is the subagent definition. A file in `.claude/agents/` takes a `model` field — `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit` — alongside its own system prompt in the markdown body, its own `effort` level, and a `skills` list that preloads full skill content at startup. So the extra hand-holding a cheaper model needs goes *in the agent file that pins that model*, right next to the line pinning it:

```md
---
name: test-fixer
description: Fixes failing unit tests. Use after a test run fails.
model: haiku
effort: low
---

Fix the failing tests. Run `pnpm test` to check your work.
Use `pnpm`, never `npm`. Never edit files under `src/generated/`.
```

That's your model-conditional context. It isn't `CLAUDE.md` syntax and it never will be, but it lands in the same place functionally: instructions that only reach the model that needs them. Two rules of thumb fall out:

- **`CLAUDE.md` holds what every model needs.** Universal, and pitched at the least capable reader in your rotation.
- **The agent file holds what that model needs.** If you find yourself writing "if you're a smaller model, also…" in `CLAUDE.md`, that sentence belongs in a subagent definition instead.

There's a cost wrinkle here that's easy to miss. If you're routing work to Haiku to save money, remember your `CLAUDE.md` is loaded **per subagent, per spawn**. Fan out ten subagents and you've paid for that file eleven times. Bloat that's merely annoying in a single-threaded session becomes a multiplier the moment you parallelise — so a heavy fan-out workflow is one of the stronger arguments for a short file, not a weaker one.

Two smaller notes for this setup. Auto memory from the main conversation isn't loaded into subagents at all, though a subagent can keep its own with a `memory` field. And for scripted or CI runs pinned to a specific cheap model, `--append-system-prompt` lets you inject model-specific instruction at the system prompt level per invocation — better suited to automation than interactive use, since you have to pass it every time.

### One more accretion machine to watch

Worth flagging, because it changes the maths on all of this: **auto memory** is on by default. Claude writes its own notes per repository — build commands, debugging insights, preferences it infers from your corrections — into `~/.claude/projects/<project>/memory/`, and the index file loads into every session alongside your `CLAUDE.md`.

That is accretion, automated. It's the "add a rule every time" loop with you taken out of it, running quietly on a file you didn't write. The design does account for the risk — the index is capped at 200 lines or 25KB, detail lives in topic files that only load on demand, and Claude Code nags itself to prune when it gets close — but if you're going to ablate, this is now part of the surface you're ablating. Run `/memory` occasionally and read what's in there. Turn it off with `autoMemoryEnabled: false` if you'd rather curate by hand.

---

## What the research actually says

There's much less rigorous work here than the confident blog posts imply, and what exists is not a ringing endorsement.

### Context rot (Chroma, July 2025)

Chroma's context rot study evaluated 18 frontier models — GPT-4.1, Claude 4 Opus and Sonnet, Gemini 2.5, Qwen3 — on how performance changes as input length grows. The finding is unambiguous and it's the empirical backbone of every "keep it short" recommendation:

> Every single one gets worse as input length increases. Not some. Not most. All of them.

Two details matter beyond the headline. Degradation is **non-uniform** — it isn't a smooth, predictable decline you can budget around. And there's a pronounced **lost-in-the-middle** effect: a fact buried in the middle of a long context is dramatically less likely to be used than the same fact at either end.

You'll see specific numbers quoted for this study — "30–50% drops", "95% down to 60%". Those are illustrative examples from various summaries rather than a single headline figure. Cite the qualitative finding; it's strong enough on its own.

### The ~150–200 instruction ceiling

This one gets repeated as though it were measured. Its origin is HumanLayer's November 2025 post, citing [arXiv 2507.11538](https://arxiv.org/abs/2507.11538), and the framing is that frontier thinking models can follow roughly 150–200 instructions with reasonable consistency. HumanLayer themselves note it hasn't been investigated in an incredibly rigorous manner.

Two things worth keeping:

1. **Decay is uniform across the set.** Adding instructions doesn't just make the newest ones unreliable — it degrades adherence to *all* of them. That's the mechanism behind "your rule is being ignored because the file is too long".
2. **Frontier thinking models decay roughly linearly; smaller and non-thinking models decay exponentially.** If you're running a smaller model, your budget is much tighter than the headline number.

The companion claim — "Claude Code's system prompt already uses ~50 of your instruction budget" — was an estimate, and it predates the Opus 5 cut. After removing 80% of that prompt, it's a lot lower.

### The AGENTS.md evaluation (Gloaguen et al., ETH Zurich)

This is the one rigorous study of whether repository context files help at all ([arXiv 2602.11988](https://arxiv.org/abs/2602.11988), v1 February 2026). It benchmarked four agent/model pairs across SWE-bench Lite and a purpose-built AGENTBENCH of 138 instances drawn from twelve niche Python repositories that had developer-committed context files.

The results are modest in both directions:

- **LLM-generated context files: about 3% *worse* on average.**
- **Developer-written context files: about 4% better on average.** They beat LLM-generated files for all four agents — and helped every agent except Claude Code.
- **Cost went up over 20% on average** either way. Context files make runs more expensive.

The most interesting finding isn't the success rate, it's the mechanism. Instructions *are* followed, sometimes to a fault. When a context file mentioned the `uv` tool, agents used it 1.6 times per instance versus under 0.01 when it wasn't mentioned — a 160-fold increase. Repo-specific tools showed a ~50-fold jump. The problem isn't disobedience. It's that the guidance itself often doesn't help, and mentioning a tool sends the agent off exploring it whether or not the task calls for it.

Every line you write is an attractor. That's the finding.

Two caveats. The paper's v2 abstract lumps both file types together as reducing success, which conflicts with v1's granular finding that developer-written files give a small gain — cite v1 for that. And neither this study nor its follow-ups vary the agent's step budget, which a subsequent paper (Probe-and-Refine, [arXiv 2606.20512](https://arxiv.org/abs/2606.20512)) points out is a real confound. That paper also notes that the two most rigorous studies in this area reach opposite conclusions, which should temper anyone's confidence, including mine.

### One statistic to stop repeating

You will see it claimed, quite widely, that this ETH Zurich paper shows `AGENTS.md` files reduce agent-generated bugs by 35–55%.

It doesn't. The paper doesn't measure agent-generated bugs at all — its metric is task resolution rate. The figure traces back to a non-peer-reviewed Medium post that lists it alongside several other unsourced numbers, and it has been laundered into legitimacy by repetition. If you see it in a post, treat that post's other citations with suspicion.

### So do context files help?

Honestly: a little, if you write them yourself, and they cost you tokens either way. The vendor consensus that context files are essential is not backed by a large measured effect. What the evidence supports is narrower and more useful — **lean, hand-written files beat bloated generated ones**, and length has a real, measurable cost.

---

## The AGENTS.md interop problem

Separate from the anatomy question is a boring compatibility one.

[`AGENTS.md`](https://agents.md) is the open, cross-tool format for exactly this job — "a README for agents". It came out of collaboration across OpenAI Codex, Amp, Google's Jules, Cursor and Factory, and is now stewarded by the Agentic AI Foundation under the Linux Foundation. It's plain Markdown with no required fields, and nearest-file-wins in monorepos (OpenAI's own Codex repo has 88 of them). Adoption went from roughly 20,000 repositories in August 2025 to over 60,000 by 2026.

Native readers include Codex, Cursor, GitHub Copilot, Gemini CLI, Aider, Windsurf, Zed, Factory, Jules, Amp, Cline and RooCode. As of June 2026, Cursor, Windsurf and Cline have all added native discovery.

Claude Code reads `CLAUDE.md` only. It does not read `AGENTS.md`, and — despite what several posts claim — it does not fall back to it either.

This is comfortably the most-wanted missing feature in the tracker: [anthropics/claude-code#6235](https://github.com/anthropics/claude-code/issues/6235), opened in August 2025, has over 5,200 reactions and 300+ comments, several times the next request. A companion issue asks for `.agents/skills/` support too, pointing out the mild irony that Anthropic authored the Agent Skills open standard and then didn't follow its directory convention. As of Claude Code 2.1.201, the answer is still no.

### The fix

Make `@AGENTS.md` the first line of your `CLAUDE.md`:

```md
@AGENTS.md

## Claude Code specific notes

<!-- anything only Claude needs goes here -->
```

That's a native Claude Code import. `AGENTS.md` loads at session start, Claude-specific additions sit below it, and drift between the two files is structurally impossible because there's only one source of truth.

The alternative is a symlink:

```sh
ln -s AGENTS.md CLAUDE.md
```

Works fine on macOS and Linux. On Windows it needs Administrator privileges or Developer Mode plus `git config core.symlinks true`, so the import is the better default for a team with mixed machines.

Two extras worth knowing: `/init` will read an existing `AGENTS.md` (and `.cursorrules` / `.windsurfrules`) and fold it into what it generates. And if you genuinely need two divergent files, there are heavier patterns — pre-commit sync hooks, `SessionStart` merge hooks, CI drift detection — but I'd exhaust the one-line import first.

If you install skills from the wider ecosystem, note that Claude Code looks in `~/.claude/skills` while the spec says `~/.agents/skills`. Symlinking one to the other is the current workaround.

---

## The conflict map

| # | Conflict | Side A | Side B | Where it stands |
| --- | --- | --- | --- | --- |
| A | Accretion vs ablation | Add a rule on every mistake (Claude Code team, Jan–Jun 2026) | Delete everything every six months, re-add sparingly (same team, post-Opus 5) | Same team, inverted default. Ablation is current *for frontier models* — it's a dial set by model capability, not a universal rule |
| B | Biggest lever vs less scaffolding | `CLAUDE.md` is the highest-leverage point of the harness | Smarter models need less prescriptive engineering | Both true. It's high-leverage precisely because a bad line does broad damage |
| C | Prose rules vs hooks | Templates put "never do X" in markdown | Hard guarantees need deterministic hooks | Settled. Hooks win. Prose-rule posts are behind |
| D | Maximalist vs minimalist | Ten-section templates | Under 200 lines, ideally under 60 | Minimalists have the data (Gloaguen, Chroma) |
| E | Everything in `CLAUDE.md` vs skills | Pre-2026 posts, because skills didn't exist | Route conditional context to skills and path-scoped rules | Not a real disagreement — a timeline artefact |
| F | Do context files help at all? | Universal vendor and community recommendation | ~3% worse (generated), ~4% better (hand-written), >20% more expensive | Genuinely unsettled. The two rigorous studies disagree |

The useful thing about laying it out like this: only A and F are live disagreements. C, D and E are just posts that haven't caught up.

---

## What I'd actually do

Pulling it together into something actionable:

1. **Treat `/init` as a first draft and cut it down hard** — or start from empty. Either way, don't ship what it wrote. Delete the project overview, the architecture summary and the file map; keep the non-obvious commands and the real gotchas. Run `/doctor` if you want a second opinion on which is which.
2. **Add a line only after the model has failed the same way more than once.** Never speculatively. The line gets read on every turn forever.
3. **Apply the removal test to every line.** Would deleting it cause a mistake? No? Delete it. Would it be *wrong* in three months? Delete it twice.
4. **Move anything conditional out of the file.** By path, into `.claude/rules/` with a `paths` glob. By task, into a skill. If a rule starts with "when", it doesn't belong in `CLAUDE.md`.
5. **Move anything that must be guaranteed to a hook.** If you'd be genuinely annoyed when the model ignores it, prose is the wrong tool.
6. **Never restate what a linter, formatter or type checker already enforces.**
7. **Aim under 200 lines. Under 100 is better. Under 60 is achievable** — on a frontier model. Scale the target up if you're running something smaller, and prioritise harder, because the budget shrinks faster than the need does.
8. **Put `@AGENTS.md` on line one** and write the actual content there, so every other tool gets it too.
9. **Re-ablate whenever you change models**, and every six months regardless. Delete the file, work normally, add back only what actually breaks. You will add back less than you removed — unless you've moved *down* a model tier, in which case adding some back is the correct outcome.
10. **If a rule is being ignored, shorten the file.** Don't shout louder.

And the meta-rule, which is really what this whole post is about: **check the date on the advice**. Anything written before December 2025 predates skills. Anything written before late July 2026 predates the ablation turn. That includes this post — I'll date-stamp any updates.

## What would change my mind

- **Claude Code ships native `AGENTS.md` support.** Watch [#6235](https://github.com/anthropics/claude-code/issues/6235). If it lands, the entire interop section collapses to a sentence.
- **A rigorous study varies the agent's step budget and finds context files clearly help.** Probe-and-Refine is already probing this. It would soften the "lean wins" claim considerably.
- **A model generation needs *more* scaffolding again.** Unlikely on the current trend, but if it happened, the ablation advice reverses and the January 2026 version of this post becomes right again.

A few sourcing caveats worth stating plainly. The `CLAUDE_CODE_SIMPLE=1` flag and the specific "every six months" cadence come from the YC Startup School interview and its write-ups rather than official documentation — the 80% figure itself is documented on Anthropic's blog. Boris Cherny's tips are aggregated on a fan-made site that isn't affiliated with Anthropic, though each tip links back to his original posts. And the fast-moving model version names of the last year are slippery enough that I'd treat any specific version boundary as approximate.

The underlying point survives all of that. The best `CLAUDE.md` is the shortest one that still prevents mistakes, and it gets shorter every time the models get better.
