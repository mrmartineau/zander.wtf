import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';
import { d1, r2 } from '@emdash-cms/cloudflare';
import { defineConfig } from 'astro/config';
import d1Search from 'astro-d1-search';
import emdash from 'emdash/astro';
import rehypeExternalLinks from 'rehype-external-links';
import searchConfig from './search.config.ts';

const commitHash = execSync('git rev-parse --short HEAD').toString();

// Mark links to other sites in markdown (blog, notes) with an icon, plus hidden
// text for screen readers. rel: [] drops the plugin's default rel="nofollow".
const externalLinks = [
  rehypeExternalLinks,
  {
    rel: [],
    test: (link) =>
      !URL.canParse(link.properties.href) ||
      new URL(link.properties.href).hostname !== 'zander.wtf',
    contentProperties: { className: ['external-link'] },
    content: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['external-link-icon'], ariaHidden: 'true' },
        children: [],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['visually-hidden'] },
        children: [{ type: 'text', value: ' (external site)' }],
      },
    ],
  },
];

// Dev stand-in for the /desktop/* and /tui/* rewrites in public/_redirects:
// serve the plain page, keep the URL. See src/utils/uiMode.ts.
const uiModeRewrites = {
  name: 'ui-mode-rewrites',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use((req, _res, next) => {
        req.url = req.url.replace(/^\/(desktop|tui|txt)(?=\/|$)/, '') || '/';
        next();
      });
    },
  },
};

// Pages prerender in Node, where `cloudflare:workers` doesn't exist. EmDash's
// middleware imports it, so prerendering gets a stub instead.
const prerenderCloudflareStub = {
  name: 'prerender-cloudflare-stub',
  enforce: 'pre',
  applyToEnvironment: (environment) => environment.name === 'prerender',
  resolveId: (id) =>
    id === 'cloudflare:workers'
      ? fileURLToPath(
          new URL('./src/prerender-cloudflare-stub.ts', import.meta.url),
        )
      : undefined,
};

// https://astro.build/config
export default defineConfig({
  site: 'https://zander.wtf',
  integrations: [
    mdx(),
    sitemap(),
    // Solid for the site's own islands, React only for the EmDash admin
    solidJs({ include: ['**/solid/**'] }),
    react({ exclude: ['**/solid/**'] }),
    // CMS admin at /_emdash/admin. Its routes render on demand; the rest of
    // the site stays prerendered.
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      // The origin passkeys and CSRF checks are bound to. Builds deploy to
      // zander.wtf; `pnpm dev` runs behind portless (https://zander.localhost),
      // which EmDash doesn't treat as local. Plain `astro dev` on localhost
      // needs nothing.
      siteUrl: process.argv.includes('build')
        ? 'https://zander.wtf'
        : process.env.PORTLESS_URL,
    }),
    d1Search(searchConfig),
    uiModeRewrites,
  ],
  prefetch: {
    prefetchAll: true,
  },
  markdown: {
    rehypePlugins: [externalLinks],
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
    plugins: [prerenderCloudflareStub],
  },
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
    // Build-time pages use Node APIs (sharp, resvg wasm, fs), so prerender in Node
    prerenderEnvironment: 'node',
  }),
});
