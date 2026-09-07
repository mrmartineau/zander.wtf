import { createSignal, For, onCleanup, onMount } from 'solid-js';
import { isDesktop } from '~/utils/uiMode';
import { MenuBar, type NavItem } from './MenuBar';
import { adopt, cleanTitle, isPageLink, seedHead, split } from './page';
import { Spotlight } from './Spotlight';
import { play } from './sound';
import { close, isMobile, open, type Size, state, tile, topWin } from './store';
import { Window } from './Window';

/** `size` overrides the window size the URL would otherwise get. */
type Icon = NavItem & { icon: string; img?: string; size?: Size };

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
    const url = location.pathname + location.search + location.hash;
    const main = adopt(page);
    const parts = split(main, url);
    if (parts) {
      for (const p of parts) open(p.url, p.title, p.node);
    } else {
      open(url, cleanTitle(document.title), main);
    }
  }

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button)
      return;
    const a = (e.target as Element).closest('a');
    if (!a || !isPageLink(a)) return;
    const url = new URL(a.href);
    // Same-page anchors scroll inside the window they live in.
    if (url.hash && url.pathname + url.search === topWin()?.url) {
      e.preventDefault();
      a.closest('.win-body')
        ?.querySelector(url.hash)
        ?.scrollIntoView({ block: 'start' });
      return;
    }
    e.preventDefault();
    open(url.pathname + url.search, a.textContent?.trim() || url.pathname);
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

  const onPop = () => open(location.pathname + location.search + location.hash);

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
    open(i.url, i.text, null, i.size);
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

      <div class="greeting" ref={(el) => greeting && el.append(greeting)} />

      <div class="wins">
        <For each={state.wins}>{(w) => <Window win={w} />}</For>
      </div>

      <Spotlight
        open={search()}
        onClose={() => setSearch(false)}
        apps={ICONS}
      />
    </div>
  );
}
