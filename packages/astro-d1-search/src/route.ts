// Injected by the integration's Vite plugin; carries the resolved options
import config from 'virtual:astro-d1-search-config';
import type { APIRoute } from 'astro';
import { type D1Like, searchIndex } from './core';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': `public, max-age=${config.cacheMaxAge}`,
  };
  if (config.cors) headers['Access-Control-Allow-Origin'] = '*';
  return new Response(JSON.stringify(body), { status, headers });
}

export const GET: APIRoute = async ({ url, locals }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  const limit = Number(url.searchParams.get('limit') ?? 10);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const typeParam = url.searchParams.get('type') ?? undefined;

  if (!Number.isInteger(limit) || limit < 1) {
    return json({ error: 'Invalid limit' }, 400);
  }
  if (!Number.isInteger(offset) || offset < 0 || offset > config.maxOffset) {
    return json({ error: 'Invalid offset' }, 400);
  }
  if (q.length > config.maxQueryLength) {
    return json({ error: 'Query too long' }, 400);
  }
  if (typeParam && !config.types.includes(typeParam)) {
    return json(
      { error: `Invalid type. One of: ${config.types.join(', ')}` },
      400,
    );
  }
  if (q.length < 2) {
    return json({ query: q, results: [] });
  }

  // Cloudflare runtime provided by the adapter. Structurally typed (via
  // unknown) so the package depends on neither the host project's generated
  // Env types nor workers-types, whose Cache clashes with the DOM lib's.
  const runtime = (
    locals as unknown as {
      runtime: {
        env: Record<string, unknown>;
        ctx?: { waitUntil(p: Promise<unknown>): void };
        caches?: {
          default?: {
            match(key: string): Promise<Response | undefined>;
            put(key: string, response: Response): Promise<unknown>;
          };
        };
      };
    }
  ).runtime;

  const db = runtime.env[config.binding];
  if (!db) {
    return json(
      {
        error: `D1 binding "${config.binding}" not found. Check your wrangler config.`,
      },
      500,
    );
  }

  // Canonicalised cache key: only the params that affect the result, in a
  // fixed order, query lowercased (FTS5 matching is case-insensitive). This
  // dedupes repeated queries at the edge so they never hit D1, and stops
  // junk params from busting the cache.
  const cacheKeyUrl = new URL(url.pathname, url.origin);
  cacheKeyUrl.searchParams.set('q', q.toLowerCase());
  cacheKeyUrl.searchParams.set(
    'limit',
    String(Math.min(limit, config.maxLimit)),
  );
  cacheKeyUrl.searchParams.set('offset', String(offset));
  if (typeParam) cacheKeyUrl.searchParams.set('type', typeParam);
  const cacheKey = cacheKeyUrl.toString();

  const cache = runtime.caches?.default;
  const cached = await cache?.match(cacheKey);
  if (cached) return cached;

  const results = await searchIndex(
    db as D1Like,
    {
      query: q,
      limit: Math.min(limit, config.maxLimit),
      offset,
      type: typeParam,
    },
    config,
  );

  const response = json({
    query: q,
    results: results.map((result) => ({
      ...result,
      url: new URL(result.url, url.origin).toString(),
    })),
  });

  if (cache) {
    const put = cache.put(cacheKey, response.clone());
    if (runtime.ctx) {
      runtime.ctx.waitUntil(put);
    } else {
      await put;
    }
  }
  return response;
};
