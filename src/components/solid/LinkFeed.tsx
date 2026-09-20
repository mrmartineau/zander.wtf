import { createWindowVirtualizer } from '@tanstack/solid-virtual';
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import type { Bookmark } from 'src/fetching/links';
import { LinkFeedItem } from './LinkFeedItem';

export function LinkFeed({ links }: { links: Bookmark[] }) {
  const [searchQuery, setSearchQuery] = createSignal('');

  const filteredLinks = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) {
      return links;
    }

    return links.filter((link) => {
      // Search in all string properties
      const searchableText = [
        link.title,
        link.url,
        link.description,
        link.note,
        link.excerpt,
        link.feed,
        link.type,
        link.id,
        // Search in tags array
        ...(link.tags || []),
        // Search in tweet object if it exists
        link.tweet?.text,
        link.tweet?.username,
        link.tweet?.url,
      ]
        .filter(Boolean)
        .map((val) => String(val).toLowerCase())
        .join(' ');

      return searchableText.includes(query);
    });
  });

  let listEl!: HTMLDivElement;
  const [scrollMargin, setScrollMargin] = createSignal(0);
  // ponytail: the page itself is the scroller, which is what the window
  // virtualizer needs. Desktop and terminal mode scroll inside a window body
  // instead, so the plain list is rendered there. Give those an element
  // virtualizer if they get slow too.
  const pageScrolls = !/\b(desktop|tui)\b/.test(
    document.documentElement.className,
  );

  onMount(() => {
    const remeasure = () => {
      setScrollMargin(listEl.getBoundingClientRect().top + window.scrollY);
      virtualizer.measure(); // item heights change when the row rewraps
    };
    remeasure();
    window.addEventListener('resize', remeasure);
    onCleanup(() => window.removeEventListener('resize', remeasure));
  });

  const virtualizer = createWindowVirtualizer({
    get count() {
      return filteredLinks().length;
    },
    estimateSize: () => 140,
    overscan: 6,
    get scrollMargin() {
      return scrollMargin();
    },
    // Keyed by bookmark, so a measured height stays correct after a search.
    getItemKey: (index) => filteredLinks()[index]?.id ?? index,
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchQuery()?.length > 0) {
      setSearchQuery('');
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchQuery()?.length > 0) {
        setSearchQuery('');
      }
    });
  });

  return (
    <div class="relative">
      <div class="sticky top-2 z-10 group">
        <input
          type="text"
          placeholder={`Search ${filteredLinks().length} links...`}
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="w-full p-4 my-5 rounded-xl bg-[var(--bg-block)] text-base font-sans text-[var(--colour-text)] border-none focus:outline-none focus:ring-2 focus:ring-[var(--colour-accent)] focus:ring-offset-2"
          autofocus
        />
        {searchQuery()?.length > 0 ? (
          <>
            <div class="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 group-hover:opacity-0">
              {filteredLinks().length}
            </div>
            <button
              class="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setSearchQuery('')}
              type="button"
              aria-label="Clear search"
            >
              <i
                class="ph-fill ph-backspace zm-icon"
                style="--icon-size: 1.4rem;"
              ></i>
            </button>
          </>
        ) : null}
      </div>
      <div
        ref={listEl}
        class="border-t border-gray-700 relative"
        style={
          pageScrolls
            ? { height: `${virtualizer.getTotalSize()}px` }
            : undefined
        }
      >
        <Show
          when={pageScrolls}
          fallback={
            <For each={filteredLinks()}>
              {(item) => (
                <LinkFeedItem {...item} setSearchQuery={setSearchQuery} />
              )}
            </For>
          }
        >
          <For each={virtualizer.getVirtualItems()}>
            {(row) => {
              let rowEl!: HTMLDivElement;
              // A row element is reused for another bookmark as you scroll or
              // search, so its height is remeasured on every change. Without
              // this the list keeps the 140px estimate and the rows overlap.
              createEffect(() => {
                row.index;
                filteredLinks();
                queueMicrotask(() => virtualizer.measureElement(rowEl));
              });
              return (
                <div
                  data-index={row.index}
                  ref={rowEl}
                  class="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
                  }}
                >
                  {/* keyed, so a row rebuilds when a search puts a different
                    bookmark at this index */}
                  <Show when={filteredLinks()[row.index]} keyed>
                    {(item) => (
                      <LinkFeedItem {...item} setSearchQuery={setSearchQuery} />
                    )}
                  </Show>
                </div>
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
}
