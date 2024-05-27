import letterboxd from 'letterboxd';

export const fetchMovies = async (limit = 3) => {
  const rawMovieData = await letterboxd('mrmartineau');
  const movieDiaryData = rawMovieData
    .filter((item) => item.type === 'diary')
    // @ts-ignore
    .sort((a, b) => b.date?.watched - a.date?.watched)
    .slice(0, limit);

  return movieDiaryData;
};
