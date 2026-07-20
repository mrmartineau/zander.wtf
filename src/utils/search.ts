import { SEARCH_CONFIG } from '../search.config';

export const SEARCH_TYPES = [
  'blog',
  'note',
  'project',
  'worklog',
  'page',
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export type SearchResult = {
  title: string;
  url: string;
  type: SearchType;
  date: string;
  tags: string;
  emoji: string;
  snippet: string;
  score: number;
};

/**
 * Convert raw user input into a safe FTS5 MATCH expression. Every term is
 * double-quoted (neutralises AND/OR/NEAR/-/* operators); the last term gets
 * a `*` suffix for prefix matching, giving search-as-you-type behaviour.
 */
export function toFtsQuery(input: string): string {
  const terms = input
    .replace(/["'`]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, SEARCH_CONFIG.maxTerms);
  if (terms.length === 0) return '""';
  return terms
    .map((term, i) => (i === terms.length - 1 ? `"${term}"*` : `"${term}"`))
    .join(' ');
}

type SearchOptions = {
  query: string;
  limit?: number;
  offset?: number;
  type?: SearchType;
};

export async function searchIndex(
  db: D1Database,
  { query, limit = 10, offset = 0, type }: SearchOptions,
): Promise<SearchResult[]> {
  const match = toFtsQuery(query);
  const { weights, recency, snippetTokens } = SEARCH_CONFIG;

  // bm25() is lower-is-better (negative), so ORDER BY score ascending.
  // The recency multiplier (see search.config.ts) scales relevance up for
  // newer documents: ×(1 + boost) today, falling linearly to ×1 at
  // windowDays old. Undated rows (julianday(date) IS NULL) get no boost.
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
