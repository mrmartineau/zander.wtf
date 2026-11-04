# SEO/AEO/GEO report: zander.wtf, 2026-10-20

Fixes applied 2026-10-20 and checked on a local Cloudflare Pages server (`wrangler pages dev dist`). Not deployed yet.

Audited: production (`https://zander.wtf`). 39 pages in two runs: `/`, `/work-with-me`, `/cv`, `/blog`, `/projects`, `/stats`, the first 25 sitemap URLs (mostly 2023–2024 worklog entries), and one page of each other template (recent posts, `/notes/`, a note, two projects, `/links/`, `/now/`, `/uses/`, `/moons/`, `/lil-debugger/`, `/search/`, `/scraper-test/`, `/styleguide/`). Rendered check: on (Chrome). Link check: on for run 1 (first 500 of 590 links), off for run 2.

Crawl access is good. Every search, user and training crawler can fetch `/`. No noindex, no nosnippet. JSON-LD parses on every page.

## Top fixes
1. **Add a real 404 page.** No `src/pages/404.astro` exists, so Cloudflare Pages serves the home page with status 200 for any made-up URL (soft 404). Crawlers can index junk URLs.
2. **Keep test and utility pages out of the sitemap.** `/scraper-test/`, `/styleguide/` (lorem ipsum), `/search/` and `/notes/search/` are in the sitemap. `/notes/search/` is also disallowed in robots.txt, so the two files disagree. The robots rule `Disallow: /scraper-test.html` does not match the served URL `/scraper-test/`. Add a `filter` to `sitemap()` in `astro.config.mjs` and fix the robots path.
3. **Server-render the `/links/` feed.** `LinkFeed` is `client:only="solid"`, so 165 of 369 words (every link title and summary) exist only after JavaScript. Most AI crawlers see an empty page.
4. **Turn off Cloudflare Email Obfuscation (or exclude this link).** On `/work-with-me` the `mailto:` link is rewritten to `/cdn-cgi/l/email-protection`, which is a 404 without JavaScript. Crawlers and agents get no email address on the page whose goal is contact.
5. **Add `dateModified` to the `BlogPosting` JSON-LD**, and give notes their own article JSON-LD. The `modified` field and `astro-git-dates` already exist; `BaseHead.astro` only emits `datePublished`, and notes emit no article schema at all.

## Findings

| # | ID | Severity | Kind | Pages | Evidence | Fix | Status |
|---|---|---|---|---|---|---|---|
| 1 | soft-404 | warn | code | site | Made-up URLs returned 200 (the home page) | Added `src/pages/404.astro` | fixed: local Pages server returns 404 |
| 2 | sitemap-utility-pages | warn | code | site | `/scraper-test/`, `/styleguide/`, `/search/`, `/notes/search/` in sitemap; robots path wrong | `filter` in `sitemap()`; robots `Disallow: /scraper-test` | fixed |
| 3 | js-only-content | warn | code | `/links/` | 165 of 369 words only after JS | Plain `<ul>` of links in the island's `slot="fallback"` (`src/pages/links.astro`). Page HTML grows about 260 KB (550 links) | fixed |
| 4 | link-broken | error | code | `/work-with-me` and 5 other pages with `mailto:` | Cloudflare Email Obfuscation rewrites to `/cdn-cgi/l/email-protection` | Cloudflare dashboard → zander.wtf → Scrape Shield → Email Address Obfuscation: off | needs user (dashboard) |
| 5 | img-alt-missing | error | code | `/blog/` + 5 posts | Otter logo had no `alt` | `alt=""` (link text says "Otter") | fixed |
| 6 | img-alt-missing | error | copy | `/blog/2020-review/` | Stats chart had no `alt` | Alt text written from the chart itself (18.5k visitors, June spike) | fixed: check the wording |
| 7 | field-no-label | error | code | `/notes/`, notes, `/search/`, `/404` | Search input had placeholder only | `aria-label` from the placeholder in `SearchForm.astro` | fixed |
| 8 | jsonld-date-modified | info | code | posts and worklog | No `dateModified` | `dateModified` (falls back to `datePublished`), `article:modified_time`, and a visible "Updated" date when `modified` is set (12 posts) | fixed |
| 9 | jsonld-missing (notes) | info | code | 208 dated notes | No article JSON-LD | Notes pass `article` to `BaseHead` → `BlogPosting` with dates | fixed |
| 10 | heading-skip | warn | code | `/` | H1 → H3 | Visually hidden `<h2>Projects</h2>` in the projects section | fixed |
| 11 | ascii page metadata | warn | code | `/ascii/` | No H1, canonical, OG, `<main>` | Added all four (H1 is visually hidden) | fixed |
| 12 | canonical-trailing-slash | info | code | `/moons/`, `/moons/changelog/`, `/lil-debugger/` | Canonical without slash 308s | Trailing slash in canonical and `og:url` | fixed |
| 13 | og-missing | warn | code | `/lil-debugger/` | No `og:image` | Uses the launch post's card `/opengraph/lil-debugger/og.png`; `twitter:card` now `summary_large_image` | fixed |
| 14 | og-url-mismatch | warn | code | SSR pages (`/stats`, `/search`) | `og:url` used the request URL (query string, host) | `og:url` = canonical URL in `BaseHead.astro` | fixed |
| 15 | link-broken (hidden by soft 404) | error | code | `/work-with-me`, `/blog/2020-review/`, `/blog/dev-stack-2015/` | 5 internal links went to dead URLs. They looked fine on live only because of the soft 404 | Pointed at the real slugs; `/likes` → `/links/`; removed the link to the deleted Shuttle post | fixed: a scan of every built page found no more |
| 16 | link-broken (mode switch) | error | code | `/stats`, `/search` | `/desktop/stats/`, `/tui/stats/`, `/txt/stats/` (and `/search`) show the home page on live. `_redirects` 200 rewrites do not reach server-rendered routes | Needs a routing change for SSR pages in desktop/tui/txt mode | left: not an SEO fix; robots.txt already blocks these prefixes |
| 17 | link-redirect | info | code | site-wide | About 150 internal links lack the trailing slash (308) | Add slashes in `consts.ts` and list components | left: the desktop and terminal shells match on these URLs. Changing them needs a test of both shells. `llms.txt` links fixed |
| 18 | link-broken-external | warn | copy | `/`, `/cv`, old posts | utopiamusic.com, babylonhealth.com, uk.thebar.com, clubview.io, scriptable.app/mac-beta, and about 20 in `/blog/dev-stack-2015/` | Remove, or link to archive.org | needs user. Otter v2.0.0 release link fixed (tag is `2.0.0`); `theme-ui` → `theme-ui.com` fixed |
| 19 | title-length | warn | copy | `/blog/astro-d1-search-package/` (88), one worklog (63) | Long titles | Shorter `<title>` | needs user |
| 20 | description-length | info | copy | `/about/`, `/notes/`, `/uses/`, `/search/`, `/stats`, `/ascii/` | Under 50 characters | About 150 characters each | needs user |
| 21 | definition-slogan | warn | copy | `/` | H1 is a tagline; no definition under it | One plain sentence under the H1 | needs user |
| 22 | facts-undated | info | copy | `/`, `/projects`, `/moons/` | Moons prices with no date | "UK prices, as of <month year>" | needs user: confirm prices |
| 23 | sitemap-no-lastmod | info | code | site | No `<lastmod>` | `serialize` from git dates | left: optional |
| 24 | robots-no-ai-policy | info | code | site | All crawlers allowed through `*` | Explicit groups per purpose | needs user: allow or block training crawlers? |

