import { createSignal, For } from 'solid-js';
import { render } from 'solid-js/web';
import { play } from './sound';
import { isMobile, open } from './store';

// A small pretend file system: a folder on the desktop with a few files in
// it. Files open in windows like everything else; their URLs are `#file:…`
// so a reload just shows the desktop again.

type File = {
  name: string;
  icon: string;
  kind: 'image' | 'pdf' | 'text' | 'link';
  url?: string;
  text?: string;
};

const FILES: File[] = [
  {
    name: 'zander.webp',
    icon: 'ph-image',
    kind: 'image',
    url: '/images/avatars/zm-avatar-08-2026.webp',
  },
  { name: 'cv.pdf', icon: 'ph-file-pdf', kind: 'pdf', url: '/cv.pdf' },
  {
    name: 'README.txt',
    icon: 'ph-file-text',
    kind: 'text',
    text: `ZANDER.WTF — DESKTOP EDITION
=============================

Thanks for opening this. You found the folder.

Keys
  ⌘K  search everything
  ⌘W  close the front window
  ⌘T  tile the windows

Sounds are off. Turn them on with the speaker in the menu bar.
Every page here is also at /tui (a terminal) and /txt (no styles).

— Z`,
  },
  { name: 'robots.txt', icon: 'ph-robot', kind: 'text', url: '/robots.txt' },
  { name: 'feed.rss', icon: 'ph-rss', kind: 'link', url: '/blog.rss.xml' },
  {
    name: 'do-not-open.txt',
    icon: 'ph-file-lock',
    kind: 'text',
    text: `You opened it.

There is nothing here. But now we both know what kind of person you are.`,
  },
];

const fileUrl = (f: File) => `/#file:${f.name}`;

export function openFile(f: File) {
  if (f.kind === 'link') {
    window.open(f.url, '_blank', 'noopener');
    return;
  }
  const node = document.createElement('div');
  node.className = `file file-${f.kind}`;
  if (f.kind === 'image') {
    node.innerHTML = `<img src="${f.url}" alt="${f.name}" />`;
  } else if (f.kind === 'pdf') {
    node.innerHTML = `<iframe src="${f.url}" title="${f.name}"></iframe><p><a class="zui-button zui-button-size-sm" href="${f.url}" download>Download ${f.name}</a></p>`;
  } else {
    const pre = document.createElement('pre');
    pre.textContent = f.text ?? 'Loading…';
    node.append(pre);
    if (f.url) {
      fetch(f.url)
        .then((r) => r.text())
        .then((t) => {
          pre.textContent = t;
        })
        .catch(() => {
          pre.textContent = `Could not read ${f.name}.`;
        });
    }
  }
  open(fileUrl(f), f.name, node, f.kind === 'pdf' ? 'page' : 'block');
}

function Folder() {
  const [selected, setSelected] = createSignal('');
  const coarse = matchMedia('(pointer: coarse)').matches;
  return (
    <ul class="files" aria-label="Files">
      <For each={FILES}>
        {(f) => (
          <li>
            <button
              type="button"
              class="icon"
              aria-pressed={selected() === f.name}
              onClick={() => {
                if (coarse || isMobile()) return openFile(f);
                setSelected(f.name);
                play('tick');
              }}
              onDblClick={() => openFile(f)}
              onKeyDown={(e) => e.key === 'Enter' && openFile(f)}
            >
              <i class={`ph-duotone ${f.icon}`} aria-hidden="true" />
              <span>{f.name}</span>
            </button>
          </li>
        )}
      </For>
    </ul>
  );
}

/** The folder window's content. */
export function folderNode() {
  const el = document.createElement('div');
  el.className = 'folder';
  render(() => <Folder />, el);
  return el;
}

export const openFolder = () =>
  open('/#folder', 'Files', folderNode(), 'block');
