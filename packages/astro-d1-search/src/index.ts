import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import {
  type D1SearchOptions,
  type ResolvedD1SearchConfig,
  resolveConfig,
} from './config';

export type {
  D1SearchOptions,
  ResolvedD1SearchConfig,
  SearchSource,
} from './config';
export {
  type D1Like,
  DEFAULT_RANKING,
  type RankingConfig,
  type SearchOptions,
  type SearchResult,
  searchIndex,
  toFtsQuery,
} from './core';
export { buildIndex, gatherDocs, runCli, SCHEMA_SQL, toSql } from './indexer';
export { markdownToPlainText, sqlEscape } from './markdown';

const VIRTUAL_ID = 'virtual:astro-d1-search-config';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

const WRANGLER_SNIPPET = (config: ResolvedD1SearchConfig) => `
[[d1_databases]]
binding = "${config.binding}"
database_name = "${config.database}"
database_id = "<run: wrangler d1 create ${config.database}>"
`;

/**
 * Warn (with a copy-paste snippet) if the project's wrangler config doesn't
 * mention the configured binding/database. String search only; deliberately
 * no TOML/JSON parsing so any config format works.
 */
function checkWranglerConfig(
  config: ResolvedD1SearchConfig,
  root: URL,
  logger: { warn(msg: string): void },
) {
  const candidates = ['wrangler.toml', 'wrangler.jsonc', 'wrangler.json'];
  const found = candidates
    .map((name) => fileURLToPath(new URL(name, root)))
    .find((path) => existsSync(path));

  if (!found) {
    logger.warn(
      `no wrangler config found. The "${config.binding}" D1 binding must be configured for search to work. For wrangler.toml:\n${WRANGLER_SNIPPET(config)}`,
    );
    return;
  }

  const contents = readFileSync(found, 'utf-8');
  if (
    !contents.includes(config.binding) ||
    !contents.includes(config.database)
  ) {
    logger.warn(
      `${found} doesn't reference the "${config.binding}" binding for database "${config.database}". Add:\n${WRANGLER_SNIPPET(config)}`,
    );
  }
}

export default function d1Search(options: D1SearchOptions): AstroIntegration {
  const config = resolveConfig(options);

  // Only the serialisable parts the route needs at runtime
  const runtimeConfig = {
    binding: config.binding,
    types: config.types,
    cors: config.cors,
    cacheMaxAge: config.cacheMaxAge,
    maxLimit: config.maxLimit,
    maxOffset: config.maxOffset,
    maxQueryLength: config.maxQueryLength,
    weights: config.weights,
    recency: config.recency,
    maxTerms: config.maxTerms,
    snippetTokens: config.snippetTokens,
  };

  return {
    name: 'astro-d1-search',
    hooks: {
      'astro:config:setup': ({
        injectRoute,
        updateConfig,
        logger,
        config: astroConfig,
      }) => {
        checkWranglerConfig(config, astroConfig.root, logger);

        updateConfig({
          vite: {
            plugins: [
              {
                name: 'astro-d1-search-config',
                resolveId(id: string) {
                  return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined;
                },
                load(id: string) {
                  return id === RESOLVED_VIRTUAL_ID
                    ? `export default ${JSON.stringify(runtimeConfig)}`
                    : undefined;
                },
              },
            ],
          },
        });

        if (config.apiRoute) {
          injectRoute({
            pattern: config.apiRoute,
            entrypoint: fileURLToPath(new URL('./route.ts', import.meta.url)),
            prerender: false,
          });
        }
      },
    },
  };
}
