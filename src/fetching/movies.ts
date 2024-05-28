import letterboxd, {type Entry} from 'letterboxd';
import type { NowMediaItem } from 'src/types';

export const fetchMovies = async (limit = 3) => {
  const rawMovieData = await letterboxd('mrmartineau');
  const movieDiaryData = rawMovieData
    .filter((item) => item.type === 'diary')
    // @ts-ignore
    .sort((a, b) => b.date?.watched - a.date?.watched)
    .slice(0, limit);

  return movieDiaryData;
};

export const transformMoviesToNow = (movies: Entry[]): NowMediaItem[] => {
  let transformedMovies: NowMediaItem[] = [];
  for (const movie of movies) {
    if (movie?.film?.image !== undefined) {
      transformedMovies.push({
        title: movie?.film?.title,
        link: movie.uri,
        image: movie?.film?.image.large,
        rating: movie?.rating?.text,
      });
    }
  }
  return transformedMovies
}
