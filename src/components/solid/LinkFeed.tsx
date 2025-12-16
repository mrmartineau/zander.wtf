import { createMemo, createSignal, For, onCleanup } from 'solid-js';
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
      <div class="border-t border-gray-700">
        <For each={filteredLinks()}>
          {(item) => <LinkFeedItem {...item} setSearchQuery={setSearchQuery} />}
        </For>
      </div>
    </div>
  );
}
