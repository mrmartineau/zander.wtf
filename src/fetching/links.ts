import { fetchOtterJson } from './otter';

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
  const linksData = await fetchOtterJson<{ data: Bookmark[] }>({
    endpoint: 'bookmarks',
    query: {
      limit,
      public: 'true',
      user: import.meta.env.SUPABASE_USER_ID || '',
    },
    fallback: { data: [] },
    resourceName: 'links',
  });

  return linksData.data;
};
