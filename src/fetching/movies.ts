import axios from 'axios';
import urlJoin from 'proper-url-join';
import type { NowMediaItem } from 'src/types';

export const fetchMovies = async (limit = 3) => {
  try {
    const letterboxdData = await axios.get(
      urlJoin(import.meta.env.ZM_API, '/letterboxd/mrmartineau'),
    );
    console.log(`🚀 ~ fetchMovies ~ letterboxdData:`, letterboxdData);
    const movieDiaryData = letterboxdData?.data
      ?.filter((item: any) => item?.['letterboxd:watchedDate'])
      .toSorted(
        (a: any, b: any) =>
          new Date(b?.item?.['letterboxd:watchedDate']).getTime() -
          new Date(a?.item?.['letterboxd:watchedDate']).getTime(),
      )
      .slice(0, limit);

    return movieDiaryData;
  } catch (err) {
    console.log('fetchMovies', err);
    return [];
  }
};

export const transformMoviesToNow = (movies: any[]): NowMediaItem[] => {
  let transformedMovies: NowMediaItem[] = [];
  for (const movie of movies) {
    if (movie['letterboxd:poster'] !== undefined) {
      transformedMovies.push({
        title: movie?.title,
        link: movie.uri,
        image: movie['letterboxd:poster'],
        rating: movie['letterboxd:memberRatingText'],
      });
    }
  }
  return transformedMovies;
};
