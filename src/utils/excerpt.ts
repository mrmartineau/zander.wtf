/**
 * Meta description fallback for entries that carry no subtitle of their own —
 * code notes have no description field at all, and a few old posts never got
 * one. Takes the opening prose of the body and strips the Markdown.
 */
export const excerpt = (body: string, max = 155): string => {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/<[^>]+>/g, ' ') // inline HTML and MDX tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → their text
    .replace(/^\s*(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // heading, quote, list markers
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= max) {
    return text;
  }

  // Cut on a word boundary so the snippet doesn't end mid-word. A body with no
  // space inside the limit falls back to a hard cut.
  const boundary = text.lastIndexOf(' ', max);
  return `${text.slice(0, boundary > 0 ? boundary : max)}…`;
};
