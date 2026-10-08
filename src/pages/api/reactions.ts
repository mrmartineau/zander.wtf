// Views, hearts and highlights for pages, kept in D1
// (REACTIONS_DB, schema in migrations/reactions). The page POSTs one action and
// gets the page's full state back, so a page load is a single request.
// A reader is a random id the browser keeps in localStorage: "views" are unique
// readers, and "mine" marks that reader's own highlights.
// ponytail: anyone can make up new reader ids to add views, hearts or
// highlights. Add a Cloudflare rate limiting rule on /api/reactions if that
// ever happens.
import type { APIRoute } from 'astro';
import {
  type Highlight,
  MAX_HEARTS,
  MAX_TEXT,
  type Reactions,
} from '~/utils/reactions';

export const prerender = false;

const MAX_HIGHLIGHTS = 50; // per reader per page
const SLUG = /^\/[\w/-]{1,200}$/;
const HIGHLIGHTABLE = /^\/(blog|notes)\//;
const VISITOR = /^[0-9a-f-]{36}$/;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Hash both sides so the comparison time says nothing about the token.
const sha256 = async (text: string) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)),
    ),
  ].join();

async function isAdmin(token: unknown, secret: string | undefined) {
  if (typeof token !== 'string' || !token || !secret) return false;
  return (await sha256(token)) === (await sha256(secret));
}

async function state(
  db: D1Database,
  slug: string,
  visitor: string,
  admin: boolean,
) {
  const [views, hearts, highlights] = await db.batch([
    db.prepare('SELECT COUNT(*) AS n FROM views WHERE slug = ?').bind(slug),
    db
      .prepare(
        'SELECT COALESCE(SUM(n), 0) AS n, COALESCE(SUM(CASE WHEN visitor = ?2 THEN n END), 0) AS mine FROM hearts WHERE slug = ?1',
      )
      .bind(slug, visitor),
    db
      .prepare(
        'SELECT id, text, start, city, country, created_at AS createdAt, visitor = ?2 AS mine FROM highlights WHERE slug = ?1 ORDER BY start',
      )
      .bind(slug, visitor),
  ]);
  const count = views.results[0] as { n: number };
  const heart = hearts.results[0] as { n: number; mine: number };
  return {
    views: count.n,
    hearts: heart.n,
    myHearts: heart.mine,
    admin,
    highlights: (
      highlights.results as (Omit<Highlight, 'mine'> & { mine: number })[]
    ).map((h) => ({ ...h, mine: Boolean(h.mine) })),
  } satisfies Reactions;
}

export const POST: APIRoute = async ({ request, locals }) => {
  type Body = {
    slug?: unknown;
    visitor?: unknown;
    action?: unknown;
    text?: unknown;
    start?: unknown;
    id?: unknown;
    token?: unknown;
  };
  const body: Body = (await request.json().catch(() => null)) ?? {};
  const { slug, visitor, action } = body;
  if (typeof slug !== 'string' || !SLUG.test(slug)) {
    return json({ error: 'Invalid slug' }, 400);
  }
  if (typeof visitor !== 'string' || !VISITOR.test(visitor)) {
    return json({ error: 'Invalid visitor' }, 400);
  }

  const { REACTIONS_DB: db, REACTIONS_ADMIN_TOKEN } = locals.runtime.env;
  const admin = await isAdmin(body.token, REACTIONS_ADMIN_TOKEN);
  // Where the reader is, from Cloudflare: shown with highlights and on /stats.
  const { city, country } = locals.runtime.cf ?? {};

  if (action === 'view') {
    // Your own reads don't count.
    if (!admin)
      await db
        .prepare('INSERT OR IGNORE INTO views (slug, visitor) VALUES (?, ?)')
        .bind(slug, visitor)
        .run();
  } else if (action === 'heart') {
    await db
      .prepare(
        `INSERT INTO hearts (slug, visitor, city, country, updated_at)
         VALUES (?, ?, ?, ?, unixepoch())
         ON CONFLICT DO UPDATE SET n = n + 1, city = excluded.city,
           country = excluded.country, updated_at = excluded.updated_at
         WHERE n < ${MAX_HEARTS}`,
      )
      .bind(slug, visitor, city ?? null, country ?? null)
      .run();
  } else if (action === 'highlight') {
    const { text, start } = body;
    if (
      !HIGHLIGHTABLE.test(slug) ||
      typeof text !== 'string' ||
      !text.trim() ||
      text.length > MAX_TEXT ||
      typeof start !== 'number' ||
      !Number.isInteger(start) ||
      start < 0
    ) {
      return json({ error: 'Invalid highlight' }, 400);
    }
    await db
      .prepare(
        `INSERT INTO highlights (slug, visitor, text, start, city, country)
         SELECT ?1, ?2, ?3, ?4, ?5, ?6
         WHERE (SELECT COUNT(*) FROM highlights WHERE slug = ?1 AND visitor = ?2) < ${MAX_HIGHLIGHTS}
         ON CONFLICT DO NOTHING`,
      )
      .bind(slug, visitor, text, start, city ?? null, country ?? null)
      .run();
  } else if (action === 'delete') {
    // Readers can delete their own highlights, the admin anyone's.
    const { id } = body;
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      return json({ error: 'Invalid id' }, 400);
    }
    await db
      .prepare(
        'DELETE FROM highlights WHERE id = ?1 AND slug = ?2 AND (visitor = ?3 OR ?4)',
      )
      .bind(id, slug, visitor, admin ? 1 : 0)
      .run();
  } else if (action !== 'state') {
    return json({ error: 'Invalid action' }, 400);
  }

  return json(await state(db, slug, visitor, admin));
};
