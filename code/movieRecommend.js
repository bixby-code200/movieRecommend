const genres = require('./lib/genres.js')
var http = require('http')
var console = require('console')

module.exports.function = function movieRecommend (inputGenre) {
  const baseImageUrl = 'https://image.tmdb.org/t/p/w500/'
  const baseUrl = 'https://api.themoviedb.org/3/movie/popular?api_key=295b8efeee781caec375a1c950261736&language=ko-KR&region=KR&page='
  const url = 'https://api.themoviedb.org/3/movie/popular?api_key=295b8efeee781caec375a1c950261736&language=ko-KR&page=1&region=KR'
  
  const results = []
  let inGenre = false

  console.log((typeof inputGenre === 'object' && inputGenre.name != '전체') || (typeof inputGenre === 'string'))
//   inputGenre가 object이면서 전체가 아니면, inputGenre가 string이면
  if ((typeof inputGenre === 'object' && inputGenre.name != '전체') || (typeof inputGenre === 'string')) {
    if (inputGenre.name){
      inputGenre = inputGenre.name
    }
    if (inputGenre.slice(inputGenre.length - 2, inputGenre.length) === '영화'){
      inputGenre.name = inputGenre.slice(0, inputGenre.length - 2)
    }
    const inputGenreId = getKeyByValue(genres, inputGenre) * 1
    let page = 1
    while (results.length < 20 && page < 10) {
      var response = http.getUrl(baseUrl + page.toString(), {format: 'json'})
      response.results.forEach(function(result){
        result.genre_ids.forEach(function(genre) {
          if (genre === inputGenreId) {
            inGenre = true
          }
        })
        if (inGenre) {
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
          inGenre = false
        }
      })
      page++
    }
  } else { // inputGenre가 object면서 inputGenre.name이 전체면
    var response = http.getUrl(url, {format: 'json'})
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
  }

  return results
}

function MakeGenre(array) {
  const list = [];
  array.forEach(function(genre_id) {
    list.push(genres[genre_id])
  })
  return list.join(', ')
}

function getKeyByValue(object, value) {
  let result
  for (let key in object) {
    if (object[key] == value) {
      result = key
    }
  }
  return result
}