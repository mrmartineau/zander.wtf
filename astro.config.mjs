import { execSync } from 'node:child_process';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';
import { defineConfig } from 'astro/config';

const commitHash = execSync('git rev-parse --short HEAD').toString();

// https://astro.build/config
export default defineConfig({
  site: 'https://zander.wtf',
  integrations: [mdx(), sitemap(), solidJs()],
  prefetch: {
    prefetchAll: true,
  },
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'poimandres',
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
  adapter: cloudflare({imageService: "compile"}),
});