## Passed
- robots.txt: all search crawlers (Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, meta-webindexer, Applebot) and user fetchers allowed. Sitemap line present.
- `llms.txt` exists (17 lines).
- Titles, descriptions, canonicals, OG and `lang` are present on every main template.
- Blog posts and notes show visible dates in `<time>`.
- `/work-with-me` opens with a clear definition: "I'm Zander Martineau, a product engineer based in London…"
- `/about` and `/cv` open with a definition too.

## Ignored (noise)
- `js-only-content` "Nothing marked yet. Select any sentence to be the first." on every post and note: the reactions highlight hint. Not content.
- `stale` on 2020–2024 worklog entries: these are historical logs and do not need refresh.
- `canonical-other` on `/work-with-me`, `/projects`: the canonical is the trailing-slash version of the same page. Correct.
- `facts-no-date` on `/uses/` ($0/$1 are app prices in a list) and `/lil-debugger/` (demo basket prices).
- `link-unchecked`: npm and barilla.com refuse bots (403). Not broken.
- `/scraper-test/` metadata findings: it is a test fixture. Fix #2 removes it from the sitemap instead.

## Not checked
- 391 of 430 sitemap pages (one page of each template was audited instead).
- 90 links past the 500-link cap in run 1; links in run 2.
- Cloudflare bot rules and AI crawler controls (no `server-blocks-bot` symptom found).
- `/desktop/`, `/tui/`, `/txt/` prefixes (disallowed in robots.txt by design).
- Search Console, rankings, and what AI answers say about you.

## Script output

### Run 1
# SEO/AEO/GEO audit, 2026-10-20

Errors: 9. Warnings: 22. Info: 48.
Rendered check: on (/Applications/Google Chrome.app/Contents/MacOS/Google Chrome).

## Site: https://zander.wtf

- Sitemap URLs: 430
- llms.txt: 17 lines

| Crawler | Owner | Purpose | `/` allowed | Own group |
|---|---|---|---|---|
| Googlebot | Google | search | yes | no |
| Bingbot | Microsoft | search | yes | no |
| OAI-SearchBot | OpenAI | search | yes | no |
| Claude-SearchBot | Anthropic | search | yes | no |
| PerplexityBot | Perplexity | search | yes | no |
| meta-webindexer | Meta | search | yes | no |
| Applebot | Apple | search | yes | no |
| ChatGPT-User | OpenAI | user | yes | no |
| Claude-User | Anthropic | user | yes | no |
| Perplexity-User | Perplexity | user | yes | no |
| meta-externalfetcher | Meta | user | yes | no |
| GPTBot | OpenAI | training | yes | no |
| ClaudeBot | Anthropic | training | yes | no |
| meta-externalagent | Meta | training | yes | no |
| Google-Extended | Google | training | yes | no |
| Applebot-Extended | Apple | training | yes | no |
| CCBot | Common Crawl | training | yes | no |

### Site findings

- **error** `link-broken`: Internal links are broken.
  - https://zander.wtf/cdn-cgi/l/email-protection -> 404 (on /work-with-me)
- **warn** `soft-404`: A made-up URL returns 200, not 404. Crawlers index empty pages and miss real errors.
- **warn** `link-broken-external`: External links are broken.
  - https://utopiamusic.com -> 404 (on /)
  - https://babylonhealth.com -> [Errno 8] nodename nor servname provided, or not known (on /)
  - https://uk.thebar.com/ -> [Errno 8] nodename nor servname provided, or not known (on /cv)
  - https://github.com/mrmartineau/Otter/releases/tag/v2.0.0 -> 404 (on /blog)
  - https://clubview.io -> [Errno 8] nodename nor servname provided, or not known (on /blog/2020-review/)
  - https://scriptable.app/mac-beta/ -> 404 (on /blog/2020-review/)
