import { createEffect, onMount, Show } from 'solid-js';
import { fetchPage, split } from './page';
import { play } from './sound';
import {
  close,
  focus,
  isMobile,
  minimise,
  move,
  open,
  resize,
  setContent,
  state,
  toggleMax,
  type Win,
} from './store';

const GLITCH_SETS = ['ss01', 'ss02', 'ss03', 'ss04', 'ss05'];

/** Flicker the title through Alpha Lyrae's stylistic sets for a moment. */
function glitch(el: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let frames = 6;
  const step = () => {
    const set = GLITCH_SETS[Math.floor(Math.random() * GLITCH_SETS.length)];
    el.style.fontFeatureSettings = frames-- > 0 ? `'${set}' 1` : '';
    if (frames >= 0) setTimeout(step, 50);
  };
  step();
}

type Drag = { onMove: (dx: number, dy: number) => void };

function drag(e: PointerEvent, d: Drag) {
  if (e.button !== 0 || isMobile()) return;
  e.preventDefault();
  const sx = e.clientX;
  const sy = e.clientY;
  const el = e.currentTarget as HTMLElement;
  el.setPointerCapture(e.pointerId);
  const onMove = (ev: PointerEvent) =>
    d.onMove(ev.clientX - sx, ev.clientY - sy);
  const onUp = () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
}

export function Window(props: { win: Win }) {
  let body!: HTMLDivElement;
  let title!: HTMLSpanElement;
  let lastScroll = 0;

  const isTop = () => state.wins.every((w) => w.min || w.z <= props.win.z);

  onMount(async () => {
    glitch(title);
    if (props.win.content) return;
    try {
      const page = await fetchPage(props.win.url);
      const parts = split(page.main, props.win.url);
      if (parts?.length === 1 && parts[0].url === props.win.url) {
        // One section, already sized for it: keep this window.
        setContent(props.win.id, parts[0].title, parts[0].node);
      } else if (parts) {
        // This placeholder becomes one window per section (or none).
        close(props.win.id, true);
        for (const p of parts) open(p.url, p.title, p.node);
      } else {
        setContent(props.win.id, page.title, page.main);
      }
      for (const s of page.scripts) document.head.appendChild(s);
    } catch {
      const err = document.createElement('main');
      err.className = 'page';
      err.innerHTML = `<p>Could not load <code>${props.win.url}</code>.</p>`;
      setContent(props.win.id, 'Error', err);
    }
  });

  createEffect(() => {
    const node = props.win.content;
    if (node && node.parentElement !== body) body.replaceChildren(node);
  });

  const onScroll = () => {
    const y = body.scrollTop;
    if (Math.abs(y - lastScroll) >= 24) {
      lastScroll = y;
      play('scroll');
    }
  };

  const onButton = (e: Event) => !!(e.target as Element).closest('button');

  const startMove = (e: PointerEvent) => {
    if (props.win.max || onButton(e)) return;
    const { x, y } = props.win;
    drag(e, {
      onMove: (dx, dy) => move(props.win.id, x + dx, Math.max(0, y + dy)),
    });
  };

  const startResize = (e: PointerEvent) => {
    const { w, h } = props.win;
    drag(e, { onMove: (dx, dy) => resize(props.win.id, w + dx, h + dy) });
  };

  return (
    <section
      class="win"
      classList={{
        'is-top': isTop(),
        'is-max': props.win.max,
        'is-loading': props.win.loading,
      }}
      hidden={props.win.min}
      style={{
        left: `${props.win.x}px`,
        top: `${props.win.y}px`,
        width: `${props.win.w}px`,
        height: `${props.win.h}px`,
        'z-index': props.win.z,
      }}
      role="dialog"
      aria-label={props.win.title}
      onPointerDown={() => !isTop() && focus(props.win.id)}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag handle; the buttons inside stay keyboard-reachable */}
      <header
        class="win-bar"
        onPointerDown={startMove}
        onDblClick={(e) => !onButton(e) && toggleMax(props.win.id)}
      >
        <Show
          when={state.wins.length > 1 && isMobile()}
          fallback={
            <button
              type="button"
              class="win-btn"
              aria-label="Close"
              onClick={() => close(props.win.id)}
            >
              <i class="ph ph-x" aria-hidden="true" />
            </button>
          }
        >
          <button
            type="button"
            class="win-btn"
            aria-label="Back"
            onClick={() => close(props.win.id)}
          >
            <i class="ph ph-arrow-left" aria-hidden="true" />
          </button>
        </Show>
        <span class="win-title" ref={title}>
          {props.win.title}
        </span>
        <span class="win-btns">
          <button
            type="button"
            class="win-btn"
            aria-label="Minimise"
            onClick={() => minimise(props.win.id)}
          >
            <i class="ph ph-minus" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="win-btn"
            aria-label="Zoom"
            onClick={() => toggleMax(props.win.id)}
          >
            <i class="ph ph-arrows-out-simple" aria-hidden="true" />
          </button>
        </span>
      </header>
      <div class="win-body" ref={body} onScroll={onScroll} tabIndex={-1} />
      <Show when={props.win.loading}>
        <p class="win-loading">Loading…</p>
      </Show>
      <span class="win-resize" onPointerDown={startResize} aria-hidden="true" />
    </section>
  );
}
