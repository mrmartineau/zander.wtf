import type { Bookmark } from 'src/fetching/links';
import { fullPath } from 'src/utils/fullPath';
import { Favicon } from './Favicon';
import { ShortUrl } from './ShortUrl';
import { LinkType } from './LinkType';
import type { Setter } from 'solid-js';

type Props = Bookmark & {
  isFeed?: boolean;
  showImage?: boolean;
  setSearchQuery: Setter<string>;
};

export function LinkFeedItem({
  url,
  title = '',
  description = '',
  image = '',
  type,
  tags,
  showImage = false,
  setSearchQuery,
}: Props) {
  const imagePath = fullPath(url, image);

  if (!url) {
    return null;
  }

  return (
    <div class="py-4 px-2 border-b border-gray-700 flex flex-col gap-2">
      {imagePath && showImage ? (
        <div class="zm-links-item-image">
          <img src={imagePath} alt={title} />
        </div>
      ) : null}
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
          ? tags.map((tag) => {
              if (
                !['IFTTT', 'TwitterLike', 'instapaper', 'public'].includes(tag)
              ) {
                return (
                  <button
                    class="hover:opacity-60"
                    onClick={() => setSearchQuery(tag)}
                  >
                    #{tag}
                  </button>
                );
              }
            })
          : null}
      </div>
    </div>
  );
}
