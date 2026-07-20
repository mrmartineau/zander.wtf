import type { APIRoute } from 'astro';
import { SEARCH_TYPES, type SearchType, searchIndex } from '~/utils/search';

export const prerender = false;

const MAX_LIMIT = 25;
const MAX_OFFSET = 200;
const MAX_QUERY_LENGTH = 100;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const GET: APIRoute = async ({ url, locals }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  const limit = Number(url.searchParams.get('limit') ?? 10);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const typeParam = url.searchParams.get('type') ?? undefined;

  if (!Number.isInteger(limit) || limit < 1) {
    return json({ error: 'Invalid limit' }, 400);
  }
  if (!Number.isInteger(offset) || offset < 0 || offset > MAX_OFFSET) {
    return json({ error: 'Invalid offset' }, 400);
  }
  if (q.length > MAX_QUERY_LENGTH) {
    return json({ error: 'Query too long' }, 400);
  }
  if (typeParam && !SEARCH_TYPES.includes(typeParam as SearchType)) {
    return json(
      { error: `Invalid type. One of: ${SEARCH_TYPES.join(', ')}` },
      400,
    );
  }
  if (q.length < 2) {
    return json({ query: q, results: [] });
  }

  // Canonicalised cache key: only the params that affect the result, in a
  // fixed order, query lowercased (FTS5 matching is case-insensitive). This
  // dedupes repeated/hammered queries at the edge so they never hit D1, and
  // stops junk params from busting the cache.
  const cacheKeyUrl = new URL('/api/search', url.origin);
  cacheKeyUrl.searchParams.set('q', q.toLowerCase());
  cacheKeyUrl.searchParams.set('limit', String(Math.min(limit, MAX_LIMIT)));
  cacheKeyUrl.searchParams.set('offset', String(offset));
  if (typeParam) cacheKeyUrl.searchParams.set('type', typeParam);
  const cacheKey = cacheKeyUrl.toString();

  // The cache binding is typed with workers-types Request/Response, which
  // clash with the DOM lib types Astro compiles against; cast across the
  // boundary.
  const cache = locals.runtime.caches?.default;
  const cached = (await cache?.match(cacheKey)) as unknown as
    | Response
    | undefined;
  if (cached) return cached;

  const results = await searchIndex(locals.runtime.env.SEARCH_DB, {
    query: q,
    limit: Math.min(limit, MAX_LIMIT),
    offset,
    type: typeParam as SearchType | undefined,
  });

  const response = json({
    query: q,
    results: results.map((result) => ({
      ...result,
      url: new URL(result.url, url.origin).toString(),
    })),
  });

  if (cache) {
    locals.runtime.ctx.waitUntil(
      cache.put(
        cacheKey,
        response.clone() as unknown as Parameters<typeof cache.put>[1],
      ),
    );
  }
  return response;
};
