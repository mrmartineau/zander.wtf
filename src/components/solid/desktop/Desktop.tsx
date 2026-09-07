import { createSignal, For, onCleanup, onMount } from 'solid-js';
import { MenuBar, type NavItem } from './MenuBar';
import { adopt, cleanTitle, isPageLink, seedHead } from './page';
import { Spotlight } from './Spotlight';
import { play } from './sound';
import { close, isMobile, open, state, tile, topWin } from './store';
import { Window } from './Window';

type Icon = NavItem & { icon: string };

const ICONS: Icon[] = [
  { text: 'Home', url: '/', icon: 'ph-house' },
  { text: 'Blog', url: '/blog', icon: 'ph-article' },
  { text: 'Projects', url: '/projects', icon: 'ph-cube' },
  { text: 'Links', url: '/links', icon: 'ph-link' },
  { text: 'Code Notes', url: '/notes', icon: 'ph-notebook' },
  { text: 'Now', url: '/now', icon: 'ph-clock' },
  { text: 'About', url: '/about', icon: 'ph-user' },
  { text: 'CV', url: '/cv', icon: 'ph-file-text' },
];

export default function Desktop(props: { nav: NavItem[]; more: NavItem[] }) {
  const [search, setSearch] = createSignal(false);
  const [selected, setSelected] = createSignal('');
  let initialId = 0;
  let initial: HTMLElement | undefined;

  const coarse = matchMedia('(pointer: coarse)').matches;

  // The page Astro rendered becomes the first window.
  const page = document.getElementById('page');
  if (page) {
    seedHead();
    initial = adopt(page);
    initialId = open(
      location.pathname + location.search,
      cleanTitle(document.title),
    ).id;
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

  const onPop = () => open(location.pathname + location.search);

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
    open(i.url, i.text);
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
                <i class={`ph-duotone ${i.icon}`} aria-hidden="true" />
                <span>{i.text}</span>
              </button>
            </li>
          )}
        </For>
      </ul>

      <div class="wins">
        <For each={state.wins}>
          {(w) => (
            <Window win={w} initial={w.id === initialId ? initial : undefined} />
          )}
        </For>
      </div>

      <Spotlight
        open={search()}
        onClose={() => setSearch(false)}
        apps={ICONS}
      />
    </div>
  );
}
