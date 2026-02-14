/**
 * ASCII text utilities
 *
 * Pure string manipulation helpers for working with text that may contain
 * inline HTML tags (like <a> and <span>). These are used to calculate
 * "visible length" — the number of characters a user actually sees — so
 * that padding and truncation work correctly even when HTML is embedded.
 */

/** Strip all HTML tags from a string, returning only visible text */
export function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

/** Return the visible length of a string (ignoring HTML tags) */
export function visLen(s: string): number {
  return stripTags(s).length;
}

/**
 * Truncate a plain-text string to a maximum visible length.
 * Adds an ellipsis (…) if truncated.
 */
export function trunc(s: string, max: number): string {
  if (max <= 0) return '';
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/**
 * Pad an HTML-aware string to exactly `width` visible characters.
 * Appends spaces so the visible length (ignoring tags) reaches `width`.
 * If the string is already at or beyond `width`, returns it as-is.
 */
export function pad(s: string, width: number): string {
  const vl = visLen(s);
  if (vl >= width) return s;
  return s + ' '.repeat(width - vl);
}

/**
 * Pad a string on the left to reach `width` visible characters.
 */
export function padLeft(s: string, width: number): string {
  const vl = visLen(s);
  if (vl >= width) return s;
  return ' '.repeat(width - vl) + s;
}

/**
 * Center a string within `width` visible characters.
 * Extra space (if odd) goes on the right.
 */
export function center(s: string, width: number): string {
  const vl = visLen(s);
  if (vl >= width) return s;
  const total = width - vl;
  const left = Math.floor(total / 2);
  const right = total - left;
  return ' '.repeat(left) + s + ' '.repeat(right);
}

/**
 * Repeat a character `n` times. Convenience wrapper.
 */
export function repeat(char: string, n: number): string {
  return n > 0 ? char.repeat(n) : '';
}

