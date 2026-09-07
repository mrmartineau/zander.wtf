import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  modeUrl,
  servedPageMatches,
  setUiMode,
  stripPrefix,
  UI_MODE_LABELS,
  UI_MODES,
  type UiMode,
  uiMode,
} from '~/utils/uiMode';
import type { NavItem } from '../desktop/MenuBar';
import {
  adopt,
  cleanTitle,
  fetchPage,
  isPageLink,
  seedHead,
} from '../desktop/page';

// A whiptail / raspi-config style text UI over the same pages the desktop
// uses: ↑/↓ move the highlight, Tab hops to the buttons, ←/→ move between
// them, Enter chooses, Esc goes back. Taps work too.

type Row = {
  label: string;
  hint?: string;
  sub?: boolean;
  url?: string;
  action?: () => void;
};

type Screen = {
  kind: 'menu' | 'page' | 'search';
  title: string;
  blurb?: string;
  url?: string;
  rows: Row[];
  node?: HTMLElement;
  buttons: string[];
};

const TITLE = 'zander.wtf · text mode';

export default function Tui(props: { nav: NavItem[]; more: NavItem[] }) {
  if (uiMode() !== 'tui') return null;

  const [stack, setStack] = createStore<Screen[]>([]);
  const [row, setRow] = createSignal(0);
  const [btn, setBtn] = createSignal(0);
  const [zone, setZone] = createSignal<'list' | 'buttons'>('list');
  const [note, setNote] = createSignal('');
  const [query, setQuery] = createSignal('');
  let crt!: HTMLDivElement;
  let body!: HTMLDivElement;
  let searchInput: HTMLInputElement | undefined;
  let searchTimer: number | undefined;

  const current = () => stack[stack.length - 1];

  // Links inside a page screen are the rows you move through.
  const links = (): HTMLAnchorElement[] =>
    current()?.kind === 'page'
      ? [...body.querySelectorAll<HTMLAnchorElement>('a[href]')].filter(
          (a) => a.offsetParent !== null,
        )
      : [];

  const here = () =>
    stripPrefix(location.pathname + location.search + location.hash);
  const visit = (url: string) => {
    if (here() !== url) history.pushState(null, '', modeUrl('tui', url));
  };

  // Start on the first link in the content, not in a sidebar or nav.
  const firstContentLink = () =>
    Math.max(
      0,
      links().findIndex((a) => !a.closest('aside, [class*="sidebar"]')),
    );

  const rowCount = () =>
    current()?.kind === 'page' ? links().length : (current()?.rows.length ?? 0);

  const pageRow = (url: string, text: string, sub = true): Row => ({
    label: text,
    url,
    sub,
  });

  const switchScreen = (): Screen => ({
    kind: 'menu',
    title: TITLE,
    blurb: 'Choose how to view this site',
    rows: UI_MODES.map((m) => ({
      label: `${m === uiMode() ? '(•)' : '( )'} ${UI_MODE_LABELS[m]}`,
      hint:
        m === 'desktop'
          ? 'Windows, menu bar, Spotlight'
          : m === 'tui'
            ? 'This one'
            : 'The ordinary website',
      action: () =>
        m !== uiMode() && setUiMode(m as UiMode, current().url ?? '/'),
    })),
    buttons: ['Select', 'Back'],
  });

  const searchScreen = (): Screen => ({
    kind: 'search',
    title: TITLE,
    blurb: 'Search blog posts, code notes, projects and more',
    rows: [],
    buttons: ['Open', 'Back'],
  });

  const MAIN: Screen = {
    kind: 'menu',
    title: TITLE,
    blurb: 'Main Menu',
    rows: [
      pageRow('/#about', '1 About me'),
      ...props.nav.map((n, i) => pageRow(n.url, `${i + 2} ${n.text}`)),
      pageRow('/notes', `${props.nav.length + 2} Code Notes`),
      pageRow('/now', `${props.nav.length + 3} Now`),
      {
        label: `${props.nav.length + 4} Search`,
        hint: 'Find anything on the site',
        sub: true,
        action: () => go(searchScreen()),
      },
      {
        label: `${props.nav.length + 5} More`,
        hint: 'CV, colophon, feeds, elsewhere',
        sub: true,
        action: () =>
          go({
            kind: 'menu',
            title: TITLE,
            blurb: 'More',
            rows: props.more.map((n) =>
              n.external
                ? {
                    label: n.text,
                    hint: 'opens in a new tab',
                    action: () => window.open(n.url, '_blank', 'noopener'),
                  }
                : pageRow(n.url, n.text),
            ),
            buttons: ['Select', 'Back'],
          }),
      },
      {
        label: `${props.nav.length + 6} Display`,
        hint: 'Switch to the desktop or the classic site',
        sub: true,
        action: () => go(switchScreen()),
      },
    ],
    buttons: ['Select', 'Finish'],
  };

  const go = (s: Screen) => {
    setStack(stack.length, s);
    setZone(s.kind === 'page' && !s.rows.length ? 'buttons' : 'list');
    setRow(0);
    setBtn(0);
    setNote('');
    if (s.url) {
      document.title = `${s.title} | Zander Martineau`;
      visit(s.url);
    }
    crt.scrollTop = 0;
  };

  const back = () => {
    if (stack.length > 1) setStack((s) => s.slice(0, -1));
    setZone('list');
    setRow(0);
    setBtn(0);
    setNote('');
    visit(current().url ?? '/');
  };

  const home = () => {
    setStack([MAIN]);
    setZone('list');
    setRow(0);
    setBtn(0);
    visit('/');
    document.title = 'Zander Martineau';
  };

  /** Fetch a page and push it as a screen. `/#about` gives just that block. */
  const openUrl = async (url: string, label = url) => {
    setNote(`Loading ${label}…`);
    try {
      const page = await fetchPage(url);
      const hash = url.split('#')[1];
      const section = hash
        ? page.main.querySelector<HTMLElement>(`[data-window]#${hash}`)
        : null;
      const node = section ?? page.main;
      go({
        kind: 'page',
        title: section?.dataset.window ?? page.title,
        url,
        rows: [],
        node,
        buttons: ['Open', 'Back', 'Main menu'],
      });
      for (const s of page.scripts) document.head.appendChild(s);
      // Land on the first content link if there is one.
      queueMicrotask(() => {
        setRow(firstContentLink());
        setZone(links().length ? 'list' : 'buttons');
      });
    } catch {
      setNote(`Could not load ${label}.`);
    }
  };

  const activateRow = () => {
    const s = current();
    if (s.kind === 'page') {
      const a = links()[row()];
      if (!a) return;
      const u = new URL(a.href);
      // Relative links resolve under /tui/…; the page URLs never carry it.
      const path = stripPrefix(u.pathname + u.search);
      // Same-page anchor (the filters on /projects): scroll there and move the
      // highlight to the first link in that section.
      if (u.hash && path === (s.url ?? '').split('#')[0]) {
        const target = body.querySelector(u.hash);
        if (target) {
          target.scrollIntoView({ block: 'start' });
          const i = links().findIndex(
            (l) =>
              target.contains(l) ||
              target.compareDocumentPosition(l) &
                Node.DOCUMENT_POSITION_FOLLOWING,
          );
          if (i >= 0) setRow(i);
        }
        return;
      }
      if (isPageLink(a))
        openUrl(path + u.hash, a.textContent?.trim() || a.href);
      else window.open(a.href, '_blank', 'noopener');
      return;
    }
    const r = s.rows[row()];
    if (!r) return;
    if (r.action) r.action();
    else if (r.url) openUrl(r.url, r.label);
  };

  const activate = () => {
    const s = current();
    const label = zone() === 'buttons' ? s.buttons[btn()] : s.buttons[0];
    if (label === 'Back') return back();
    if (label === 'Main menu') return home();
    if (label === 'Finish') return go(switchScreen());
    activateRow();
  };

  const scrollToRow = () => {
    const el =
      current().kind === 'page'
        ? links()[row()]
        : crt.querySelectorAll<HTMLElement>('.tui-row')[row()];
    el?.scrollIntoView({ block: 'nearest' });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const s = current();
    if (!s) return;
    const n = rowCount();
    const typing = e.target === searchInput;
    switch (e.key) {
      case 'ArrowDown':
        if (n) setRow((r) => (r + 1) % n);
        setZone('list');
        scrollToRow();
        break;
      case 'ArrowUp':
        if (n) setRow((r) => (r - 1 + n) % n);
        setZone('list');
        scrollToRow();
        break;
      case 'Tab':
        setZone((z) =>
          z === 'list' && n ? 'buttons' : n ? 'list' : 'buttons',
        );
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (typing && zone() === 'list') return;
        setZone('buttons');
        setBtn(
          (b) =>
            (b + (e.key === 'ArrowRight' ? 1 : -1) + s.buttons.length) %
            s.buttons.length,
        );
        break;
      case 'Enter':
        activate();
        break;
      case 'Escape':
        if (stack.length > 1) back();
        break;
      case 'PageDown':
      case ' ':
        if (typing) return;
        crt.scrollBy({ top: crt.clientHeight * 0.8 * (e.shiftKey ? -1 : 1) });
        break;
      case 'PageUp':
        crt.scrollBy({ top: -crt.clientHeight * 0.8 });
        break;
      case 'Home':
        if (typing) return;
        home();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  // Taps: rows, links and buttons are real elements, so a click just picks
  // that thing and activates it.
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element;
    const a = t.closest('a[href]');
    if (a && body?.contains(a)) {
      e.preventDefault();
      const i = links().indexOf(a as HTMLAnchorElement);
      if (i >= 0) {
        setRow(i);
        setZone('list');
        activateRow();
      }
    }
  };

  // Keep the highlighted link marked inside page content.
  createEffect(() => {
    const s = current();
    const i = row();
    const z = zone();
    if (s?.kind !== 'page') return;
    for (const [k, a] of links().entries()) {
      a.classList.toggle('is-sel', z === 'list' && k === i);
    }
  });

  createEffect(() => {
    const s = current();
    if (s?.kind === 'page' && s.node && s.node.parentElement !== body) {
      body.replaceChildren(s.node);
    }
  });

  createEffect(() => {
    if (current()?.kind === 'search')
      queueMicrotask(() => searchInput?.focus());
  });

  // Search as you type, like Spotlight.
  createEffect(() => {
    const q = query().trim();
    const s = current();
    if (s?.kind !== 'search') return;
    clearTimeout(searchTimer);
    if (q.length < 2) return setStack(stack.length - 1, 'rows', []);
    searchTimer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&limit=12`,
        );
        const data = (await res.json()) as {
          results?: {
            title: string;
            url: string;
            type: string;
            emoji?: string;
          }[];
        };
        setStack(
          stack.length - 1,
          'rows',
          (data.results ?? []).map((r) => ({
            label: `${r.emoji ? `${r.emoji} ` : ''}${r.title}`,
            hint: r.type,
            url: new URL(r.url).pathname,
          })),
        );
        setRow(0);
        setZone('list');
      } catch {
        setNote('Search is unavailable.');
      }
    }, 150);
  });

  const onPop = () => {
    const url = here();
    if (url === '/') home();
    else openUrl(url);
  };

  onMount(() => {
    seedHead();
    setStack([MAIN]);
    const page = document.getElementById('page');
    const url = here();
    if (page && url !== '/' && !servedPageMatches(url)) {
      // The host handed us the home page for this URL; fetch the real one.
      page.remove();
      openUrl(url);
    } else if (page && url !== '/') {
      const main = adopt(page);
      const hash = url.split('#')[1];
      const section = hash
        ? main.querySelector<HTMLElement>(`[data-window]#${hash}`)
        : null;
      go({
        kind: 'page',
        title: section?.dataset.window ?? cleanTitle(document.title),
        url,
        rows: [],
        node: section ?? main,
        buttons: ['Open', 'Back', 'Main menu'],
      });
      queueMicrotask(() => {
        setRow(firstContentLink());
        setZone(links().length ? 'list' : 'buttons');
      });
    } else if (page) {
      page.remove();
    }
    document.addEventListener('keydown', onKey);
    addEventListener('popstate', onPop);
  });
  onCleanup(() => {
    document.removeEventListener('keydown', onKey);
    removeEventListener('popstate', onPop);
  });

  const help = () => {
    const s = current();
    if (!s) return '';
    if (s.kind === 'search')
      return 'Type to search · ↑/↓ choose · Enter open · Esc back';
    if (zone() === 'buttons')
      return `<${s.buttons[btn()]}> — Enter to activate · ←/→ other buttons`;
    if (s.kind === 'page') {
      const a = links()[row()];
      return a
        ? `${a.textContent?.trim()} — Enter to open · Space/PgDn to scroll · Esc back`
        : 'Space/PgDn to scroll · Esc back';
    }
    return `${s.rows[row()]?.label ?? ''} — Enter to ${s.buttons[0].toLowerCase()} · Tab for buttons`;
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegated tap handler for links inside page content; the keyboard handler is global
    // biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled on document
    <div class="tui" onClick={onClick}>
      <output class="tui-bar" aria-live="polite">
        <i class="ph ph-terminal-window" aria-hidden="true" />
        <span>{help()}</span>
      </output>
      <div class="tui-crt" ref={crt}>
        <Show when={current()}>
          {(s) => (
            <div class="tui-window">
              <div class="tui-title">{s().title}</div>
              <Show when={s().blurb}>
                <div class="tui-blurb">{s().blurb}</div>
              </Show>
              <Show when={s().kind === 'search'}>
                <input
                  ref={searchInput}
                  class="tui-input"
                  type="search"
                  value={query()}
                  onInput={(e) => setQuery(e.currentTarget.value)}
                  placeholder="type here…"
                  aria-label="Search"
                  autocomplete="off"
                  spellcheck={false}
                />
              </Show>
              <Show when={s().kind !== 'page'}>
                <div class="tui-list">
                  <For each={s().rows}>
                    {(r, i) => (
                      <button
                        type="button"
                        class="tui-row"
                        tabIndex={-1}
                        classList={{
                          'is-sel': zone() === 'list' && i() === row(),
                        }}
                        onClick={() => {
                          setRow(i());
                          setZone('list');
                          activateRow();
                        }}
                      >
                        <span class="lbl">{r.label}</span>
                        <span class="hint">{r.hint ?? ''}</span>
                        <span class="arrow" aria-hidden="true">
                          {r.sub ? '▸' : ''}
                        </span>
                      </button>
                    )}
                  </For>
                </div>
              </Show>
              <div class="tui-body" ref={body} hidden={s().kind !== 'page'} />
              <Show when={note()}>
                <div class="tui-note">* {note()}</div>
              </Show>
              <div class="tui-buttons">
                <For each={s().buttons}>
                  {(b, i) => (
                    <button
                      type="button"
                      class="tui-btn"
                      classList={{
                        'is-sel': zone() === 'buttons' && i() === btn(),
                        'is-default': zone() === 'list' && i() === 0,
                      }}
                      onClick={() => {
                        setZone('buttons');
                        setBtn(i());
                        activate();
                      }}
                    >
                      &lt;{b}&gt;
                    </button>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </div>
      <div class="tui-keys" aria-hidden="true">
        <span>
          <b>↑↓</b> choose
        </span>
        <span>
          <b>Tab</b> buttons
        </span>
        <span>
          <b>←→</b> button
        </span>
        <span>
          <b>Enter</b> select
        </span>
        <span>
          <b>Esc</b> back
        </span>
        <span>
          <b>Space</b> scroll
        </span>
      </div>
    </div>
  );
}
