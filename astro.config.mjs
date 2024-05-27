import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';
import cloudflare from '@astrojs/cloudflare';
const commitHash = execSync('git rev-parse --short HEAD').toString();

// https://astro.build/config
export default defineConfig({
  site: 'https://zander.wtf',
  integrations: [mdx(), sitemap()],
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
    ssr: {
      external: [
        'node:buffer', 'node:fs', 'node:path', 'stream', 'http', 'https','url', 'zlib', 'punycode'],
    },
  },
  // output: 'hybrid',
  // adapter: cloudflare({
  //   imageService: 'noop',
  //   wasmModuleImports: true,
  //   platform: 'node',
  //   platformProxy: {
  //     enabled: true
  //   },
  //   runtime: {
  //     mode: 'local',
  //     type: 'pages',
  //   },
  // }),
});
