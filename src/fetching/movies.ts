import type { NowMediaItem } from 'src/types';
import urlMerge from 'url-merge';

type MovieDiaryItem = {
  title?: string;
  uri?: string;
  item?: {
    'letterboxd:watchedDate'?: string;
  };
  film?: {
    title?: string;
    image?: {
      large?: string;
    };
  };
  rating?: {
    text?: string;
  };
  'letterboxd:watchedDate'?: string;
  'letterboxd:poster'?: string;
  'letterboxd:memberRatingText'?: string;
};

export const fetchMovies = async (limit = 3): Promise<MovieDiaryItem[]> => {
  const url = urlMerge(import.meta.env.ZM_API, '/letterboxd/mrmartineau');

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[movies] Failed to fetch movies from ${url}: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as MovieDiaryItem[];
    const movieDiaryData = data
      ?.filter((item) => item?.['letterboxd:watchedDate'])
      .toSorted(
        (a, b) =>
          new Date(b?.item?.['letterboxd:watchedDate'] ?? 0).getTime() -
          new Date(a?.item?.['letterboxd:watchedDate'] ?? 0).getTime(),
      )
      .slice(0, limit);

    return movieDiaryData;
  } catch (err) {
    console.warn('[movies] Network error while fetching movies. Returning empty list.', err);
    return [];
  }
};

export const transformMoviesToNow = (movies: MovieDiaryItem[]): NowMediaItem[] => {
  const transformedMovies: NowMediaItem[] = [];
  for (const movie of movies) {
    if (movie['letterboxd:poster'] !== undefined) {
      transformedMovies.push({
        title: movie?.title ?? '',
        link: movie.uri,
        image: movie['letterboxd:poster'],
        rating: movie['letterboxd:memberRatingText'],
      });
    }
  }
  return transformedMovies;
};
