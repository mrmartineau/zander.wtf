---
slug: 2023-10-03-cloudflare-scraper
title: Cloudflare scraper
subtitle: "A page metadata scraper built on Cloudflare Workers, using HTMLRewriter to parse pages and pull out their content for Otter."
date: 2023-10-03
worklog: true
---

I finished creating the page metadata scraper that's built with Cloudflare Workers. It uses `HTMLRewriter` to parse the page and extract content. It will be integrated into [<img src="https://raw.githubusercontent.com/mrmartineau/Otter/main/public/otter-logo.svg" width="30" height="30" class="mx-2 inline border-none" /> Otter](https://github.com/mrmartineau/Otter) soon.

The repo for it is here: [github.com/mrmartineau/cloudflare-worker-scraper](https://github.com/mrmartineau/cloudflare-worker-scraper)
