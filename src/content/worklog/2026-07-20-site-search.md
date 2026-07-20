---
title: Site-wide search + Raycast extension
date: 2026-07-20
---

This site now has proper full-text search at [/search](/search) — no Algolia, no third-party service. It's backed by **Cloudflare D1** using SQLite's FTS5, with bm25 ranking, a recency boost, and highlighted snippets. The index covers blog posts, code notes, projects, worklog entries and standalone pages, and is rebuilt and pushed to D1 on every deploy.

The search is also exposed as an open JSON API, which powers a new **Raycast extension** for searching the site straight from the launcher.
