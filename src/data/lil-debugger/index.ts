export interface LilDebuggerOptions {
  /** The attribute to read. Default: `data-debug`. */
  attribute?: string;
  /** A `KeyboardEvent.code` value. Ctrl+Shift+<key> locks the debugger on. Default: `KeyL`. */
  lockKey?: string;
  /** Add the default styles to the page. Set to `false` to bring your own. Default: `true`. */
  injectStyles?: boolean;
}

export interface LilDebugger {
  /** Lock or unlock the debugger. */
  toggle(): void;
  /** Remove all listeners, the panel, the styles and the root class. */
  destroy(): void;
}

const ROOT_CLASS = "lil-debugger";
const URL_PARAM = "lil-debug";

/** Formats a JSON object or array on many lines. Other values come back as they are. */
export function pretty(value: string): string {
  try {
    const json: unknown = JSON.parse(value);
    if (json && typeof json === "object") return JSON.stringify(json, null, 2);
  } catch {}
  return value;
}

/** Describes an element as `<tag#id.class> width×height`. */
export function describe(el: Element): string {
  const { width, height } = el.getBoundingClientRect();
  const id = el.id ? `#${el.id}` : "";
  const classes = [...el.classList].map((c) => `.${c}`).join("");
  return `<${el.tagName.toLowerCase()}${id}${classes}> ${Math.round(width)}×${Math.round(height)}`;
}

/** The default styles. Change the custom properties to theme it. */
export function styles(attribute = "data-debug"): string {
  const sel = `[${attribute}]`;
  return `
:root {
  --lil-debugger-accent: #7c3aed;
  --lil-debugger-tint: rgb(124 58 237 / 0.12);
  --lil-debugger-panel-bg: #1e1b2e;
  --lil-debugger-panel-fg: #fff;
}
.${ROOT_CLASS} ${sel} {
  outline: 1px dashed var(--lil-debugger-accent) !important;
  outline-offset: -1px;
  background-color: var(--lil-debugger-tint);
}
.${ROOT_CLASS} ${sel}:hover:not(:has(${sel}:hover)) {
  outline-style: solid !important;
  outline-width: 2px !important;
}
.lil-debugger-panel {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 2147483647;
  max-width: min(60ch, calc(100vw - 2rem));
  max-height: 50vh;
  overflow: hidden;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  background: var(--lil-debugger-panel-bg);
  color: var(--lil-debugger-panel-fg);
  font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
  text-align: left;
  pointer-events: none;
}
.lil-debugger-panel[hidden] { display: none; }
.lil-debugger-panel pre {
  margin: 0;
  font: inherit;
  font-weight: bold;
  white-space: pre-wrap;
}
.lil-debugger-panel small { opacity: 0.7; }
.lil-debugger-panel > div + div {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgb(255 255 255 / 0.2);
}
.lil-debugger-panel[data-copied]::before {
  content: "Copied ✓";
  display: block;
  color: var(--lil-debugger-accent);
}`;
}

/**
 * Hold Ctrl+Shift to see the `data-debug` value of any element.
 * Ctrl+Shift+L locks it on. Alt+click copies a value. `?lil-debug` in the URL starts it locked.
 */
export function lilDebugger({
  attribute = "data-debug",
  lockKey = "KeyL",
  injectStyles = true,
}: LilDebuggerOptions = {}): LilDebugger {
  // No DOM (server rendering): do nothing.
  if (typeof document === "undefined") return { toggle() {}, destroy() {} };

  const root = document.documentElement;
  const selector = `[${attribute}]`;
  let locked = new URLSearchParams(location.search).has(URL_PARAM);
  let peeking = false;
  let hovered: Element | null = null;

  const style = document.createElement("style");
  style.textContent = styles(attribute);

  const panel = document.createElement("div");
  panel.className = "lil-debugger-panel";

  const isOn = () => locked || peeking;

  // Client-side routers (Astro's ClientRouter, Turbo, htmx boost) swap <head>
  // and <body> on navigation, so put the style and panel back when they go.
  const attach = () => {
    if (injectStyles && !style.isConnected) document.head.append(style);
    if (!panel.isConnected) document.body.append(panel);
    if (!hovered?.isConnected) hovered = null;
  };

  const render = () => {
    attach();
    root.classList.toggle(ROOT_CLASS, isOn());
    panel.hidden = !isOn();
    if (!isOn()) return;

    const stack: Element[] = [];
    for (let el = hovered?.closest(selector); el; el = el.parentElement?.closest(selector)) {
      stack.push(el);
    }

    if (!stack.length) {
      const count = document.querySelectorAll(selector).length;
      panel.textContent = `${count} debug elements${locked ? " · locked" : ""}`;
      return;
    }

    panel.replaceChildren(
      ...stack.map((el) => {
        const item = document.createElement("div");
        const value = document.createElement("pre");
        const meta = document.createElement("small");
        value.textContent = pretty(el.getAttribute(attribute) ?? "");
        meta.textContent = describe(el);
        item.append(value, meta);
        return item;
      }),
    );
  };

  const toggle = () => {
    locked = !locked;
    render();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.type === "keydown" && e.ctrlKey && e.shiftKey && e.code === lockKey) {
      e.preventDefault();
      locked = !locked;
    }
    peeking = e.ctrlKey && e.shiftKey;
    render();
  };

  // The keyup never comes if the window loses focus while the keys are down.
  const onBlur = () => {
    peeking = false;
    render();
  };

  const onOver = (e: PointerEvent) => {
    hovered = e.target instanceof Element ? e.target : null;
    if (isOn()) render();
  };

  const onClick = (e: MouseEvent) => {
    if (!isOn() || !e.altKey || !(e.target instanceof Element)) return;
    const el = e.target.closest(selector);
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      .writeText(el.getAttribute(attribute) ?? "")
      .then(() => {
        panel.dataset.copied = "";
        setTimeout(() => delete panel.dataset.copied, 1000);
      })
      .catch((err: unknown) => console.warn("Lil' Debugger: copy failed", err));
  };

  const controller = new AbortController();
  const opts = { signal: controller.signal };
  window.addEventListener("keydown", onKey, opts);
  window.addEventListener("keyup", onKey, opts);
  window.addEventListener("blur", onBlur, opts);
  document.addEventListener("pointerover", onOver, opts);
  document.addEventListener("click", onClick, { ...opts, capture: true });
  render();

  return {
    toggle,
    destroy() {
      controller.abort();
      panel.remove();
      style.remove();
      root.classList.remove(ROOT_CLASS);
    },
  };
}
