import { Dialog, Input, Kbd } from '@mrmartineau/zui/solid';
import { createEffect, createSignal, For, on } from 'solid-js';
import type { NavItem } from './MenuBar';
import { play } from './sound';
import { open } from './store';

type Hit = { title: string; url: string; type: string; emoji?: string };

export function Spotlight(props: {
  open: boolean;
  onClose: () => void;
  apps: NavItem[];
}) {
  let input!: HTMLInputElement;
  const [q, setQ] = createSignal('');
  const [hits, setHits] = createSignal<Hit[]>([]);
  const [cursor, setCursor] = createSignal(0);
  let timer: number | undefined;
  let ctrl: AbortController | undefined;

  const apps = () =>
    props.apps
      .filter((a) => a.text.toLowerCase().includes(q().toLowerCase()))
      .map<Hit>((a) => ({ title: a.text, url: a.url, type: 'app' }));

  const results = () => [...apps(), ...hits()];

  createEffect(
    on(q, (query) => {
      clearTimeout(timer);
      ctrl?.abort();
      setCursor(0);
      if (query.trim().length < 2) return setHits([]);
      timer = window.setTimeout(async () => {
        ctrl = new AbortController();
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(query)}&limit=8`,
            { signal: ctrl.signal },
          );
          const data = (await res.json()) as { results?: Hit[] };
          setHits(
            (data.results ?? []).map((r: Hit) => ({
              ...r,
              url: new URL(r.url).pathname,
            })),
          );
        } catch {
          /* aborted or offline */
        }
      }, 150);
    }),
  );

  createEffect(() => {
    if (props.open) {
      setQ('');
      setHits([]);
      queueMicrotask(() => input.focus());
    }
  });

  const pick = (hit: Hit) => {
    open(hit.url, hit.title);
    props.onClose();
  };

  const onKey = (e: KeyboardEvent) => {
    const n = results().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(n, 1));
      play('tick');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + n) % Math.max(n, 1));
      play('tick');
    } else if (e.key === 'Enter') {
      const hit = results()[cursor()];
      if (hit) pick(hit);
      else if (q().trim())
        pick({
          title: `Search: ${q()}`,
          url: `/search?q=${encodeURIComponent(q())}`,
          type: 'page',
        });
    }
  };

  return (
    <Dialog
      class="spotlight"
      open={props.open}
      onClose={props.onClose}
      closedby="any"
    >
      <div class="spotlight-field">
        <i class="ph ph-magnifying-glass" aria-hidden="true" />
        <Input
          ref={input}
          type="search"
          placeholder="Search everything…"
          aria-label="Search"
          autocomplete="off"
          value={q()}
          onInput={(e) => setQ(e.currentTarget.value)}
          onKeyDown={onKey}
        />
        <Kbd>esc</Kbd>
      </div>
      <ul class="spotlight-list">
        <For each={results()}>
          {(hit, i) => (
            <li>
              <button
                type="button"
                aria-current={i() === cursor()}
                classList={{ 'is-active': i() === cursor() }}
                onPointerEnter={() => setCursor(i())}
                onClick={() => pick(hit)}
              >
                <span class="spotlight-title">
                  {hit.emoji ? `${hit.emoji} ` : ''}
                  {hit.title}
                </span>
                <span class="spotlight-type">{hit.type}</span>
              </button>
            </li>
          )}
        </For>
      </ul>
    </Dialog>
  );
}
