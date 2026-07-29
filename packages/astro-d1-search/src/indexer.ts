import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import matter from '@11ty/gray-matter'
import { type D1SearchOptions, resolveConfig } from './config';
import { markdownToPlainText, sqlEscape } from './markdown';

// Keep each INSERT statement well under SQLite's max statement size
const MAX_STATEMENT_BYTES = 90_000;

/**
 * The FTS5 schema. The indexer prepends this to every push, so the table is
 * created on first run with no separate migration step. UNINDEXED columns
 * are stored but not searchable.
 */
export const SCHEMA_SQL = `CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
  title,
  description,
  content,
  tags,
  url UNINDEXED,
  site UNINDEXED,
  type UNINDEXED,
  date UNINDEXED,
  emoji UNINDEXED,
  tokenize = 'porter unicode61'
);`;

type SearchDoc = {
  title: string;
  description: string;
  content: string;
  tags: string[];
  url: string;
  type: string;
  date: string;
  emoji: string;
};

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return '';
}

async function mdFilesIn(dir: string, skipDirs: string[]): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.includes(entry.name)) continue;
      files.push(...(await mdFilesIn(fullPath, skipDirs)));
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function parseFile(filePath: string) {
  const raw = await readFile(filePath, 'utf-8');
  const { data, content } = matter(raw);
  // Same slug resolution as Astro: frontmatter `slug` wins, else the
  // file/directory name. Posts living in <dir>/index.md use <dir>.
  const base = basename(filePath).replace(/\.mdx?$/, '');
  const fallback = base === 'index' ? basename(join(filePath, '..')) : base;
  const slug = typeof data.slug === 'string' ? data.slug : fallback;
  return { data: data as Record<string, unknown>, body: content, slug };
}

export async function gatherDocs(
  options: D1SearchOptions,
): Promise<SearchDoc[]> {
  const config = resolveConfig(options);
  const docs: SearchDoc[] = [];

  for (const source of config.sources) {
    const files = source.dir
      ? await mdFilesIn(source.dir, source.skipDirs)
      : source.files;

    for (const file of files) {
      const { data, body, slug } = await parseFile(file);
      docs.push({
        title: String(data.title ?? ''),
        description: String(data.subtitle ?? data.description ?? ''),
        content: markdownToPlainText(body).slice(0, config.maxContentLength),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        url: source.url.replace(':slug', slug),
        type: source.type,
        date: toDateString(data.date ?? data.modified),
        emoji: typeof data.emoji === 'string' ? data.emoji : '',
      });
    }
  }

  return docs.filter((doc) => doc.title);
}

export function toSql(docs: SearchDoc[], site: string): string {
  const insertPrefix =
    'INSERT INTO search_index (title, description, content, tags, url, site, type, date, emoji) VALUES\n';
  // Scoped delete when a site id is set, so several sites can share the table
  const deleteSql = site
    ? `DELETE FROM search_index WHERE site = '${sqlEscape(site)}';`
    : 'DELETE FROM search_index;';
  const statements = [SCHEMA_SQL, deleteSql];

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
      site,
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

export type BuildIndexOptions = {
  target?: 'local' | 'remote';
  /** Write the SQL file but skip the wrangler push. */
  dryRun?: boolean;
  /** Path of the generated SQL file. Default: 'search-index.sql'. */
  outFile?: string;
};

/** Gather documents, emit SQL and push it to D1 via wrangler. */
export async function buildIndex(
  options: D1SearchOptions,
  {
    target = 'local',
    dryRun = false,
    outFile = 'search-index.sql',
  }: BuildIndexOptions = {},
): Promise<{ count: number; counts: Record<string, number> }> {
  const config = resolveConfig(options);
  const docs = await gatherDocs(options);

  const counts = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`[astro-d1-search] indexing ${docs.length} documents:`, counts);

  await writeFile(outFile, toSql(docs, config.site));

  if (!dryRun) {
    execFileSync(
      'npx',
      [
        'wrangler',
        'd1',
        'execute',
        config.database,
        `--${target}`,
        `--file=${outFile}`,
        '-y',
      ],
      { stdio: 'inherit' },
    );
    console.log(
      `[astro-d1-search] pushed index to ${target} D1 (${config.database})`,
    );
  }

  return { count: docs.length, counts };
}

/** CLI entry: reads --target=remote / --dry-run from argv. */
export async function runCli(
  options: D1SearchOptions,
  argv = process.argv.slice(2),
) {
  await buildIndex(options, {
    target: argv.includes('--target=remote') ? 'remote' : 'local',
    dryRun: argv.includes('--dry-run'),
  });
}
