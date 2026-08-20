import type { D1SearchOptions } from 'astro-d1-search';

/**
 * Site search configuration, consumed by:
 * - astro.config.mjs (the astro-d1-search integration: injected /api/search
 *   route, ranking, wrangler validation)
 * - scripts/build-search-index.ts (index build + push to D1)
 * - src/utils/search.ts (direct queries from the search pages)
 */
const searchConfig: D1SearchOptions = {
  database: 'zander-wtf-search',
  binding: 'SEARCH_DB',
  site: 'zander.wtf',
  sources: [
    {
      dir: 'src/content/blog',
      type: 'blog',
      url: '/blog/:slug',
      // Worklog entries live under blog/ but are indexed as their own type
      skipDirs: ['Templates', 'worklog'],
    },
    { dir: 'src/content/codenotes', type: 'note', url: '/notes/:slug' },
    { dir: 'src/content/projects', type: 'project', url: '/projects/:slug' },
    {
      dir: 'src/content/blog/worklog',
      type: 'worklog',
      url: '/blog/:slug',
      skipDirs: ['_drafts'],
    },
    {
      files: [
        'src/pages/about.mdx',
        'src/pages/colophon.md',
        'src/pages/uses.md',
        'src/pages/feeds.md',
        'src/pages/privacy.md',
        'src/pages/zed-stack.mdx',
      ],
      type: 'page',
      url: '/:slug',
    },
  ],
  recency: {
    boost: 0.35, // a doc published today gets relevance × 1.35
    windowDays: 1095, // falling linearly to ×1 at 3 years old
  },
};

export default searchConfig;
