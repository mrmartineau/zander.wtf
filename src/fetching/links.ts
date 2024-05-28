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
  console.log(`🚀 ~ fetchLinks ~ OTTER_API_KEY:`, import.meta.env.OTTER_API_KEY)
  console.log(`🚀 ~ fetchLinks ~ SUPABASE_USER_ID:`, import.meta.env.SUPABASE_USER_ID)
  const linksPath = urlJoin('https://otter.zander.wtf/api/bookmarks', {
    query: {
      limit,
      public: 'true',
      user: import.meta.env.SUPABASE_USER_ID || '',
    },
  });
  console.log(`🚀 ~ fetchLinks ~ linksPath:`, linksPath)
  const linksData = await axios.get(linksPath, {
    headers: {
      Authorization: `Bearer ${import.meta.env.OTTER_API_KEY}`,
    },
  });
  return linksData.data.data;
};