- **info** `sitemap-no-lastmod`: Most sitemap URLs have no <lastmod>. Engines use it to find fresh pages.
- **info** `robots-no-ai-policy`: robots.txt names no AI crawler. State the policy for each purpose so it is not left to defaults.
- **info** `link-redirect`: Internal links point at a redirect. Link to the final URL.
  - https://zander.wtf/blog -> https://zander.wtf/blog/ (on /)
  - https://zander.wtf/links -> https://zander.wtf/links/ (on /)
  - https://zander.wtf/cv -> https://zander.wtf/cv/ (on /)
  - https://zander.wtf/notes -> https://zander.wtf/notes/ (on /)
  - https://zander.wtf/feeds -> https://zander.wtf/feeds/ (on /)
  - https://zander.wtf/colophon -> https://zander.wtf/colophon/ (on /)
  - https://zander.wtf/blog/lil-debugger -> https://zander.wtf/blog/lil-debugger/ (on /)
  - https://zander.wtf/blog/reps -> https://zander.wtf/blog/reps/ (on /)
  - https://zander.wtf/blog/green-claws -> https://zander.wtf/blog/green-claws/ (on /)
  - https://zander.wtf/notes/array-methods -> https://zander.wtf/notes/array-methods/ (on /)
  - and 170 more
- **info** `link-unchecked`: These servers refused the check. Open them by hand.
  - https://barilla.com/ -> 403 (on /cv)
  - https://www.npmjs.com/package/astro-d1-search -> 403 (on /blog)
  - https://www.npmjs.com/package/astro-git-dates -> 403 (on /ascii/)
- **info** `link-cap`: Checked only the first 500 of 590 links.

## Page: https://zander.wtf/

- Title: Zander Martineau | Front-end, design systems, SEO and AEO
- Description: Zander Martineau is a product engineer in London. Front-end, design systems, SEO, AEO, GEO and iOS apps. 18 years of experience.
- H1: Hi! I’m Zander, I make sites that AI can read
- First H2: (none)
- First paragraph: Twelve people, one screen — a quiet way to keep in touch that never reads a single message to work it out.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 527, after rendering: 548

### Findings

- **warn** `heading-skip`: Heading levels skip a level.
  - h1 'Hi! I’m Zander, I make sites that AI can read' -> h3 'Moons'

## Page: https://zander.wtf/work-with-me

- Title: Work with me | Zander Martineau
- Description: Websites and web apps, design systems, SEO, AEO, GEO and iPhone apps from a London product engineer
- H1: Work with me
- First H2: Websites and web apps, design systems, SEO, AEO, GEO and iPhone apps from a London product engineer (question: no)
- First paragraph: I’m Zander Martineau, a product engineer based in London. I have 18 years of experience, and I specialise in front-end web development: the part of a website or app that people see and use. I can help you build a website or app, keep it looking consistent, get it found in Google and named in ChatGPT
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 1057, after rendering: 1093

### Findings

- **info** `canonical-other`: The canonical points to another URL. Correct for a duplicate page, wrong for a unique one.
  - https://zander.wtf/work-with-me/

## Page: https://zander.wtf/cv

- Title: CV | Zander Martineau
- Description: Product Engineer specialising in front-end web development • Design systems advocate • Based in London, UK
- H1: CV
- First H2: Product Engineer specialising in front-end web development • Design systems advocate • Based in London, UK (question: no)
- First paragraph: Product engineer specialising in front-end web development, with 18+ years building for the web, comfortable across the full stack. I focus on shipping the right thing: understanding the user, shaping the product, and owning the outcome, not just the ticket. My work spans fintech, health, music, and
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 1671, after rendering: 1704

### Findings

- **info** `redirect`: The URL redirects to https://zander.wtf/cv/. Link to the final URL.

## Page: https://zander.wtf/blog

- Title: Blog | Zander Martineau
- Description: Writing about web development, AI tools, self-hosting and side projects, with a worklog of what I have shipped in between
- H1: Blog
- First H2: Writing about web development, AI tools, self-hosting and side projects, with a worklog of what I have shipped in between (question: no)
- First paragraph: I've hacked the same debug overlay into almost every job I've had, so I finally made it a proper package that shows the data behind any element when you hold Ctrl+Shift.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 6373, after rendering: 6475

### Findings

- **error** `img-alt-missing`: Images have no alt attribute. Use alt="" only for decoration.
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
- **info** `redirect`: The URL redirects to https://zander.wtf/blog/. Link to the final URL.

## Page: https://zander.wtf/projects

- Title: Projects | Zander Martineau
- Description: Side-projects, packages and other things I have made or am making
- H1: Projects
- First H2: Side-projects, packages and other things I have made or am making (question: no)
- First paragraph: Twelve people, one screen — a quiet way to keep in touch that never reads a single message to work it out.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 830, after rendering: 858

### Findings

- **info** `canonical-other`: The canonical points to another URL. Correct for a duplicate page, wrong for a unique one.
  - https://zander.wtf/projects/
- **info** `facts-no-date`: The page states prices or plans but no 'as of' date.
  - £2.99
  - £1.99,
  - £4.99
  - £19.99
  - £49

## Page: https://zander.wtf/stats

