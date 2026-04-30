import type { NowMediaItem } from 'src/types';
import { fetchOtterJson } from './otter';

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

const createEmptyMediaByStatus = (): MediaByStatus => ({
  now: [],
  skipped: [],
  done: [],
  wishlist: [],
});

const EMPTY_MEDIA_RESPONSE: MediaResponse = {
  tv: createEmptyMediaByStatus(),
  film: createEmptyMediaByStatus(),
  game: createEmptyMediaByStatus(),
  book: createEmptyMediaByStatus(),
  podcast: createEmptyMediaByStatus(),
  music: createEmptyMediaByStatus(),
  other: createEmptyMediaByStatus(),
};

export const fetchMedia = async (): Promise<MediaResponse> =>
  fetchOtterJson<MediaResponse>({
    endpoint: 'media',
    query: {
      user: import.meta.env.SUPABASE_USER_ID || '',
    },
    fallback: EMPTY_MEDIA_RESPONSE,
    resourceName: 'media',
  });

export const transformMediaToNow = (media: MediaByStatus): NowMediaItem[] => {
  const items = [...(media.now ?? [])];
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
