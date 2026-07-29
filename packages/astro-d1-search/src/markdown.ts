/**
 * Convert markdown/MDX to plain text. Keeps the text inside fenced code
 * blocks (so code content is searchable) but strips fences, inline-code
 * backticks, markdown syntax, HTML/JSX tags and MDX import statements.
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
