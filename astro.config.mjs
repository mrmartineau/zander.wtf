import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';
import { defineConfig } from 'astro/config';
import d1Search from 'astro-d1-search';
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

// Lil' Debugger demo: put a data-debug attribute on the first element of every
// component and layout, holding its name, file and plain props. Hold Ctrl+Shift
// on any page to see them (BaseLayout turns the debugger on).
// ponytail: tags only the first plain HTML element in the template; a
// component whose first element is <meta>, <style> etc. or another component
// is skipped. Swap for a compiler-level transform if that ever matters.
const skipTags = new Set([
  'html',
  'head',
  'meta',
  'link',
  'title',
  'style',
  'script',
  'slot',
]);
const lilDebugTags = {
  name: 'lil-debug-tags',
  enforce: 'pre',
  // load, not transform: Astro compiles .astro files in its own transform,
  // which runs first, so this has to hand it the changed source.
  load(id) {
    const match = id.match(/\/(src\/(?:components|layouts)\/.+\.astro)$/);
    if (!match) return;
    const code = readFileSync(id, 'utf8');
    const fence = code.startsWith('---') ? code.indexOf('---', 3) + 3 : 0;
    const tag = /<([a-z][a-z0-9-]*)(?=[\s>/])/g;
    tag.lastIndex = fence;
    const first = tag.exec(code);
    if (!first || skipTags.has(first[1])) return;
    const end = first.index + first[0].length;
    const component = match[1].split('/').pop().replace('.astro', '');
    const attr = ` data-debug={JSON.stringify({ component: ${JSON.stringify(component)}, file: ${JSON.stringify(match[1])}, ...Object.fromEntries(Object.entries(Astro.props).filter(([k, v]) => !k.startsWith('data-astro-') && v != null && typeof v !== 'object' && typeof v !== 'function')) })}`;
    return code.slice(0, end) + attr + code.slice(end);
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
    plugins: [lilDebugTags],
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
