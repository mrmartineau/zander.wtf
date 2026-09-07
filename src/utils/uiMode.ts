// Three front ends share the same pages: the desktop shell, the terminal UI
// and the classic site. The choice lives in localStorage; an inline script in
// BaseLayout reads it before first paint and sets `html.desktop|tui|classic`.
export const UI_MODE_KEY = 'zm:ui';

export const UI_MODES = ['desktop', 'tui', 'classic'] as const;
export type UiMode = (typeof UI_MODES)[number];

export const UI_MODE_LABELS: Record<UiMode, string> = {
  desktop: 'Desktop',
  tui: 'Terminal',
  classic: 'Classic site',
};

export function setUiMode(mode: UiMode) {
  localStorage.setItem(UI_MODE_KEY, mode);
  location.reload();
}

export const uiMode = (): UiMode =>
  UI_MODES.find((m) => document.documentElement.classList.contains(m)) ??
  'desktop';

export const isDesktop = () => uiMode() === 'desktop';
