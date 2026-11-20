import type { NowMediaItem } from 'src/types';

type Show = {
  title: string;
  tmdbId: number;
  posterPath: string | null;
  rating: number | null;
};

type ShowsResponse = {
  data: { watching: Show[]; recentlyWatched: Show[] };
};

const SHOWS_URL = 'https://media-api.zander.wtf/public/shows';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export const fetchShows = async (limit = 5): Promise<NowMediaItem[]> => {
  try {
    const response = await fetch(SHOWS_URL, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.warn(
        `[shows] Failed to fetch shows from ${SHOWS_URL}: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const { data } = (await response.json()) as ShowsResponse;
    return [...(data?.watching ?? []), ...(data?.recentlyWatched ?? [])]
      .filter((show) => show.posterPath)
      .slice(0, limit)
      .map((show) => ({
        title: show.title,
        image: `${POSTER_BASE}${show.posterPath}`,
        rating: show.rating?.toString(),
      }));
  } catch (err) {
    console.warn(
      '[shows] Network error while fetching shows. Returning empty list.',
      err,
    );
    return [];
  }
};
