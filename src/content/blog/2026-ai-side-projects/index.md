---
slug: ai-side-projects
title: Things I've been building recently while evaluating AI agents
subtitle: Nine side projects — npm packages, Raycast extensions, iOS apps and more — and what using Claude Code, Cursor and Amp on real work taught me
date: 2026-02-23
tags:
  - side-project
  - ai
  - react
  - astro
  - raycast
  - ios
---

I'm constantly evaluating AI agents. With so many tools available and new ones launching every week, the best way I've found to really put them through their paces is to use them on something I actually care about: my side projects. Unlike work tasks where you're constrained by deadlines and existing codebases, side projects give me the freedom to experiment, switch between tools, and be honest about what's actually useful.

Over the past few months I've been using [Claude Code](https://claude.ai/code), [Cursor](https://cursor.com), and [Amp](https://ampcode.com) across a bunch of projects - some finished, some still in progress. Here's what I built and what I learned.

## url-merge

**Repo:** [github.com/mrmartineau/url-merge](https://github.com/mrmartineau/url-merge) • `npm i url-merge`

One of my favourite npm packages is [proper-url-join](https://github.com/nicolo-ribaudo/proper-url-join) - it works like Node's `path.join()` but for URLs. It's simple, predictable, and I've relied on it in a bunch of projects. The problem is that it depends on [query-string](https://github.com/sindresorhus/query-string), which is a solid package but a dependency you don't need anymore. The native [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) API produces a compatible output and is available everywhere.

So I wrote `url-merge`: a drop-in replacement that does the same job with zero dependencies. Rather than pulling in `query-string`, it produces `URLSearchParams`-compatible output using its own implementation — smaller install, one fewer thing to keep updated. I'd rather not carry a transitive dependency when the result can be achieved without one.

## Lang Compare

**Repo:** [github.com/mrmartineau/lang-compare](https://github.com/mrmartineau/lang-compare) · **Live:** [lang-compare.zander.wtf](https://lang-compare.zander.wtf)

I'm a front-end developer by trade - JavaScript and TypeScript are my native tongues - but I've always been curious about other languages. How does Go handle errors? What does Rust's approach to memory management look like compared to what I'm used to? I wanted a way to see those comparisons side by side without having to bounce between documentation sites, so I built Lang Compare.

It's an Astro site hosted on Cloudflare that lays out language features across a range of topics in a structured, comparable format. Most of the initial content and structure was built with Opus 4.5, which did a solid job of generating accurate, well-organised comparisons. I then used Codex 5.2 to review it, and that produced some genuinely interesting suggestions - it recommended adding several new sections I hadn't thought of, which I incorporated afterwards.

Both agents were useful, but they both struggled with the specific layout I was after. Getting the comparison structure just right required a fair amount of manual intervention from me. AI is great at producing content; it's less great at understanding opinionated visual layouts, at least for now.

My plan is to expand the site beyond programming languages to compare front-end UI libraries and frameworks - React, Vue, Solid, Astro, and others. There's a lot of ground to cover and I think it could be genuinely useful.

## ascii-img-react

**Repo:** [github.com/mrmartineau/ascii-img-react](https://github.com/mrmartineau/ascii-img-react) • `npm i ascii-img-react`

I came across [Alex Harri's excellent post on ASCII rendering](https://alexharri.com/blog/ascii-rendering) and immediately wanted to build something with the technique. It's a fantastic deep dive into how you can convert images to ASCII art using canvas and character luminosity mapping - well worth a read if you haven't seen it.

I turned the approach into a set of React components. The initial version handled static images, and I've since added support for video too, which turned out to be surprisingly straightforward once the image pipeline was in place - video frames are just a sequence of images after all.

<!-- TODO: add demo link or iframe here -->

## Raycast Bird extension

**Repo:** [github.com/mrmartineau/raycast-extensions/tree/main/bird](https://github.com/mrmartineau/raycast-extensions/tree/main/bird)

I've been spending more time on Twitter recently - it's still the best place to keep up with what's happening in AI, for better or worse. I use bookmarks and likes heavily to save things I want to come back to, but actually accessing them quickly was always a bit of a faff.

The fix was obvious: a Raycast extension. It's built on top of the [`bird` CLI](https://bird.fast) by [Peter Steinberger](https://x.com/steipete) - a command-line interface for Twitter/X that handles all the authentication and API calls. My Raycast extension wraps it in a searchable interface so I can get to my bookmarks and likes without leaving my keyboard. It's a small thing, but this is exactly what Raycast extensions are perfect for.

I have submitted this to Raycast's extension store but as of writing, it hasn't been approved.

## Otter native iOS share extension

**Repo:** [github.com/mrmartineau/Otter/tree/main/packages/app/otter](https://github.com/mrmartineau/Otter/tree/main/packages/app/otter)

[Otter](https://zander.wtf/blog/otter-v2) is my personal bookmarking app, and for a long time I relied on an iOS Shortcut to save links to it from my phone. It worked reasonably well, but iOS has a security model that requires explicit permission for Shortcuts to access new websites - so every time I wanted to share from somewhere new, I'd get a permission prompt. Annoying.

The fix was to build proper native extensions: a Safari extension and a Share Extension. Both give Otter a first-class place in iOS's sharing flow, and the experience is dramatically better - tap, share, done. No more permission dialogs.

I've also been experimenting with App Intents to trigger the share sheet with a double-tap on the back of my phone, which would make it even faster. It's not quite finished yet, but it's a fun bit of Swift to work on.

## Otter cross-browser extension

**Repo:** [github.com/mrmartineau/Otter/tree/main/packages/web-extension](https://github.com/mrmartineau/Otter/tree/main/packages/web-extension)

I use [Arc](https://arc.net) as my main browser and I've been happy with it, but the writing is on the wall - the team has moved on to other products and Arc is now only receiving security fixes. So I spent some time evaluating [Zen browser](https://zen-browser.app) as a potential replacement.

Zen is built on Firefox under the hood, which isn't compatible with the existing Chrome extension. The Otter extension was Chromium-only, so I ported it to work cross-browser - Manifest V3 with Firefox compatibility added. It's now usable in both Chromium-based and Firefox-based browsers, so I can switch without losing the Otter integration I depend on daily.

## Added oAuth support to Otter's Raycast extension

**Repo:** [github.com/mrmartineau/raycast-extensions/tree/main/otter](https://github.com/mrmartineau/raycast-extensions/tree/main/otter)

Supabase added OAuth support late last year, and it was well overdue that the Otter Raycast extension made use of it. Previously you had to paste in your Supabase credentials manually — fine for a power-user tool, but not exactly slick. With OAuth, the extension can handle authentication properly through a standard browser flow.

It required a small change to the Otter web app as well to support the OAuth callback, but nothing significant. The end result is a much cleaner setup experience.

## SSH site

I came across [ssh hi.zachkrall.com](https://hi.zachkrall.com) and loved the idea immediately - a personal site you access via SSH rather than a browser. There's something appealing about the constraints of it: pure terminal, no CSS, no JavaScript, just content.

The bones of my version are there but I haven't quite got it hosted yet. My plan is to run it on my Synology NAS, which feels like the right home for something like this - self-hosted, always on, a bit nerdy. I just haven't found the time to finish the setup. Watch this space.

## ASCII site

**Live:** [zander.wtf/ascii](https://zander.wtf/ascii)

With all the renewed interest in TUIs lately, I wanted to create a version of my site that looks like one. I used Cursor to build a simple layout engine that renders my homepage in ASCII - boxes, borders, columns, the works.

What I like most about it is that it's not a static snapshot: it pulls the same data as the main site, so it stays up to date automatically. New blog posts, new code notes, whatever I add to the site proper shows up in the ASCII version too. It's a small detail but it makes it feel like a real alternative view of the site rather than a gimmick.

## On the AI agents themselves

All three tools got a proper workout across these projects, and I've come away with some reasonably firm opinions.

**[Amp](https://ampcode.com) is my favourite.** What sets it apart is that it has access to both Anthropic and OpenAI models, so it can pick whichever is best suited to the task at hand. In practice this means better results across a wider range of problems, without me having to manually think about which model to reach for. I find myself trusting it with more substantial chunks of work and it consistently delivers.

**Cursor's "Add to chat" is brilliant for refactoring.** Being able to select a specific block of code and ask a targeted question about it - without pulling in the entire file - makes Cursor feel exceptionally well-suited to surgical edits. It's the feature I reach for most often when I'm using it. I don't use Cursor's CLI agent as much, partly because Amp fills that role for me, but I should probably give it more of a chance.

**Claude Code's** TUI is really problematic when compared to Amp so I rarely use it however I do like its iOS app where I can make PRs and for existing projects while on-the-go. I used this for Otter and ascii-img-react actually with good results.

I don't think there's a single winner here - each tool has a niche where it shines. But if I had to pick one for sustained, ambitious project work, Amp is where I'd land right now.