- Title: Stats | Zander Martineau
- Description: Views, hearts and highlights for every page, live
- H1: Stats
- First H2: Views, hearts and highlights for every page, live (question: no)
- First paragraph: Every post, note and project here counts its readers and lets them leave a heart. Posts and notes also let you highlight the bits you like. This is all of it. No cookies and no names: a reader is a random id kept in their browser, so each person counts once per page.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 2390, after rendering: 2422

### Findings

- **info** `description-length`: The meta description is 49 characters. Aim for about 150-160.
  - Views, hearts and highlights for every page, live

## Page: https://zander.wtf/about/

- Title: About me | Zander Martineau
- Description: My name is Zander, I live in London, UK
- H1: About me
- First H2: My name is Zander, I live in London, UK (question: no)
- First paragraph: I’m a product engineer specialising in front-end web development, with 18 years of experience. I help sites get found by search and answer engines like Google, ChatGPT and Claude (SEO, AEO and GEO), build design systems, engineer front-ends, and make iOS apps. See work with me for the detail.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 252, after rendering: 280

### Findings

- **info** `description-length`: The meta description is 39 characters. Aim for about 150-160.
  - My name is Zander, I live in London, UK

## Page: https://zander.wtf/ascii/

- Title: zander.wtf // ASCII mode
- Description: ASCII terminal version of zander.wtf
- H1: (none)
- First H2: (none)
- First paragraph: (none)
- JSON-LD types: (none)
- Dates: published -, modified -
- Words in raw HTML: 420, after rendering: 442

### Findings

- **error** `h1-missing`: The raw HTML has no <h1>.
- **warn** `canonical-missing`: The page has no canonical link.
- **warn** `og-missing`: Open Graph tags are missing.
  - og:title
  - og:description
  - og:image
- **warn** `landmark-main-missing`: The page has no <main>.
- **info** `description-length`: The meta description is 36 characters. Aim for about 150-160.
  - ASCII terminal version of zander.wtf
- **info** `twitter-card-missing`: No twitter:card. X shows a small card without it.
- **info** `jsonld-missing`: No JSON-LD in the raw HTML.

## Page: https://zander.wtf/blog/

- Title: Blog | Zander Martineau
- Description: Writing about web development, AI tools, self-hosting and side projects, with a worklog of what I have shipped in between
- H1: Blog
- First H2: Writing about web development, AI tools, self-hosting and side projects, with a worklog of what I have shipped in between (question: no)
- First paragraph: I've hacked the same debug overlay into almost every job I've had, so I finally made it a proper package that shows the data behind any element when you hold Ctrl+Shift.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 6373, after rendering: 6475

### Findings

