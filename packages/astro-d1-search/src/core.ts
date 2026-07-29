import type { ResolvedD1SearchConfig } from './config';

/**
 * Minimal structural type for a D1 database binding, so this package does
 * not depend on workers-types. Cloudflare's D1Database satisfies it.
 */
export type D1Like = {
  prepare(sql: string): {
    bind(...values: (string | number)[]): {
      all<T>(): Promise<{ results: T[] }>;
    };
  };
};

export type SearchResult = {
  title: string;
  url: string;
  type: string;
  date: string;
  tags: string;
  emoji: string;
  snippet: string;
  score: number;
};

export type RankingConfig = Pick<
  ResolvedD1SearchConfig,
  'weights' | 'recency' | 'maxTerms' | 'snippetTokens'
>;

export const DEFAULT_RANKING: RankingConfig = {
  weights: { title: 10, description: 5, content: 1, tags: 3 },
  recency: { boost: 0.35, windowDays: 1095 },
  maxTerms: 8,
  snippetTokens: 24,
};

/**
 * Convert raw user input into a safe FTS5 MATCH expression. Every term is
 * double-quoted (neutralises AND/OR/NEAR/-/* operators); the last term gets
 * a `*` suffix for prefix matching, giving search-as-you-type behaviour.
 */
export function toFtsQuery(input: string, maxTerms = 8): string {
  const terms = input
    .replace(/["'`]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxTerms);
  if (terms.length === 0) return '""';
  return terms
    .map((term, i) => (i === terms.length - 1 ? `"${term}"*` : `"${term}"`))
    .join(' ');
}

export type SearchOptions = {
  query: string;
  limit?: number;
  offset?: number;
  type?: string;
};

export async function searchIndex(
  db: D1Like,
  { query, limit = 10, offset = 0, type }: SearchOptions,
  ranking: RankingConfig = DEFAULT_RANKING,
): Promise<SearchResult[]> {
  const match = toFtsQuery(query, ranking.maxTerms);
  const { weights, recency, snippetTokens } = ranking;

  // bm25() is lower-is-better (negative), so ORDER BY score ascending. The
  // recency multiplier scales relevance up for newer documents: ×(1 + boost)
  // today, falling linearly to ×1 at windowDays old. Undated rows
  // (julianday(date) IS NULL) get no boost. Interpolated values all come
  // from the resolved config (numbers), never from user input.
  const relevance = `bm25(search_index, ${weights.title}.0, ${weights.description}.0, ${weights.content}.0, ${weights.tags}.0)`;
  const ageDays = `(julianday('now') - julianday(date))`;
  const recencyMultiplier = `(1.0 + ${recency.boost} * coalesce(max(0.0, 1.0 - ${ageDays} / ${recency.windowDays}.0), 0.0))`;

  let sql = `SELECT title, url, type, date, tags, emoji,
       snippet(search_index, 2, '<mark>', '</mark>', '…', ${snippetTokens}) AS snippet,
       ${relevance} * ${recencyMultiplier} AS score
     FROM search_index
     WHERE search_index MATCH ?1`;
  const bindings: (string | number)[] = [match];

  if (type) {
    sql += ` AND type = ?${bindings.length + 1}`;
    bindings.push(type);
  }
  sql += ` ORDER BY score LIMIT ?${bindings.length + 1} OFFSET ?${bindings.length + 2}`;
  bindings.push(limit, offset);

  const { results } = await db
    .prepare(sql)
    .bind(...bindings)
    .all<SearchResult>();

  return results;
}
