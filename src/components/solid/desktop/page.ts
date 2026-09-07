// Loads a page of this site and hands back its `<main>`, plus the stylesheets
// and scripts it needs. Pages stay ordinary Astro pages; the desktop only
// borrows their content.

const seen = new Set<string>();

function headKey(el: Element) {
  return (
    el.getAttribute('href') ?? el.getAttribute('src') ?? el.textContent ?? ''
  );
}

// The first page's assets are already in the document.
export function seedHead() {
  for (const el of document.head.querySelectorAll(
    'link[rel=stylesheet], style, script[src]',
  )) {
    seen.add(headKey(el));
  }
}

export type Page = {
  title: string;
  main: HTMLElement;
  scripts: HTMLScriptElement[];
};

export const cleanTitle = (title: string) =>
  title.replace(/ \| Zander Martineau$/, '');

export async function fetchPage(url: string): Promise<Page> {
  const res = await fetch(url, { headers: { Accept: 'text/html' } });
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');

  for (const el of doc.head.querySelectorAll('link[rel=stylesheet], style')) {
    const key = headKey(el);
    if (seen.has(key)) continue;
    seen.add(key);
    document.head.appendChild(document.adoptNode(el));
  }

  // Page scripts (hoisted Astro modules) run once the content is in the DOM.
  // ponytail: a module already run for one page will not re-run for another
  // page that shares the same bundle; fine for this site's small scripts.
  const scripts: HTMLScriptElement[] = [];
  for (const el of doc.head.querySelectorAll<HTMLScriptElement>(
    'script[src]',
  )) {
    const key = headKey(el);
    if (seen.has(key)) continue;
    seen.add(key);
    const s = document.createElement('script');
    s.type = el.type || 'module';
    s.src = el.src;
    scripts.push(s);
  }

  const main =
    doc.querySelector<HTMLElement>('main#page') ?? (doc.body as HTMLElement);
  return {
    title: res.ok ? cleanTitle(doc.title) : `${res.status} — ${url}`,
    main: adopt(main),
    scripts,
  };
}

/** Take a `<main id="page">` out of a document so it can live in a window. */
export function adopt(main: HTMLElement) {
  main.removeAttribute('id');
  main.classList.add('page');
  return document.adoptNode(main);
}

/** Is this a link the desktop should open in a window? */
export function isPageLink(a: HTMLAnchorElement) {
  if (a.target === '_blank' || a.hasAttribute('download')) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (url.pathname.startsWith('/api/')) return false;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return false; // feeds, files
  return true;
}

export type Part = {
  url: string;
  title: string;
  node: HTMLElement;
  size: 'block' | 'wide';
};

/**
 * Pages made of `[data-window]` sections (the home page) open as one window
 * per section. A `#hash` in the URL picks a single section.
 */
export function split(main: HTMLElement, url: string): Part[] | null {
  const sections = [...main.querySelectorAll<HTMLElement>('[data-window]')];
  if (!sections.length) return null;
  const path = url.split('#')[0];
  const hash = url.split('#')[1];
  return sections
    .filter((s) => !hash || s.id === hash)
    .map((s) => ({
      url: `${path}#${s.id}`,
      title: s.dataset.window ?? s.id,
      node: s,
      size: s.dataset.size === 'wide' ? 'wide' : 'block',
    }));
}
