/** A content source: a directory of markdown files (or explicit file list). */
export type SearchSource = {
  /** Directory to scan recursively for .md/.mdx files. */
  dir?: string;
  /** Explicit list of files (alternative to `dir`). */
  files?: string[];
  /** The `type` value stored with every document from this source. */
  type: string;
  /**
   * URL pattern for documents from this source. `:slug` is replaced with the
   * document slug (frontmatter `slug`, else file/directory name). A pattern
   * without `:slug` maps every document to the same page (e.g. '/worklog').
   */
  url: string;
  /** Directory names to skip while scanning (default: ['Templates']). */
  skipDirs?: string[];
};

export type D1SearchOptions = {
  /** D1 database name, as created with `wrangler d1 create <name>`. */
  database: string;
  /** D1 binding name in wrangler config. Default: 'SEARCH_DB'. */
  binding?: string;
  /**
   * Value for the `site` column. When set, index pushes only replace rows
   * belonging to this site, so several sites can share one database.
   */
  site?: string;
  /** Content sources to index. */
  sources: SearchSource[];
  /** Route pattern for the injected API endpoint, or false to disable. Default: '/api/search'. */
  apiRoute?: string | false;
  /** Send `Access-Control-Allow-Origin: *` on API responses. Default: true. */
  cors?: boolean;
  /** `Cache-Control: public, max-age=<n>` on API responses, in seconds. Default: 300. */
  cacheMaxAge?: number;
  /** Hard cap on the `limit` query param. Default: 25. */
  maxLimit?: number;
  /** Hard cap on the `offset` query param. Default: 200. */
  maxOffset?: number;
  /** Hard cap on query string length. Default: 100. */
  maxQueryLength?: number;
  /** bm25 weights per column. Higher = matches in that column count more. */
  weights?: {
    title?: number;
    description?: number;
    content?: number;
    tags?: number;
  };
  /**
   * Recency boost: a document published today gets its relevance multiplied
   * by (1 + boost), falling off linearly to ×1 at windowDays old. Undated
   * documents get no boost. boost: 0 disables.
   */
  recency?: { boost?: number; windowDays?: number };
  /** Max search terms taken from a query. Default: 8. */
  maxTerms?: number;
  /** Approximate token count of the highlighted snippet. Default: 24. */
  snippetTokens?: number;
  /** Truncate document content to this many characters. Default: 8000. */
  maxContentLength?: number;
};

export type ResolvedD1SearchConfig = {
  database: string;
  binding: string;
  site: string;
  sources: Required<SearchSource>[];
  types: string[];
  apiRoute: string | false;
  cors: boolean;
  cacheMaxAge: number;
  maxLimit: number;
  maxOffset: number;
  maxQueryLength: number;
  weights: {
    title: number;
    description: number;
    content: number;
    tags: number;
  };
  recency: { boost: number; windowDays: number };
  maxTerms: number;
  snippetTokens: number;
  maxContentLength: number;
};

export function resolveConfig(
  options: D1SearchOptions,
): ResolvedD1SearchConfig {
  if (!options?.database) {
    throw new Error('[astro-d1-search] `database` option is required');
  }
  if (!options.sources?.length) {
    throw new Error(
      '[astro-d1-search] at least one entry in `sources` is required',
    );
  }
  for (const source of options.sources) {
    if (!source.dir && !source.files?.length) {
      throw new Error(
        `[astro-d1-search] source "${source.type}" needs either \`dir\` or \`files\``,
      );
    }
  }

  const sources = options.sources.map((source) => ({
    dir: source.dir ?? '',
    files: source.files ?? [],
    type: source.type,
    url: source.url,
    skipDirs: source.skipDirs ?? ['Templates'],
  }));

  return {
    database: options.database,
    binding: options.binding ?? 'SEARCH_DB',
    site: options.site ?? '',
    sources,
    types: [...new Set(sources.map((source) => source.type))],
    apiRoute: options.apiRoute === undefined ? '/api/search' : options.apiRoute,
    cors: options.cors ?? true,
    cacheMaxAge: options.cacheMaxAge ?? 300,
    maxLimit: options.maxLimit ?? 25,
    maxOffset: options.maxOffset ?? 200,
    maxQueryLength: options.maxQueryLength ?? 100,
    weights: {
      title: options.weights?.title ?? 10,
      description: options.weights?.description ?? 5,
      content: options.weights?.content ?? 1,
      tags: options.weights?.tags ?? 3,
    },
    recency: {
      boost: options.recency?.boost ?? 0.35,
      windowDays: options.recency?.windowDays ?? 1095,
    },
    maxTerms: options.maxTerms ?? 8,
    snippetTokens: options.snippetTokens ?? 24,
    maxContentLength: options.maxContentLength ?? 8000,
  };
}
