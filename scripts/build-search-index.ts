#!/usr/bin/env npx tsx
/**
 * Builds the site search index and pushes it to Cloudflare D1.
 * All logic lives in the astro-d1-search package; config in search.config.ts.
 *
 * Usage:
 *   pnpm search:index            # build + push to local D1 (dev)
 *   pnpm search:push             # build + push to remote D1 (CI/prod)
 *   npx tsx scripts/build-search-index.ts --dry-run  # write SQL only
 */
import { runCli } from 'astro-d1-search/indexer';
import searchConfig from '../search.config';

runCli(searchConfig);
