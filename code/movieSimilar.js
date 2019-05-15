const genres = require('./lib/genres.js')
var http = require('http')
var secret = require('secret')
var console = require('console')

module.exports.function = function movieSimilar (inputMovie) {
  const naverId = secret.get('naverId');
  const naverSecret = secret.get('naverSecret');
  const tmdbKey = secret.get('tmdbKey');
  const results = [];
  const baseImageUrl = 'https://image.tmdb.org/t/p/w500/'
  
  var headers = {
    'X-Naver-Client-Id': naverId,
    'X-Naver-Client-Secret': naverSecret
  }
  const engNameUrl = 'https://openapi.naver.com/v1/search/movie.json?query=' + encodeURI(inputMovie) +'/&display=1/'
  const engNameResponse = http.getUrl(engNameUrl, {format:'json', headers:headers})
  let engName = engNameResponse['items']['0']['subtitle']
  const edge = decodeURI('%E2%80%99')
  for (let i = 0; i < engName.length; i++) {
    engName = engName.replace(edge, "'")
  }
  
  const movieIdUrl = 'https://api.themoviedb.org/3/search/movie?api_key=' + tmdbKey + '&query=' + encodeURI(engName)
  const movieIdResponse = http.getUrl(movieIdUrl, {format:'json'})
  const movieId = movieIdResponse['results']['0']['id']
  
  const similarUrl = 'https://api.themoviedb.org/3/movie/' + movieId + '/similar?api_key=' + tmdbKey + '&language=ko-KR&page=1'
  let Response = http.getUrl(similarUrl, {format:'json'})
  if (Response['total_results'] === 0) {
    const recommendUrl = 'https://api.themoviedb.org/3/movie/' + movieId + '/recommendations?api_key=' + tmdbKey + '&language=ko-KR&page=1'
    Response = http.getUrl(recommendUrl, {format:'json'})
  }
  Response.results.forEach(function(result) {
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
  
  return results;
}

function MakeGenre(array) {
  const list = [];
  array.forEach(function(genre_id) {
    list.push(genres[genre_id])
  })
  return list.join(', ')
}