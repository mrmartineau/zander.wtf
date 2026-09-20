import type { Setter } from 'solid-js';
import type { Bookmark } from 'src/fetching/links';
import { Favicon } from './Favicon';
import { LinkType } from './LinkType';
import { ShortUrl } from './ShortUrl';

type Props = Bookmark & {
  setSearchQuery: Setter<string>;
};

export function LinkFeedItem({
  url,
  title = '',
  description = '',
  type,
  tags,
  setSearchQuery,
  created_at: date,
}: Props) {
  if (!url) {
    return null;
  }

  return (
    <div class="py-4 px-2 border-b border-gray-700 flex flex-col gap-2">
      <a class="text-sm" href={url}>
        {title}
      </a>
      {description ? (
        <div class="text-sm opacity-70 leading-6 line-clamp-3">
          {description}
        </div>
      ) : null}
      <div class="flex flex-wrap items-center gap-2 text-xs min-w-0">
        {url ? (
          <>
            <Favicon url={url} />
            <ShortUrl url={url} />
          </>
        ) : null}
        {type ? <LinkType type={type} setSearchQuery={setSearchQuery} /> : null}
        {tags?.length ? (
          // One row that runs out in an ellipsis, so a long tag list never
          // widens the page.
          <div class="min-w-0 truncate">
            {tags
              .filter(
                (tag) =>
                  !['IFTTT', 'TwitterLike', 'instapaper', 'public'].includes(
                    tag,
                  ),
              )
              .map((tag) => (
                <button
                  class="hover:opacity-60 mr-2 last:mr-0"
                  onClick={() => setSearchQuery(tag)}
                  type="button"
                >
                  #{tag}
                </button>
              ))}
          </div>
        ) : null}
        <time class="shrink-0" datetime={date}>
          {new Date(date).toLocaleDateString()}
        </time>
      </div>
    </div>
  );
}
