import axios from 'axios';
import urlJoin from 'proper-url-join';

export interface Bookmark {
  title: string | null;
  url: string | null;
  description: string | null;
  tags: string[] | null;
  note: string | null;
  star: boolean;
  created_at: string;
  modified_at: string;
  id: string;
  click_count: number;
  type: BookmarkType;
  image: string;
  excerpt: string | null;
  tweet?: {
    text: string;
    username: string;
    url: string;
  };
  feed: string | null;
}

export type BookmarkType =
  | 'link'
  | 'article'
  | 'video'
  | 'audio'
  | 'recipe'
  | 'image'
  | 'document'
  | 'product'
  | 'game'
  | 'note'
  | 'event'
  | 'file';

export const fetchLinks = async (limit = 150): Promise<Bookmark[]> => {
  const linksPath = urlJoin('https://otter.zander.wtf/api/tag/public', {
    query: {
      limit,
    },
  });
  const linksData = await axios.get(linksPath, {
    headers: {
      Authorization: `Bearer ${import.meta.env.OTTER_API_KEY}`,
    },
  });
  return linksData.data.data;
};
