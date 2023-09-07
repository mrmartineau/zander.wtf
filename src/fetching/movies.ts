import letterboxd from 'letterboxd';

export const fetchMovies = async () => {
  const rawMovieData = await letterboxd('mrmartineau');
  const movieDiaryData = rawMovieData
    .filter((item) => item.type === 'diary')
    // @ts-ignore
    .sort((a, b) => b.date?.watched - a.date?.watched)
    .slice(0, 3);

  return movieDiaryData;
};
