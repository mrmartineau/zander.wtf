/**
 * ASCII HTML helpers
 *
 * Tiny functions that generate inline HTML strings for use inside <pre> blocks.
 * Since the ASCII page renders everything inside a <pre set:html={...}>,
 * we need to build anchor and span tags as raw strings.
 */

/**
 * Wrap text in a <span> with one or more CSS classes.
 *
 * @example
 *   span('dim', 'hello')        // <span class="dim">hello</span>
 *   span('dim tech', 'hello')   // <span class="dim tech">hello</span>
 */
export function span(cls: string, text: string): string {
  return `<span class="${cls}">${text}</span>`;
}

/**
 * Create an <a> tag.
 *
 * @param href    - Link target
 * @param text    - Visible text (may contain other HTML like spans)
 * @param cls     - Optional CSS class(es)
 * @param dataKey - Optional data-key attribute for keyboard shortcuts
 *
 * @example
 *   link('/blog', 'Blog')
 *   link('/blog', '[1] Post title', '', '1')
 *   link('/', '● HOME', 'nav-link active')
 */
export function link(
  href: string,
  text: string,
  cls = '',
  dataKey = '',
): string {
  const classes = cls ? ` class="${cls}"` : '';
  const dk = dataKey ? ` data-key="${dataKey}"` : '';
  return `<a href="${href}"${classes}${dk}>${text}</a>`;
}

/**
 * Shorthand: wrap text in an accent-colored span.
 */
export function accent(text: string): string {
  return span('accent', text);
}

/**
 * Shorthand: wrap text in a dim span.
 */
export function dim(text: string): string {
  return span('dim', text);
}

/**
 * Shorthand: wrap text in a bright span.
 */
export function bright(text: string): string {
  return span('bright', text);
}

/**
 * Shorthand: wrap a keyboard shortcut key in the shortcut style.
 */
export function shortcut(key: string): string {
  return span('shortcut', key);
}

