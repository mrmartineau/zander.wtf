// Three front ends share the same pages. The URL picks the one you get:
//   /cv          the website (classic)
//   /desktop/cv  the desktop shell
//   /tui/cv      the terminal UI
// The host rewrites /desktop/* and /tui/* to the same HTML (public/_redirects;
// src/middleware.ts does it in dev). An inline script in BaseLayout reads the
// prefix before first paint and sets `html.desktop|tui|classic`.
export const UI_MODES = ['desktop', 'tui', 'classic'] as const;
export type UiMode = (typeof UI_MODES)[number];

export const UI_MODE_LABELS: Record<UiMode, string> = {
  desktop: 'Desktop',
  tui: 'Terminal',
  classic: 'Website',
};

export const UI_PREFIX: Record<UiMode, string> = {
  desktop: '/desktop',
  tui: '/tui',
  classic: '',
};

const PREFIX_RE = /^\/(desktop|tui)(?=\/|$)/;

/** Mode named by a path: `/tui/cv` → `tui`, `/cv` → `classic`. */
export const modeFromPath = (path: string): UiMode =>
  (path.match(PREFIX_RE)?.[1] as UiMode | undefined) ?? 'classic';

/** `/desktop/cv?x#y` → `/cv?x#y` */
export const stripPrefix = (url: string) => url.replace(PREFIX_RE, '') || '/';

/** `/cv` in `desktop` → `/desktop/cv` */
export const modeUrl = (mode: UiMode, url: string) =>
  `${UI_PREFIX[mode]}${stripPrefix(url)}`;

/**
 * Under /desktop and /tui the host rewrites to static pages only; for anything
 * else (the server-rendered search, a missing page) it falls back to the home
 * page. The canonical link says which page was really served.
 */
export function servedPageMatches(url: string) {
  const href = document.querySelector<HTMLLinkElement>(
    'link[rel=canonical]',
  )?.href;
  if (!href) return true;
  const trim = (p: string) => p.replace(/\/$/, '') || '/';
  return trim(new URL(href).pathname) === trim(url.split(/[?#]/)[0]);
}

export const uiMode = (): UiMode =>
  UI_MODES.find((m) => document.documentElement.classList.contains(m)) ??
  'classic';

export const isDesktop = () => uiMode() === 'desktop';

/** Same page, other front end. */
export function setUiMode(
  mode: UiMode,
  url = location.pathname + location.search + location.hash,
) {
  location.assign(modeUrl(mode, url));
}
