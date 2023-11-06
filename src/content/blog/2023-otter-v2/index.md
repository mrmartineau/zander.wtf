---
slug: otter-v2
title: Otter v2.0.0
subtitle: Updating and open sourcing my bookmarking side project
date: 2023-11-04
tags:
  - side-project
  - nextjs
  - supabase
  - cloudflare
  - react
---

Otter, my personal bookmarking side-project has, until recently been closed-source. I have always wanted to open-source it but never felt it was ready. Recently I had a few weeks off between contracts so I updated Otter to be compatible with Next.js 13’s app router. I also moved from Stitches to PostCSS and I stopped using React Query in favour of server components, all of which meant I rewrote almost every part of the app.

This rewrite has allowed me to fix certain issues and improve performance in almost every part of the app. Previously the app used Next’s API routes to fetch data for pretty much everything as I said in my previous post about it; I wanted Otter to be an API-first app, but on closer inspection, only a small selection of APIs were needed by the various 3rd party integrations that I made.

Instead of APIs for everything, I fetched data directly from [Supabase](https://supabase.com/) in each page and in some cases [extracting the fetch function](https://github.com/mrmartineau/Otter/blob/main/src/utils/fetching/bookmarks.ts#L10-L45) so it could be reused. This had a massive impact.

Using the new app router from Next also allowed me to improve data fetching in the app, because I moved a lot of it into server components and `{layout,page}.tsx` files - also I love the way layouts are handled in Next btw.

I should also be said that many of the performance-related issues in the old version were based on my decision to use React Query. I used it for everything, and it worked great for keeping the UI in sync with the server but that basically meant all the fetching was being done on the client side which is bonkers when Next already has a great API for fetching data on the server! You live and learn I guess..

It wasn’t all plain sailing on the data-fetching-front though, the recommended way to keep the UI in sync with the PostgreSQL database is to use Supabase’s realtime feature, which used Websockets under the hood. This was a surprise to me and involved refactoring a bunch of the rewritten code. I feel like there should be a better way to utilise Next.js’s `revalidatePath` function but it seems that is not yet possible. You can see the various hooks for this in my [`useRealtime.tsx file`](https://github.com/mrmartineau/otter-2/blob/7d5c9e023d30cc871e4406716071aaf784bb3d73/src/hooks/useRealtime.ts).

Now that [Stitches](https://stitches.dev/) is [no longer maintained](https://github.com/stitchesjs/stitches/discussions/1149#discussioncomment-6223090) and not recommended for use with modern versions of Next.js that use Server Components (which this version of Otter uses), I needed to restyle the entire app. This was probably the biggest amount of work in the rewrite. I used my [new styling stack](https://zander.wtf/blog/styling-react) and laboriously moved it across from one to the other.

I also improved a few other features by making use of [Cloudflare workers](https://workers.cloudflare.com/). One of which is the page metadata scraper that Otter uses to pre-fill new entry fields with a link’s title, description etc, and the other was how Mastodon toots are backed up.

In the old version, I used the various [Metascraper](https://metascraper.js.org/#/) packages to make my own scraper. It worked pretty well but had weird issues on some pages and sometimes took forever to return a response. After that I used the free tier from [Microlink](https://microlink.io/) but that only improved things marginally, it was realiable but very slow if the link was not cached already by the service. In this version, I used `HTMLRewriter` within Cloudflare workers to pick content from the page based on a certain set of rules, and it is nearly instant! I cannot believe how quick and reliable it is. I will be writing a post about the making of this worker soon, so watch out for that. By the way, the source code for this worker can be found [here](https://github.com/mrmartineau/cloudflare-worker-scraper).

The other Cloudflare worker I created was to backup my Mastodon toots and favourites to my database. It runs on a CRON job every 2 hours and adds new items to my `toots` table. These items can then be searched from within Otter. The source code for this worker can be found [here](https://github.com/mrmartineau/mastodon-to-supabase).

I used to use [Pipedream](https://pipedream.com/) to do the same thing for my Tweets, but since Elon fucked with the platform and restricted the APIs, those backups have been frozen in time with the last backed-up tweet dated February 17th 2023.

<img src="https://github.com/mrmartineau/Otter/blob/main/app/apple-icon.png?raw=true" alt="Otter logo" class="max-w-[50%] mx-auto no-border"/>

Otter has used the emoji Otter 🦦 for its logo since the early days, but always wanted to design a custom logo. In my previous Otter post, I shared how AI was used to help generate ideas for the logo. With the release of DALL·E 3, I tried again and found some good sources of inspiration which I then converted to a custom logo in Figma.

### Otter ecosystem

Otter would not be so useful if it existed purely as a web app, so (as I mentioned in my [previous article](https://zander.wtf/blog/otter-intro)) there are a few tools I use in conjunction with Otter, the main ones being the Chromium extension, the Raycast extension and the Apple Shortcut; the code for each are open-source as well!

---

I am very pleased with the rewrite because it allowed me to bring everything up-to-date and setup a good base for the future.

So what does it look like?

<div class="grid grid-cols-2 gap-7">
  <figure>
    <figcaption>Feed (dark mode)</figcaption>
    <img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/screens/feed.png?raw=true" alt="Feed (dark mode)" />
  </figure>
  <figure>
    <figcaption>Feed (light mode)</figcaption>
    <img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/screens/feed-light.png?raw=true" alt="Bookmark (light mode)" />
  </figure>
  <figure>
    <figcaption>New Bookmark page</figcaption>
    <img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/screens/add-new.png?raw=true" alt="New Bookmark page" />
  </figure>
  <figure>
    <figcaption>Search</figcaption>
    <img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/screens/search.png?raw=true" alt="Search" />
  </figure>
  <figure>
    <figcaption>Feed (showing tags sidebar)</figcaption>
    <img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/screens/tags-sidebar.png?raw=true" alt="Feed (showing tags sidebar)" />
  </figure>
  <figure>
    <figcaption>Toots feed</figcaption>
    <img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/screens/toots.png?raw=true" alt="Toots feed" />
  </figure>
</div>

### Try it yourself

Otter’s [source code](https://github.com/mrmartineau/Otter) is now open-source so I encourage you to setup your own instance of it. You'll need free Supabase and Cloudflare accounts, and I host Otter with Vercel which is also free!

There are no official docs yet, but I hope to get them written soon. Please ask me anything if you have [questions](https://github.com/mrmartineau/Otter/discussions) or [create an issue](https://github.com/mrmartineau/Otter/issues?q=is:issue+is:open+sort:updated-desc) if you run into problems.
