import { execSync } from 'node:child_process';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';
import { defineConfig } from 'astro/config';
import d1Search from 'astro-d1-search';
import searchConfig from './search.config.ts';

const commitHash = execSync('git rev-parse --short HEAD').toString();

// Dev stand-in for the /desktop/* and /tui/* rewrites in public/_redirects:
// serve the plain page, keep the URL. See src/utils/uiMode.ts.
const uiModeRewrites = {
  name: 'ui-mode-rewrites',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use((req, _res, next) => {
        req.url = req.url.replace(/^\/(desktop|tui)(?=\/|$)/, '') || '/';
        next();
      });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://zander.wtf',
  integrations: [
    mdx(),
    sitemap(),
    solidJs(),
    d1Search(searchConfig),
    uiModeRewrites,
  ],
  prefetch: {
    prefetchAll: true,
  },
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'rose-pine',
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://github.com/shikijs/shiki/blob/main/docs/languages.md
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
  },
  vite: {
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },
  },
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
    // Exposes wrangler.toml bindings (SEARCH_DB) to astro dev via Astro.locals.runtime
    platformProxy: { enabled: true },
  }),
});
