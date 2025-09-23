import axios from 'axios';
import urlJoin from 'proper-url-join';
import type { NowMediaItem } from 'src/types';

type Enums = {
  media_rating:
    | '0'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '2.5'
    | '3'
    | '3.5'
    | '4'
    | '4.5'
    | '5';
  media_status: 'now' | 'skipped' | 'done' | 'wishlist';
  media_type: 'tv' | 'film' | 'game' | 'book' | 'podcast' | 'music' | 'other';
};
export interface Media {
  created_at: string;
  id: number;
  media_id: string | null;
  modified_at: string | null;
  name: string;
  platform: string | null;
  rating: Enums['media_rating'] | null;
  sort_order: number | null;
  status: Enums['media_status'] | null;
  type: Enums['media_type'] | null;
  image?: string;
}

type MediaByStatus = Record<Enums['media_status'], Media[]>;
type MediaResponse = Record<Enums['media_type'], MediaByStatus>;

export const fetchMedia = async (): Promise<MediaResponse> => {
  const path = urlJoin('https://otter3.zander.wtf/api/media', {
    query: {
      user: import.meta.env.SUPABASE_USER_ID || '',
    },
  });
  const mediaResponse = await axios.get<MediaResponse>(path, {
    headers: {
      Authorization: `Bearer ${import.meta.env.SUPABASE_USER_API_KEY}`,
    },
  });
  return mediaResponse.data;
};

export const transformMediaToNow = (media: MediaByStatus): NowMediaItem[] => {
  let items = media.now ?? [];
  const doneItems = media.done;
  if (items.length < 5) {
    items.push(...doneItems.slice(0, 5 - items.length));
  }

  return items.map((item) => ({
    title: item.name,
    image: item?.image ?? '',
    rating: item?.rating ?? undefined,
  }));
};
