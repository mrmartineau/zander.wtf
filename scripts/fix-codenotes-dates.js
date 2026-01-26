#!/usr/bin/env node
/**
 * Script to fix codenotes frontmatter dates.
 * Replaces "date: git Last Modified" with actual file modification dates.
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CODENOTES_DIR = './src/content/codenotes';

async function processFile(filePath) {
  const content = await readFile(filePath, 'utf-8');

  if (!content.includes('date: git Last Modified')) {
    return false;
  }

  // Get file modification date
  const stats = await stat(filePath);
  const modDate = stats.mtime;
  const dateStr = modDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Replace the date line
  const newContent = content.replace(
    /date: git Last Modified/g,
    `date: ${dateStr}`,
  );

  await writeFile(filePath, newContent, 'utf-8');
  return true;
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      count += await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const updated = await processFile(fullPath);
      if (updated) {
        console.log(`Updated: ${fullPath}`);
        count++;
      }
    }
  }

  return count;
}

async function main() {
  console.log('Fixing codenotes frontmatter dates...\n');

  try {
    const count = await processDirectory(CODENOTES_DIR);
    console.log(`\nDone! Updated ${count} files.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
