import { createSignal, For, onCleanup, onMount } from 'solid-js';
import { isDesktop, servedPageMatches, stripPrefix } from '~/utils/uiMode';
import { openFolder } from './Files';
import { MenuBar, type NavItem } from './MenuBar';
import { adopt, cleanTitle, isPageLink, seedHead, split } from './page';
import { Spotlight } from './Spotlight';
import { play } from './sound';
import { close, isMobile, open, type Size, state, tile, topWin } from './store';
import { Window } from './Window';

/** `size` overrides the window size the URL would otherwise get; `action`
 * replaces opening the URL. */
type Icon = NavItem & {
  icon: string;
  img?: string;
  size?: Size;
  action?: () => void;
};

const ICONS: Icon[] = [
  { text: 'Blog', url: '/blog', icon: 'ph-article' },
  { text: 'Projects', url: '/projects', icon: 'ph-cube' },
  { text: 'Links', url: '/links', icon: 'ph-link' },
  { text: 'Code Notes', url: '/notes', icon: 'ph-notebook' },
  { text: 'Now', url: '/now', icon: 'ph-clock' },
  {
    text: 'About',
    url: '/#about',
    icon: 'ph-user',
    img: '/images/avatars/zm-avatar-08-2026.webp',
  },
  { text: 'CV', url: '/cv', icon: 'ph-file-text' },
  { text: 'Files', url: '/#folder', icon: 'ph-folder', action: openFolder },
];

export default function Desktop(props: { nav: NavItem[]; more: NavItem[] }) {
  if (!isDesktop()) return null;
  const [search, setSearch] = createSignal(false);
  const [selected, setSelected] = createSignal('');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const greeting = document.getElementById('greeting');

  // The page Astro rendered becomes the first window(s).
  const page = document.getElementById('page');
  if (page) {
    seedHead();
    const url = stripPrefix(
      location.pathname + location.search + location.hash,
    );
    if (!servedPageMatches(url)) {
      // The host handed us the home page for this URL; fetch the real one.
      page.remove();
      open(url);
    } else {
      const main = adopt(page);
      const parts = split(main, url);
      if (parts) {
        for (const p of parts) open(p.url, p.title, p.node);
      } else {
        open(url, cleanTitle(document.title), main);
      }
    }
  }

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button)
      return;
    const a = (e.target as Element).closest('a');
    if (!a || !isPageLink(a)) return;
    const url = new URL(a.href);
    // Relative links resolve under /desktop/…; window URLs never carry it.
    const path = stripPrefix(url.pathname + url.search);
    // Same-page anchors scroll inside the window they live in.
    if (url.hash && path === topWin()?.url) {
      e.preventDefault();
      a.closest('.win-body')
        ?.querySelector(url.hash)
        ?.scrollIntoView({ block: 'start' });
      return;
    }
    e.preventDefault();
    open(path, a.textContent?.trim() || path);
  };

  // GET forms (the search page) open their results in a window too.
  const onSubmit = (e: SubmitEvent) => {
    const form = e.target as HTMLFormElement;
    if (form.method.toLowerCase() !== 'get' || !form.closest('.win')) return;
    const url = new URL(form.action, location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    url.search = new URLSearchParams(new FormData(form) as never).toString();
    open(url.pathname + url.search, 'Search');
  };

  const onKey = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === 'k') {
      e.preventDefault();
      setSearch((s) => !s);
    } else if (mod && e.key === 'w') {
      const top = topWin();
      if (top) {
        e.preventDefault();
        close(top.id);
      }
    } else if (mod && e.key === 't') {
      e.preventDefault();
      tile();
    }
  };

  const onPop = () =>
    open(stripPrefix(location.pathname + location.search + location.hash));

  onMount(() => {
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKey);
    addEventListener('popstate', onPop);
  });
  onCleanup(() => {
    document.removeEventListener('click', onClick);
    document.removeEventListener('submit', onSubmit);
    document.removeEventListener('keydown', onKey);
    removeEventListener('popstate', onPop);
  });

  const launch = (i: Icon) => {
    if (i.action) i.action();
    else open(i.url, i.text, null, i.size);
    setSelected('');
  };

  return (
    <div
      class="desktop"
      onPointerDown={(e) => e.target === e.currentTarget && setSelected('')}
    >
      <MenuBar
        nav={props.nav}
        more={props.more}
        onSearch={() => setSearch(true)}
      />

      <ul class="icons" aria-label="Desktop">
        <For each={ICONS}>
          {(i) => (
            <li>
              <button
                type="button"
                class="icon"
                aria-pressed={selected() === i.url}
                onClick={() => {
                  if (coarse || isMobile()) return launch(i);
                  setSelected(i.url);
                  play('tick');
                }}
                onDblClick={() => launch(i)}
                onKeyDown={(e) => e.key === 'Enter' && launch(i)}
              >
                {i.img ? (
                  <img src={i.img} alt="" width="36" height="36" />
                ) : (
                  <i class={`ph-duotone ${i.icon}`} aria-hidden="true" />
                )}
                <span>{i.text}</span>
              </button>
            </li>
          )}
        </For>
      </ul>

      <div
        class="greeting"
        ref={(el) => greeting && el.appendChild(greeting)}
      />

      <div class="wins">
        <For each={state.wins}>{(w) => <Window win={w} />}</For>
      </div>

      <Spotlight
        open={search()}
        onClose={() => setSearch(false)}
        apps={ICONS.filter((i) => !i.action)}
      />
    </div>
  );
}
