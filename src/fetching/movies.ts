import letterboxd from 'letterboxd'

export const fetchMovies = async () => {
  const rawMovieData = await letterboxd('mrmartineau')
  const movieDiaryData = rawMovieData
    .filter((item) => item.type === 'diary')
    .slice(0, 3)

  return movieDiaryData
}
