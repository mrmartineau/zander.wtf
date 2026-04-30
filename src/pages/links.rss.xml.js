import rss from '@astrojs/rss';
import { fetchLinks } from '../fetching/links';

export const GET = async (context) => {
  let links;
  try {
    links = await fetchLinks(50);
  } catch (_err) {
    links = []
  }

  return rss({
    title: `Zander's Link Feed`,
    description:
      'Hyperlinks hand-picked by Zander Martineau. All stored in my Otter bookmarking app',
    site: `${context.site}/links`,
    items: links.map((item) => {
      if (!item?.title) {
        return null;
      }

      return {
        title: item.title,
        description: item?.description ?? '',
        link: item.url ?? '',
        pubDate: new Date(item.created_at),
        categories: item.tags ?? [],
      };
    }),
    stylesheet: '/links.rss.xsl',
  });
};
