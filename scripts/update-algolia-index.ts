#!/usr/bin/env npx tsx
/**
 * Script to update Algolia search index with codenotes content.
 *
 * Required environment variables:
 * - ALGOLIA_APP: Your Algolia application ID
 * - ALGOLIA_ADMIN_KEY: Your Algolia admin API key (not the search key!)
 * - ALGOLIA_INDEX: The name of your Algolia index
 *
 * Usage: pnpm algolia:update
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { algoliasearch } from 'algoliasearch';

const CODENOTES_DIR = './src/content/codenotes';

interface NoteFrontmatter {
  title: string;
  tags?: string[];
  date?: string;
  emoji?: string;
  link?: string;
}

interface AlgoliaRecord {
  objectID: string;
  title: string;
  slug: string;
  content: string;
  tags?: string[];
  date?: string;
  emoji?: string;
  link?: string;
}

function parseFrontmatter(content: string): {
  frontmatter: NoteFrontmatter;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid frontmatter');
  }

  const [, frontmatterStr, body] = match;
  const frontmatter: NoteFrontmatter = { title: '' };

  // Simple YAML parsing for our specific frontmatter format
  const lines = frontmatterStr.split('\n');
  let currentKey = '';
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of lines) {
    if (line.startsWith('  - ') && inArray) {
      // Array item
      arrayValues.push(line.replace('  - ', '').trim());
    } else if (line.includes(':')) {
      // Save previous array if any
      if (inArray && currentKey) {
        (frontmatter as Record<string, unknown>)[currentKey] =
          arrayValues.slice();
        arrayValues.length = 0;
      }

      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      currentKey = key;

      if (value === '') {
        // Could be start of array
        inArray = true;
      } else {
        inArray = false;
        (frontmatter as Record<string, unknown>)[key] = value;
      }
    }
  }

  // Handle last array
  if (inArray && currentKey && arrayValues.length > 0) {
    (frontmatter as Record<string, unknown>)[currentKey] = arrayValues;
  }

  return { frontmatter, body: body.trim() };
}

function stripMarkdown(content: string): string {
  return (
    content
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]*`/g, '')
      // Remove links but keep text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      // Remove headers
      .replace(/^#+\s*/gm, '')
      // Remove bold/italic
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

async function processFile(
  filePath: string,
  fileName: string,
): Promise<AlgoliaRecord | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    const slug = fileName.replace(/\.md$/, '');

    // Strip markdown and limit content length for Algolia
    const strippedContent = stripMarkdown(body);
    const truncatedContent = strippedContent.substring(0, 5000);

    return {
      objectID: slug,
      title: frontmatter.title,
      slug,
      content: truncatedContent,
      tags: frontmatter.tags,
      date: frontmatter.date,
      emoji: frontmatter.emoji,
      link: frontmatter.link,
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

async function processDirectory(dir: string): Promise<AlgoliaRecord[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const records: AlgoliaRecord[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip the Templates directory
      if (entry.name === 'Templates') continue;
      const subRecords = await processDirectory(fullPath);
      records.push(...subRecords);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const record = await processFile(fullPath, entry.name);
      if (record) {
        records.push(record);
      }
    }
  }

  return records;
}

async function main() {
  const appId = process.env.ALGOLIA_APP;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const indexName = process.env.ALGOLIA_INDEX;

  if (!appId || !adminKey || !indexName) {
    console.error('Missing required environment variables:');
    console.error('ALGOLIA_APP, ALGOLIA_ADMIN_KEY, ALGOLIA_INDEX');
    console.error('\nPlease set these in your .env file or environment.');
    process.exit(1);
  }

  console.log('Processing codenotes...\n');

  const records = await processDirectory(CODENOTES_DIR);
  console.log(`Found ${records.length} notes to index.\n`);

  if (records.length === 0) {
    console.log('No records to index. Exiting.');
    return;
  }

  console.log('Updating Algolia index...');

  try {
    const client = algoliasearch(appId, adminKey);

    // Clear the index and replace with new records
    const response = await client.replaceAllObjects({
      indexName,
      objects: records,
    });

    console.log(`\nSuccessfully indexed ${records.length} notes!`);
    console.log(
      'Object IDs:',
      response.objectIDs?.slice(0, 5).join(', ') ?? 'No object IDs',
      '...',
    );
  } catch (error) {
    console.error('Error updating Algolia index:', error);
    process.exit(1);
  }
}

main();
