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
      <div class="flex items-center gap-2 text-xs">
        {url ? (
          <>
            <Favicon url={url} />
            <ShortUrl url={url} />
          </>
        ) : null}
        {type ? <LinkType type={type} setSearchQuery={setSearchQuery} /> : null}
        {tags?.length
          ? tags
              .filter(
                (tag) =>
                  !['IFTTT', 'TwitterLike', 'instapaper', 'public'].includes(
                    tag,
                  ),
              )
              .map((tag) => (
                <button
                  class="hover:opacity-60"
                  onClick={() => setSearchQuery(tag)}
                  type="button"
                >
                  #{tag}
                </button>
              ))
          : null}
      </div>
    </div>
  );
}
