# Search zander.wtf — Raycast extension

Searches all content on [zander.wtf](https://zander.wtf) via its `/api/search` endpoint (Cloudflare D1 + FTS5): blog posts, code notes, projects, worklog entries and pages.

## Features

- Search-as-you-type (server-side prefix matching, bm25 + recency ranking)
- Filter by content type via the dropdown (⌘P): Blog, Code Note, Project, Worklog, Page
- Enter opens the result in the browser; ⌘C copies the URL
- Site base URL configurable in preferences (handy for testing against `localhost`)

## Development

```sh
cd raycast-extension
npm install
npm run dev     # opens the command in Raycast with live reload
```

`npm run build` type-checks and bundles without publishing.
