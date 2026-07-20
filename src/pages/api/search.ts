import type { APIRoute } from 'astro';
import { SEARCH_TYPES, type SearchType, searchIndex } from '~/utils/search';

export const prerender = false;

const MAX_LIMIT = 25;

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
  if (!Number.isInteger(offset) || offset < 0) {
    return json({ error: 'Invalid offset' }, 400);
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

  const results = await searchIndex(locals.runtime.env.SEARCH_DB, {
    query: q,
    limit: Math.min(limit, MAX_LIMIT),
    offset,
    type: typeParam as SearchType | undefined,
  });

  return json({
    query: q,
    results: results.map((result) => ({
      ...result,
      url: new URL(result.url, url.origin).toString(),
    })),
  });
};
