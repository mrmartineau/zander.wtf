import { createStore, produce } from 'solid-js/store';
import { play } from './sound';

export type Win = {
  id: number;
  url: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  loading: boolean;
  /** The page's `<main>` once fetched or adopted. Not reactive (DOM node). */
  content: HTMLElement | null;
};

export type Recent = { url: string; title: string };

const RECENT_KEY = 'desktop:recent';
const RECENT_MAX = 8;
const CASCADE = 32;
const MENUBAR = 32;

const [state, setState] = createStore({
  wins: [] as Win[],
  z: 1,
  recent: readRecent(),
});

export { state };

function readRecent(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function nextZ() {
  setState('z', (z) => z + 1);
  return state.z;
}

export const isMobile = () => matchMedia('(max-width: 767px)').matches;

export const topWin = () =>
  state.wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0];

export const byUrl = (url: string) => state.wins.find((w) => w.url === url);

function defaultRect(n: number) {
  const vw = innerWidth;
  const vh = innerHeight - MENUBAR;
  const w = Math.min(960, vw - 48);
  const h = Math.min(Math.round(vh * 0.78), vh - 48);
  const step = (n % 8) * CASCADE;
  return {
    x: Math.max(16, Math.round((vw - w) / 2) + step),
    y: 16 + step,
    w,
    h,
  };
}

/** Open a window for `url`, or focus it if one already shows that URL. */
export function open(url: string, title = ''): Win {
  const existing = byUrl(url);
  if (existing) {
    focus(existing.id, true);
    return existing;
  }
  const id = Date.now() + Math.random();
  const win: Win = {
    id,
    url,
    title: title || url,
    ...defaultRect(state.wins.length),
    z: nextZ(),
    min: false,
    max: false,
    loading: true,
    content: null,
  };
  setState('wins', (w) => [...w, win]);
  play('open');
  return win;
}

export function setContent(id: number, title: string, content: HTMLElement) {
  setState('wins', (w) => w.id === id, { title, content, loading: false });
  remember({ url: byUrl_(id)?.url ?? '', title });
  syncTitle();
}

const byUrl_ = (id: number) => state.wins.find((w) => w.id === id);

export function close(id: number) {
  setState('wins', (w) => w.filter((x) => x.id !== id));
  play('close');
  syncTitle();
}

export function closeAll() {
  setState('wins', []);
  play('close');
}

export function focus(id: number, unminimise = false) {
  const z = nextZ();
  setState(
    'wins',
    (w) => w.id === id,
    produce((w) => {
      w.z = z;
      if (unminimise) w.min = false;
    }),
  );
  syncTitle();
}

export function minimise(id: number) {
  setState('wins', (w) => w.id === id, 'min', true);
  play('close');
  syncTitle();
}

export function toggleMax(id: number) {
  setState(
    'wins',
    (w) => w.id === id,
    'max',
    (m) => !m,
  );
  play('zoom');
}

export function move(id: number, x: number, y: number) {
  setState('wins', (w) => w.id === id, { x, y });
}

export function resize(id: number, w: number, h: number) {
  setState('wins', (w_) => w_.id === id, {
    w: Math.max(320, w),
    h: Math.max(200, h),
  });
}

/** Snap every open window into a grid. */
export function tile() {
  const open_ = state.wins.filter((w) => !w.min);
  const n = open_.length;
  if (!n) return;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const gap = 12;
  const vw = innerWidth;
  const vh = innerHeight - MENUBAR;
  const w = Math.floor((vw - gap * (cols + 1)) / cols);
  const h = Math.floor((vh - gap * (rows + 1)) / rows);
  open_.forEach((win, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    setState('wins', (x) => x.id === win.id, {
      x: gap + c * (w + gap),
      y: gap + r * (h + gap),
      w,
      h,
      max: false,
    });
  });
  play('zoom');
}

function remember(entry: Recent) {
  if (!entry.url) return;
  const list = [
    entry,
    ...state.recent.filter((r) => r.url !== entry.url),
  ].slice(0, RECENT_MAX);
  setState('recent', list);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

/** Keep the tab title and URL bar pointing at the front window. */
function syncTitle() {
  const top = topWin();
  const url = top?.url ?? '/';
  if (top?.title) document.title = `${top.title} | Zander Martineau`;
  if (location.pathname + location.search !== url) {
    history.pushState(null, '', url);
  }
}
