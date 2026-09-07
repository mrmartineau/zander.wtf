// Two front ends share the same pages: the desktop shell and the classic
// site. The choice lives in localStorage; an inline script in BaseLayout reads
// it before first paint and sets `html.desktop`.
export const UI_MODE_KEY = 'zm:ui';

export type UiMode = 'desktop' | 'classic';

export function setUiMode(mode: UiMode) {
  localStorage.setItem(UI_MODE_KEY, mode);
  location.reload();
}

export const isDesktop = () =>
  document.documentElement.classList.contains('desktop');