- **error** `img-alt-missing`: Images have no alt attribute. Use alt="" only for decoration.
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`

## Page: https://zander.wtf/blog/2020-review/

- Title: 2020 In Review | Zander Martineau
- Description: 2020 was rough. The pandemic, Brexit, and IR35 all played a part in making things much harder, and in some cases, impossible, for me to work as I'd hoped…
- H1: 2020 In Review
- First H2: Work (question: no)
- First paragraph: 2020 was rough. The pandemic, Brexit, and IR35 (external site) all played a part in making things much harder, and in some cases, impossible, for me to work as I’d hoped to. I wasn’t able to find contract work for a few months this summer, and it fucking sucked.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2021-01-03, modified -
- Words in raw HTML: 2014, after rendering: 2062

### Findings

- **error** `img-alt-missing`: Images have no alt attribute. Use alt="" only for decoration.
  - `<img src="/_astro/2020-blog-stats.CryeNzAs_Z1CBqyq.webp">`
- **warn** `js-only-content`: 10 of 2062 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `img-text-suspect`: These images may hold text (testimonials, prices, tables) that should be HTML.
  - `<img src="/_astro/widgets.BcpM09Se_1esyBq.webp">`
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2021-01-03 (2116 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-10-03-cloudflare-scraper/

- Title: Cloudflare scraper | Zander Martineau
- Description: A page metadata scraper built on Cloudflare Workers, using HTMLRewriter to parse pages and pull out their content for Otter.
- H1: Cloudflare scraper
- First H2: A page metadata scraper built on Cloudflare Workers, using HTMLRewriter to parse pages and pull out their content for Otter. (question: no)
- First paragraph: I finished creating the page metadata scraper that’s built with Cloudflare Workers. It uses HTMLRewriter to parse the page and extract content. It will be integrated into Otter (external site) soon.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-10-03, modified -
- Words in raw HTML: 174, after rendering: 213

### Findings

- **error** `img-alt-missing`: Images have no alt attribute. Use alt="" only for decoration.
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
- **warn** `js-only-content`: 10 of 213 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-10-03 (1113 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-10-06-otter-mastodon-integration/

- Title: Mastodon to Supabase integration | Zander Martineau
- Description: A Cloudflare Worker that saves my toots and faved toots into Otter’s Supabase database.
- H1: Mastodon to Supabase integration
- First H2: A Cloudflare Worker that saves my toots and faved toots into Otter’s Supabase database. (question: no)
- First paragraph: I finished the Mastodon to Supabase Cloudflare worker. This is used to saved my toots and faved toots to Otter’s (external site) database.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-10-06, modified -
- Words in raw HTML: 162, after rendering: 201

### Findings

- **error** `img-alt-missing`: Images have no alt attribute. Use alt="" only for decoration.
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
- **warn** `js-only-content`: 10 of 201 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-10-06 (1110 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-11-01-react-styling/

- Title: React blogpost | Zander Martineau
- Description: Published a blog post on how I approach styling React components and apps.
- H1: React blogpost
- First H2: Published a blog post on how I approach styling React components and apps. (question: no)
- First paragraph: Published a blog post about my approach to styling React components and apps. Read it here.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-11-01, modified -
- Words in raw HTML: 151, after rendering: 191

### Findings

- **warn** `js-only-content`: 10 of 191 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-11-01 (1084 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-11-04-otter-v2-release/

- Title: Otter v2.0.0 release | Zander Martineau
- Description: Weeks of work culminating in a complete rewrite of Otter.
- H1: Otter v2.0.0 release
- First H2: Weeks of work culminating in a complete rewrite of Otter. (question: no)
- First paragraph: This release (external site) is the culmination of weeks worth of work to completely rewrite Otter (external site). More info about this new version can be found in the announcement blog post.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-11-04, modified -
- Words in raw HTML: 163, after rendering: 204

### Findings

- **error** `img-alt-missing`: Images have no alt attribute. Use alt="" only for decoration.
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
- **warn** `js-only-content`: 10 of 204 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-11-04 (1081 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-11-11-otter-v2.1.0-release/

- Title: Otter v2.1.0 release | Zander Martineau
- Description: A new dashboard view surfacing recent items alongside ones from your past, so nothing gets lost in the stream.
- H1: Otter v2.1.0 release
- First H2: A new dashboard view surfacing recent items alongside ones from your past, so nothing gets lost in the stream. (question: no)
- First paragraph: This release (external site) added a new dashboard view to Otter that shows a some recent items and others from your past. It is intended to allow more frequent review of your past items so they are not lost in the stream. Below is a video of the new dashboard in action.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-11-11, modified -
- Words in raw HTML: 186, after rendering: 215

### Findings

- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-11-11 (1074 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-11-23-otter-raycast-oauth/

- Title: Otter Raycast OAuth | Zander Martineau
- Description: Got Raycast’s OAuth flow working with Otter, then found Supabase only supports it for the management APIs, not the data APIs.
- H1: Otter Raycast OAuth
- First H2: Got Raycast’s OAuth flow working with Otter, then found Supabase only supports it for the management APIs, not the data APIs. (question: no)
- First paragraph: I spent a large chunk of the day trying to integrate Raycast’s OAuth flow into Otter (external site). I got it working, but unfortunately Supabase only supports the managment APIs using OAuth apps, not the data APIs. I’m going to have to use a different approach.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-11-23, modified -
- Words in raw HTML: 200, after rendering: 240

### Findings

- **error** `img-alt-missing`: Images have no alt attribute. Use alt="" only for decoration.
  - `<img class="mx-2 inline border-none" src="https://raw.githubusercontent.com/mrmartineau/Otter/main/pub">`
- **warn** `js-only-content`: 10 of 240 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-11-23 (1062 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-11-28-worklog/

- Title: Worklog | Zander Martineau
- Description: Added a worklog to the site to keep a running record of what I’m working on.
- H1: Worklog
- First H2: Added a worklog to the site to keep a running record of what I’m working on. (question: no)
- First paragraph: I added a worklog to my site. I’ve seen a few other folks doing this, and I think it’s a great idea. I’m going to try and keep it up to date with what I’m working on, and what I’ve been up to.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-11-28, modified -
- Words in raw HTML: 172, after rendering: 211

### Findings

- **warn** `js-only-content`: 10 of 211 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-11-28 (1057 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-12-01-otter-ai-titles/

- Title: Otter AI titles | Zander Martineau
- Description: Arc’s AI tab renaming got me thinking Otter should tidy up inconsistent bookmark titles too; the Toast component got replaced with Sonner while I was…
- H1: Otter AI titles
- First H2: Arc’s AI tab renaming got me thinking Otter should tidy up inconsistent bookmark titles too; the Toast component got replaced with Sonner while I was there. (question: no)
- First paragraph: One of the AI features the Arc browser recently introduced renames tabs and downloaded files. It is a really small and simple thing but it made me think that Otter could use something similar. When adding new bookmarks, the titles often use very different formatting from one site to the next. This m
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-12-01, modified -
- Words in raw HTML: 263, after rendering: 303

### Findings

- **warn** `js-only-content`: 10 of 303 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-12-01 (1054 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-12-06-opengraph-images/

- Title: Opengraph images | Zander Martineau
- Description: Automated Opengraph images for the site, generated with the @vercel/og package.
- H1: Opengraph images
- First H2: Automated Opengraph images for the site, generated with the @vercel/og package. (question: no)
- First paragraph: I finally added Opengraph images to this site today. I used the @vercel/og package so I could automate the process as much as possible.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-12-06, modified -
- Words in raw HTML: 165, after rendering: 204

### Findings

- **warn** `js-only-content`: 10 of 204 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-12-06 (1049 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2023-12-14-otter-collections/

- Title: Otter Collections | Zander Martineau
- Description: Collections created implicitly from colon-separated tags, plus a tag management page for renaming and regrouping them.
- H1: Otter Collections
- First H2: Collections created implicitly from colon-separated tags, plus a tag management page for renaming and regrouping them. (question: no)
- First paragraph: Added collections to Otter. Collections are not another entity like tags, but are created implicitly when you use a tag with a colon in, for example with the ai:openai or ai:anthropic tags the collection would be ai for both items. I use this form or grouping throughout Otter and I always wanted a s
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2023-12-14, modified -
- Words in raw HTML: 245, after rendering: 285

### Findings

- **warn** `js-only-content`: 10 of 285 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2023-12-14 (1041 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2024-01-08-otter-db-upgrade/

- Title: Otter database upgrade | Zander Martineau
- Description: Upgrading Otter’s Postgres to 15 broke inserts, and the pg_net extension turned out to be the culprit.
- H1: Otter database upgrade
- First H2: Upgrading Otter’s Postgres to 15 broke inserts, and the pg_net extension turned out to be the culprit. (question: no)
- First paragraph: I updated Otter’s PostgreSQL database to version 15 through the Supabase dashboard. There was an issue with the database migration, I wasn’t able to add new items anymore. I was getting this error: permission denied for table http_request_queue.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2024-01-08, modified -
- Words in raw HTML: 209, after rendering: 249

### Findings

- **warn** `js-only-content`: 10 of 249 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2024-01-08 (1016 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2024-02-14-otter-bookmark-entry-improvements/

- Title: Otter Bookmark entry improvements | Zander Martineau
- Description: Improved Otter’s tag matching so partial input matches collection tags, alongside a batch of mobile UI fixes.
- H1: Otter Bookmark entry improvements
- First H2: Improved Otter’s tag matching so partial input matches collection tags, alongside a batch of mobile UI fixes. (question: no)
- First paragraph: When adding or editing a bookmark, Otter checks the contents of the title, description and note fields to see if they match existing tags. If a match is found, it is shown below the tag input field. Since the addition of collections recently, the tag matching logic needed improveing because it would
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2024-02-14, modified -
- Words in raw HTML: 249, after rendering: 292

### Findings

- **warn** `js-only-content`: 10 of 292 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2024-02-14 (979 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2024-02-18-otter-feed-items-collections/

- Title: Add matching collections to Otter feed items | Zander Martineau
- Description: Bookmark feed items in Otter now show their matching collections alongside their tags.
- H1: Add matching collections to Otter feed items
- First H2: Bookmark feed items in Otter now show their matching collections alongside their tags. (question: no)
- First paragraph: Bookmark feed items in Otter already show the tags associated with that item, but now I added matching collections to them as well.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2024-02-18, modified -
- Words in raw HTML: 155, after rendering: 194

### Findings

- **warn** `title-length`: The title is 63 characters. Aim for about 50-60.
  - Add matching collections to Otter feed items | Zander Martineau
- **warn** `js-only-content`: 10 of 194 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2024-02-18 (975 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2024-03-01-moving-to-cloudflare/

- Title: Moving to Cloudflare | Zander Martineau
- Description: After a Netlify customer was billed $104K over a DDoS attack, I moved my personal site and as much else as I could to Cloudflare.
- H1: Moving to Cloudflare
- First H2: After a Netlify customer was billed $104K over a DDoS attack, I moved my personal site and as much else as I could to Cloudflare. (question: no)
- First paragraph: After the craziness where a Netlify customer was charged $104K (external site) because of a DDoS attack, I decided to move my personal site and as many web things to Cloudflare. Most of my sites are on Vercel and I have a few on Netlify and while I love their services, I don’t want to take any chanc
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2024-03-01, modified -
- Words in raw HTML: 198, after rendering: 237

### Findings

- **warn** `js-only-content`: 10 of 237 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2024-03-01 (963 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/blog/2024-03-03-otter-raycast-extension/

- Title: Otter Raycast Extension | Zander Martineau
- Description: Submitted a new version of the Otter Raycast extension for searching and viewing recent bookmarks.
- H1: Otter Raycast Extension
- First H2: Submitted a new version of the Otter Raycast extension for searching and viewing recent bookmarks. (question: no)
- First paragraph: I built a Raycast extension for Otter a long time ago. It allows you to search and view recent bookmarks. It is a great companion to Otter. I have just submitted a new version to the Raycast extension store so it should be released soon for everyone to use.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2024-03-03, modified -
- Words in raw HTML: 190, after rendering: 229

### Findings

- **warn** `js-only-content`: 10 of 229 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.
- **info** `stale`: The newest date on the page is 2024-03-03 (961 days ago). Refresh it only if it should be cited today.


### Run 2

# SEO/AEO/GEO audit, 2026-10-20

Errors: 3. Warnings: 11. Info: 16.
Rendered check: on (/Applications/Google Chrome.app/Contents/MacOS/Google Chrome).

## Site: https://zander.wtf

- Sitemap URLs: 430
- llms.txt: 17 lines

| Crawler | Owner | Purpose | `/` allowed | Own group |
|---|---|---|---|---|
| Googlebot | Google | search | yes | no |
| Bingbot | Microsoft | search | yes | no |
| OAI-SearchBot | OpenAI | search | yes | no |
| Claude-SearchBot | Anthropic | search | yes | no |
| PerplexityBot | Perplexity | search | yes | no |
| meta-webindexer | Meta | search | yes | no |
| Applebot | Apple | search | yes | no |
| ChatGPT-User | OpenAI | user | yes | no |
| Claude-User | Anthropic | user | yes | no |
| Perplexity-User | Perplexity | user | yes | no |
| meta-externalfetcher | Meta | user | yes | no |
| GPTBot | OpenAI | training | yes | no |
| ClaudeBot | Anthropic | training | yes | no |
| meta-externalagent | Meta | training | yes | no |
| Google-Extended | Google | training | yes | no |
| Applebot-Extended | Apple | training | yes | no |
| CCBot | Common Crawl | training | yes | no |

### Site findings

- **warn** `soft-404`: A made-up URL returns 200, not 404. Crawlers index empty pages and miss real errors.
- **info** `sitemap-no-lastmod`: Most sitemap URLs have no <lastmod>. Engines use it to find fresh pages.
- **info** `robots-no-ai-policy`: robots.txt names no AI crawler. State the policy for each purpose so it is not left to defaults.

## Page: https://zander.wtf/blog/lil-debugger/

- Title: Introducing Lil' Debugger | Zander Martineau
- Description: I've hacked the same debug overlay into almost every job I've had, so I finally made it a proper package that shows the data behind any element when you…
- H1: Introducing Lil' Debugger
- First H2: I've hacked the same debug overlay into almost every job I've had, so I finally made it a proper package that shows the data behind any element when you hold Ctrl+Shift. (question: no)
- First paragraph: You should see outlines appear around bits of this page. Hover one, and a small panel in the bottom-left corner tells you which Astro component made it, which file it lives in and what props it got. Let go and it’s gone. No keyboard? Open this page with ?lil-debug and it starts switched on.
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2026-10-05, modified -
- Words in raw HTML: 472, after rendering: 551

### Findings

- **warn** `js-only-content`: 10 of 551 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.

## Page: https://zander.wtf/blog/astro-d1-search-package/

- Title: Introducing astro-d1-search: site search for Astro in one integration | Zander Martineau
- Description: I extracted the search implementation I built for this site into an npm package, so you can add full-text search to your own Astro site
- H1: Introducing astro-d1-search: site search for Astro in one integration
- First H2: I extracted the search implementation I built for this site into an npm package, so you can add full-text search to your own Astro site (question: no)
- First paragraph: A couple of weeks ago I wrote about building site search with Astro and Cloudflare D1: an FTS5 (external site) index built at deploy time, a /api/search endpoint, bm25 (external site) ranking with a recency boost, and a Raycast extension on top. It’s a genuinely good way to do search on a personal s
- JSON-LD types: Person, PostalAddress, WebSite, BlogPosting
- Dates: published 2026-08-02, modified -
- Words in raw HTML: 1960, after rendering: 2159

### Findings

- **warn** `title-length`: The title is 88 characters. Aim for about 50-60.
  - Introducing astro-d1-search: site search for Astro in one integration | Zander Martineau
- **warn** `js-only-content`: 10 of 2159 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `date-modified-missing`: This article has no dateModified in JSON-LD or article:modified_time.

## Page: https://zander.wtf/notes/

- Title: Code Notes | Zander Martineau
- Description: TILs, snippets—my digital code garden
- H1: Code Notes
- First H2: TILs, snippets—my digital code garden (question: no)
- First paragraph: (none)
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 1687, after rendering: 1715

### Findings

- **error** `field-no-label`: Form fields have no label. A placeholder is not a label.
  - `<input class="search-input" name="q" type="search" placeholder="Search notes...">  (placeholder only)`
- **info** `description-length`: The meta description is 37 characters. Aim for about 150-160.
  - TILs, snippets—my digital code garden

## Page: https://zander.wtf/notes/aria-label-notes/

- Title: aria-label notes | Zander Martineau
- Description: A summary of Steve Faulkner's comprehensive guide on aria-label usage. General labeling rules Prefer visible labels over hidden labels Prefer text labels…
- H1: ♿aria-label notes
- First H2: General labeling rules (question: no)
- First paragraph: A summary of Steve Faulkner’s comprehensive guide on aria-label usage.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 521, after rendering: 646

### Findings

- **error** `field-no-label`: Form fields have no label. A placeholder is not a label.
  - `<input class="search-input" name="q" type="search" placeholder="Search notes...">  (placeholder only)`
- **warn** `js-only-content`: 10 of 646 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Nothing marked yet. Select any sentence to be the first.
- **info** `stale`: The newest date on the page is 2026-02-04 (258 days ago). Refresh it only if it should be cited today.

## Page: https://zander.wtf/projects/bird-raycast/

- Title: Bird | Zander Martineau
- Description: A Raycast extension to view your X/Twitter bookmarks and likes using the bird CLI.
- H1: Bird
- First H2: A Raycast extension to view your X/Twitter bookmarks and likes using the bird CLI. (question: no)
- First paragraph: View your X/Twitter bookmarks and likes in Raycast using the bird CLI.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 126, after rendering: 154

### Findings

- No problems found.

## Page: https://zander.wtf/projects/moons/

- Title: Moons | Zander Martineau
- Description: Twelve people, one screen — a quiet way to keep in touch that never reads a single message to work it out.
- H1: Moons
- First H2: Twelve people, one screen — a quiet way to keep in touch that never reads a single message to work it out. (question: no)
- First paragraph: You know who you want to stay close to. You also know it has been longer than you meant since you spoke to some of them.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 504, after rendering: 532

### Findings

- No problems found.

## Page: https://zander.wtf/links/

- Title: Links | Zander Martineau
- Description: Hand-picked hyperlinks, all saved in my Otter bookmarking app
- H1: Links
- First H2: Hand-picked hyperlinks, all saved in my Otter bookmarking app (question: no)
- First paragraph: (none)
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 114, after rendering: 369

### Findings

- **warn** `js-only-content`: 165 of 369 words appear only after JavaScript runs. Most AI crawlers never run it.
  - Bigwords.page – turn any screen into a sign
  - Turn a phone, tablet or TV into a sign. Type a message and it fills the screen: welcome signs, timers, Wi-Fi passwords a
  - Chat is AI’s command line
  - We kept the command line and developed other ways to work. Along the way, we gave ourselves more ways to think.
  - ArtCraft – Crafting Apps – open-source creative tools
  - seven native, open-source creative apps from the ArtCraft team, built in Rust and free to use for image editing, vector 
  - A hands-on stop-motion activity book
  - Open source UI components created by micka_design
  - Front-End Checklist – Web Development Best Practices – Front-End Checklist
  - Trusted front-end quality rules for humans and AI agents. Browse hundreds of curated rules, run workflows, and use MCP f
  - and 2 more

## Page: https://zander.wtf/now/

- Title: Now | Zander Martineau
- Description: Films, TV, books, podcasts…and other things I'm currently enjoying
- H1: Now
- First H2: Films, TV, books, podcasts…and other things I'm currently enjoying (question: no)
- First paragraph: This is a now page, and if you have your own site, you should make one, too.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 135, after rendering: 163

### Findings

- No problems found.

## Page: https://zander.wtf/uses/

- Title: My setup | Zander Martineau
- Description: An overview of my hardware and software setup
- H1: My setup
- First H2: An overview of my hardware and software setup (question: no)
- First paragraph: When working from my home office I like to use good quality products that make my working life more comfortable.
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 1671, after rendering: 2433

### Findings

- **info** `description-length`: The meta description is 45 characters. Aim for about 150-160.
  - An overview of my hardware and software setup
- **info** `facts-no-date`: The page states prices or plans but no 'as of' date.
  - $1
  - $0
  - $0
  - $0
  - $1

## Page: https://zander.wtf/moons/

- Title: Moons: Keep in Touch
- Description: Twelve people, one screen — a quiet way to keep in touch that never reads a single message to work it out.
- H1: Stay close to twelve people
- First H2: One glance tells you who is due (question: no)
- First paragraph: Twelve people, one screen — a quiet way to keep in touch that never reads a single message to work it out.
- JSON-LD types: SoftwareApplication, Person, Offer
- Dates: published -, modified -
- Words in raw HTML: 394, after rendering: 398

### Findings

- **info** `canonical-other`: The canonical points to another URL. Correct for a duplicate page, wrong for a unique one.
  - https://zander.wtf/moons
- **info** `facts-no-date`: The page states prices or plans but no 'as of' date.
  - £2.99
  - £1.99,
  - £4.99
  - £0
  - £2.99

## Page: https://zander.wtf/lil-debugger/

- Title: Lil' Debugger
- Description: A tiny dev tool for any framework, or no framework. Add a data-debug attribute to any element. Hold Ctrl+Shift and the page shows what each element holds.
- H1: Pin debug data to any element
- First H2: Try it (question: no)
- First paragraph: Add a data-debug attribute to any element. Hold the keys and the page shows you its value. It works with any framework, or no framework. No dependencies.
- JSON-LD types: SoftwareSourceCode, Person
- Dates: published -, modified -
- Words in raw HTML: 928, after rendering: 1342

### Findings

- **warn** `og-missing`: Open Graph tags are missing.
  - og:image
- **info** `canonical-other`: The canonical points to another URL. Correct for a duplicate page, wrong for a unique one.
  - https://zander.wtf/lil-debugger
- **info** `facts-no-date`: The page states prices or plans but no 'as of' date.
  - £13.50
  - £120.00
  - £133.50

## Page: https://zander.wtf/search/

- Title: Search | Zander Martineau
- Description: Search blog posts, code notes, projects and more
- H1: Search
- First H2: Search blog posts, code notes, projects and more (question: no)
- First paragraph: Search blog posts, code notes, projects and more. In the meantime, here's the latest:
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 217, after rendering: 245

### Findings

- **error** `field-no-label`: Form fields have no label. A placeholder is not a label.
  - `<input class="search-input" name="q" type="search" placeholder="Search the site...">  (placeholder only)`
- **info** `description-length`: The meta description is 48 characters. Aim for about 150-160.
  - Search blog posts, code notes, projects and more

## Page: https://zander.wtf/scraper-test/

- Title: Scraper test
- Description: meta[name=description]
- H1: h1[slot="title"] | h1.title a | h1.title a
- First H2: (none)
- First paragraph: (none)
- JSON-LD types: (none)
- Dates: published -, modified -
- Words in raw HTML: 7, after rendering: 7

### Findings

- **warn** `canonical-missing`: The page has no canonical link.
- **warn** `og-image-relative`: og:image must be an absolute URL.
  - meta[name=og:image]
- **warn** `h1-multiple`: The page has more than one <h1>.
  - h1[slot="title"]
  - h1.title a
  - h1.title a
- **warn** `landmark-main-missing`: The page has no <main>.
- **info** `description-length`: The meta description is 22 characters. Aim for about 150-160.
  - meta[name=description]
- **info** `twitter-card-missing`: No twitter:card. X shows a small card without it.
- **info** `jsonld-missing`: No JSON-LD in the raw HTML.

## Page: https://zander.wtf/styleguide/

- Title: Styleguide | Zander Martineau
- Description: Every typographic and component style on this site, on one page.
- H1: Styleguide
- First H2: Every typographic and component style on this site, on one page. (question: no)
- First paragraph: Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quidem atque inventore laboriosam perspiciatis quos accusamus rerum ea, veritatis laudantium corporis dignissimos nesciunt temporibus repellat consequuntur fuga doloribus ut? Explicabo, quas!
- JSON-LD types: Person, PostalAddress, WebSite
- Dates: published -, modified -
- Words in raw HTML: 254, after rendering: 280

### Findings

- No problems found.

