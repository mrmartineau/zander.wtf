import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { execSync } from 'node:child_process'

import prefetch from '@astrojs/prefetch'
const commitHash = execSync('git rev-parse --short HEAD').toString()

// https://astro.build/config
export default defineConfig({
  site: 'https://zander.wtf',
  integrations: [mdx(), sitemap(), prefetch()],
  vite: {
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },
  },
  experimental: {
    viewTransitions: true,
  },
})
