#!/usr/bin/env npx tsx
/**
 * Builds the site search index and pushes it to Cloudflare D1 (FTS5).
 *
 * Reads all content collections + standalone markdown pages, converts them
 * to plain text, emits a full-rebuild SQL file (DELETE + batched INSERTs)
 * and executes it against D1 via wrangler.
 *
 * Usage:
 *   pnpm search:index            # build + push to local D1 (dev)
 *   pnpm search:push             # build + push to remote D1 (CI/prod)
 *   npx tsx scripts/build-search-index.ts --dry-run  # write SQL only
 */

import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import matter from 'gray-matter';

const SITE = 'zander.wtf';
const DB_NAME = 'zander-wtf-search';
const OUT_FILE = 'search-index.sql';
const MAX_CONTENT_LENGTH = 8000;
// Keep each INSERT statement well under SQLite's max statement size
const MAX_STATEMENT_BYTES = 90_000;

type DocType = 'blog' | 'note' | 'project' | 'worklog' | 'page';

interface SearchDoc {
  title: string;
  description: string;
  content: string;
  tags: string[];
  url: string;
  type: DocType;
  date: string;
  emoji: string;
}

/**
 * Convert markdown/MDX to plain text. Keeps the text inside fenced code
 * blocks (code notes are mostly code — searching for code terms should work)
 * but strips fences, inline-code backticks, markdown syntax, HTML/JSX tags
 * and MDX import statements.
 */
export function markdownToPlainText(markdown: string): string {
  return (
    markdown
      // MDX import/export statements
      .replace(/^(import|export)\s.*$/gm, '')
      // code fence lines (keep the code itself)
      .replace(/^```.*$/gm, '')
      // inline code — keep the text
      .replace(/`([^`]*)`/g, '$1')
      // images
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      // links — keep text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // headings
      .replace(/^#+\s*/gm, '')
      // bold/italic
      .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, '$1')
      // blockquotes
      .replace(/^>\s?/gm, '')
      // horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // HTML/JSX tags
      .replace(/<[^>]*>/g, ' ')
      // collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Escape a value for inclusion in a single-quoted SQL string literal. */
export function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return '';
}

async function mdFilesIn(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'Templates') continue;
      files.push(...(await mdFilesIn(fullPath)));
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

interface ParsedFile {
  data: Record<string, unknown>;
  body: string;
  slug: string;
}

async function parseFile(filePath: string): Promise<ParsedFile> {
  const raw = await readFile(filePath, 'utf-8');
  const { data, content } = matter(raw);
  // Same slug resolution as Astro: frontmatter `slug` wins, else the
  // file/directory name. Blog posts live in <dir>/index.md → use <dir>.
  const base = basename(filePath).replace(/\.mdx?$/, '');
  const fallback = base === 'index' ? basename(join(filePath, '..')) : base;
  const slug = typeof data.slug === 'string' ? data.slug : fallback;
  return { data, body: content, slug };
}

function toDoc(parsed: ParsedFile, type: DocType, url: string): SearchDoc {
  const { data, body } = parsed;
  return {
    title: String(data.title ?? ''),
    description: String(data.subtitle ?? ''),
    content: markdownToPlainText(body).slice(0, MAX_CONTENT_LENGTH),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    url,
    type,
    date: toDateString(data.date ?? data.modified),
    emoji: typeof data.emoji === 'string' ? data.emoji : '',
  };
}

async function gatherDocs(): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];

  for (const file of await mdFilesIn('src/content/blog')) {
    const parsed = await parseFile(file);
    docs.push(toDoc(parsed, 'blog', `/blog/${parsed.slug}`));
  }

  for (const file of await mdFilesIn('src/content/codenotes')) {
    const parsed = await parseFile(file);
    docs.push(toDoc(parsed, 'note', `/notes/${parsed.slug}`));
  }

  for (const file of await mdFilesIn('src/content/projects')) {
    const parsed = await parseFile(file);
    docs.push(toDoc(parsed, 'project', `/projects/${parsed.slug}`));
  }

  // Worklog entries all render on the single /worklog page
  for (const file of await mdFilesIn('src/content/worklog')) {
    const parsed = await parseFile(file);
    docs.push(toDoc(parsed, 'worklog', '/worklog'));
  }

  // Standalone markdown pages
  for (const page of ['about.mdx', 'colophon.md', 'uses.md', 'feeds.md']) {
    const parsed = await parseFile(join('src/pages', page));
    docs.push(toDoc(parsed, 'page', `/${parsed.slug}`));
  }

  return docs.filter((doc) => doc.title);
}

function toSql(docs: SearchDoc[]): string {
  const insertPrefix =
    'INSERT INTO search_index (title, description, content, tags, url, site, type, date, emoji) VALUES\n';
  const statements = ['DELETE FROM search_index;'];

  let rows: string[] = [];
  let batchBytes = 0;
  const flush = () => {
    if (rows.length === 0) return;
    statements.push(`${insertPrefix}${rows.join(',\n')};`);
    rows = [];
    batchBytes = 0;
  };

  for (const doc of docs) {
    const values = [
      doc.title,
      doc.description,
      doc.content,
      doc.tags.join(' '),
      doc.url,
      SITE,
      doc.type,
      doc.date,
      doc.emoji,
    ].map((value) => `'${sqlEscape(value)}'`);
    const row = `(${values.join(', ')})`;
    const rowBytes = Buffer.byteLength(row, 'utf-8');
    if (batchBytes + rowBytes > MAX_STATEMENT_BYTES) flush();
    rows.push(row);
    batchBytes += rowBytes;
  }
  flush();

  return `${statements.join('\n')}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const target = args.includes('--target=remote') ? 'remote' : 'local';
  const dryRun = args.includes('--dry-run');

  const docs = await gatherDocs();
  const counts = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Indexing ${docs.length} documents:`, counts);

  await writeFile(OUT_FILE, toSql(docs));
  console.log(`Wrote ${OUT_FILE}`);

  if (dryRun) return;

  execFileSync(
    'npx',
    [
      'wrangler',
      'd1',
      'execute',
      DB_NAME,
      `--${target}`,
      `--file=${OUT_FILE}`,
      '-y',
    ],
    { stdio: 'inherit' },
  );
  console.log(`Pushed index to ${target} D1 (${DB_NAME})`);
}

const isDirectRun = process.argv[1]?.includes('build-search-index');
if (isDirectRun) {
  main();
}
