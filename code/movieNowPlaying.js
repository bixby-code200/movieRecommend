const genres = require('./lib/genres.js')
module.exports.function = function movieNowPlaying () {
  const http = require('http')
  const console = require('console')
  
  const baseImageUrl = 'https://image.tmdb.org/t/p/w500/'
  const url = 'https://api.themoviedb.org/3/movie/now_playing?api_key=295b8efeee781caec375a1c950261736&language=ko-KR&page=1&region=KR'
  const response = http.getUrl(url, {format: 'json'})
  
  const results = []
  
  response.results.forEach(function(result){
    const data = {
      movieTitle: result.title,
      movieGenre: MakeGenre(result.genre_ids),
      // movieGenre: result.genre_ids.join(', '),
      movieScore: result.vote_average,
      moviePosterUrl: baseImageUrl + result.poster_path,
      movieOpenDate: result.release_date,
      movieDescription: result.overview + ' '
    }
    if(data.movieDescription === ' ') {
      data.movieDescription = '해당 영화에 대한 요약 정보가 없습니다.'
    }
    results.push(data)
  })
  
  return results
}

function MakeGenre(array) {
  const list = [];
  array.forEach(function(genre_id) {
    list.push(genres[genre_id])
  })
  return list.join(', ')
}
