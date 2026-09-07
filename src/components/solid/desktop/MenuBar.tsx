import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from '@mrmartineau/zui/solid';
import { createSignal, For, onCleanup, Show } from 'solid-js';
import { setUiMode } from '~/utils/uiMode';
import { setSound, soundOn } from './sound';
import { close, closeAll, focus, open, state, tile, topWin } from './store';

export type NavItem = { text: string; url: string; external?: boolean };

function clock() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MenuBar(props: {
  nav: NavItem[];
  more: NavItem[];
  onSearch: () => void;
}) {
  const [time, setTime] = createSignal(clock());
  const timer = window.setInterval(() => setTime(clock()), 15_000);
  onCleanup(() => clearInterval(timer));

  const item = (n: NavItem) =>
    n.external ? (
      <MenuItem href={n.url} target="_blank" rel="noopener">
        {n.text} <i class="ph ph-arrow-up-right" aria-hidden="true" />
      </MenuItem>
    ) : (
      <MenuItem onClick={() => open(n.url, n.text)}>{n.text}</MenuItem>
    );

  return (
    <nav class="menubar" aria-label="Menu bar">
      <Menu class="menu-z">
        <MenuTrigger variant="ghost" size="sm" aria-label="Zander menu">
          Z
        </MenuTrigger>
        <MenuContent>
          <MenuItem onClick={() => open('/#about', 'About me')}>
            About me
          </MenuItem>
          <MenuItem onClick={() => open('/about', 'About this site')}>
            About this site
          </MenuItem>
          <For each={props.more}>{item}</For>
          <hr class="menu-rule" />
          <MenuItem onClick={() => setUiMode('tui')}>
            Switch to terminal
          </MenuItem>
          <MenuItem onClick={() => setUiMode('classic')}>
            Switch to classic site
          </MenuItem>
        </MenuContent>
      </Menu>

      <Menu>
        <MenuTrigger variant="ghost" size="sm">
          File
        </MenuTrigger>
        <MenuContent>
          <MenuItem onClick={() => topWin() && close(topWin().id)}>
            Close window <kbd class="zui-kbd">⌘W</kbd>
          </MenuItem>
          <MenuItem onClick={closeAll}>Close all</MenuItem>
        </MenuContent>
      </Menu>

      <Menu>
        <MenuTrigger variant="ghost" size="sm">
          Go
        </MenuTrigger>
        <MenuContent>
          <For each={props.nav}>{item}</For>
          <MenuItem onClick={() => open('/notes', 'Code Notes')}>
            Code Notes
          </MenuItem>
          <MenuItem onClick={() => open('/search', 'Search')}>Search</MenuItem>
        </MenuContent>
      </Menu>

      <Menu>
        <MenuTrigger variant="ghost" size="sm">
          Window
        </MenuTrigger>
        <MenuContent>
          <MenuItem onClick={tile}>
            Tile windows <kbd class="zui-kbd">⌘T</kbd>
          </MenuItem>
          <Show when={state.wins.length}>
            <hr class="menu-rule" />
          </Show>
          <For each={state.wins}>
            {(w) => (
              <MenuItem onClick={() => focus(w.id, true)}>
                {w.min ? '◇ ' : topWin()?.id === w.id ? '● ' : '○ '}
                {w.title}
              </MenuItem>
            )}
          </For>
        </MenuContent>
      </Menu>

      <Show when={state.recent.length}>
        <Menu class="menu-recent">
          <MenuTrigger variant="ghost" size="sm">
            Recent
          </MenuTrigger>
          <MenuContent>
            <For each={state.recent}>
              {(r) => (
                <MenuItem onClick={() => open(r.url, r.title)}>
                  {r.title}
                </MenuItem>
              )}
            </For>
          </MenuContent>
        </Menu>
      </Show>

      <span class="menubar-spacer" />

      <a class="menubar-hire" href="mailto:hi+enquiry@zander.wtf">
        <i class="ph ph-paper-plane-right" aria-hidden="true" /> Available for
        work
      </a>

      <button
        type="button"
        class="menubar-btn"
        aria-pressed={soundOn()}
        aria-label={soundOn() ? 'Sound on' : 'Sound off'}
        title={soundOn() ? 'Sound on' : 'Sound off'}
        onClick={() => setSound(!soundOn())}
      >
        <i
          class={soundOn() ? 'ph ph-speaker-high' : 'ph ph-speaker-slash'}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        class="menubar-btn"
        aria-label="Search (⌘K)"
        title="Search (⌘K)"
        onClick={props.onSearch}
      >
        <i class="ph ph-magnifying-glass" aria-hidden="true" />
      </button>

      <time class="menubar-clock">{time()}</time>
    </nav>
  );
}
