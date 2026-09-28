import axios from 'axios'

// Primary Third-Party API: The Movie Database (TMDB)
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'

// Secondary Third-Party API: TVMaze (public, no key required)
const TVMAZE_BASE_URL = 'https://api.tvmaze.com'

// Axios client for TMDB
export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: TMDB_API_KEY
  }
})

// Axios client for TVMaze
export const tvmazeClient = axios.create({
  baseURL: TVMAZE_BASE_URL,
  timeout: 10000
})

// Cache for TMDB genres lookup
let genreMap = null

// Fetch genre dictionary from TMDB third-party API
export async function getGenresMap() {
  if (genreMap) return genreMap
  try {
    const res = await tmdbClient.get('/genre/movie/list')
    if (res.data?.genres) {
      genreMap = {}
      res.data.genres.forEach((g) => {
        genreMap[g.id] = g.name
      })
      return genreMap
    }
  } catch (err) {
    console.warn('Failed to fetch TMDB genres:', err.message)
  }
  return {}
}

// Format TMDB raw movie item into cinema booking format
function formatTmdbMovie(raw, genresDict = {}) {
  const genreNames = (raw.genre_ids || [])
    .map((id) => genresDict[id])
    .filter(Boolean)
    .slice(0, 2)
    .join(' / ') || 'Cinema / Feature'

  // Realistic screens and showtimes based on movie ID
  const screens = ['IMAX Laser 3D', 'Dolby Cinema', '4DX Atmos', 'Auditorium 1', 'Screen 3 VIP']
  const screen = screens[raw.id % screens.length]
  const basePrice = 220 + ((raw.id % 5) * 40) // Indian Rupees (₹220 to ₹380)

  return {
    id: raw.id,
    title: raw.title || raw.name || 'Untitled Feature',
    originalTitle: raw.original_title,
    overview: raw.overview || 'No overview available for this cinematic release.',
    rating: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : 7.5,
    votes: raw.vote_count || 120,
    releaseDate: raw.release_date || 'In Theaters',
    poster: raw.poster_path
      ? `${TMDB_IMAGE_BASE}${raw.poster_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: raw.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${raw.backdrop_path}`
      : null,
    genre: genreNames,
    screen,
    price: basePrice,
    duration: `${1 + (raw.id % 2)}h ${20 + (raw.id % 35)}m`,
    showtimes: ['1:15 PM', '4:30 PM', '7:45 PM', '10:15 PM']
  }
}

// Format TVMaze item as fallback third-party API
function formatTvmazeShow(item) {
  const show = item.show || item
  return {
    id: `tv_${show.id}`,
    title: show.name,
    overview: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'No overview available.',
    rating: show.rating?.average ? Number(show.rating.average.toFixed(1)) : 7.2,
    votes: 350,
    releaseDate: show.premiered || 'Current',
    poster: show.image?.medium || show.image?.original || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: show.image?.original || null,
    genre: (show.genres && show.genres.length > 0) ? show.genres.slice(0, 2).join(' / ') : 'Drama / Thriller',
    screen: 'Auditorium 2 Dolby',
    price: 250,
    duration: `${show.runtime || 60}m`,
    showtimes: ['2:00 PM', '5:15 PM', '8:30 PM']
  }
}

// Movie Service calling Third-Party APIs exclusively
export const movieService = {
  // Fetch now playing movies from TMDB third-party API
  async getNowPlaying(page = 1) {
    try {
      const genresDict = await getGenresMap()
      const response = await tmdbClient.get('/movie/now_playing', {
        params: { page }
      })
      if (response.data && response.data.results) {
        return response.data.results.map((m) => formatTmdbMovie(m, genresDict))
      }
    } catch (error) {
      console.warn('TMDB Now Playing request failed, using TVMaze fallback third-party API:', error.message)
      // Third-party fallback: TVMaze
      try {
        const fallbackRes = await tvmazeClient.get('/shows')
        return fallbackRes.data.slice(0, 18).map(formatTvmazeShow)
      } catch (fbErr) {
        console.error('All third-party movie APIs failed:', fbErr.message)
      }
    }
    return []
  },

  // Fetch trending movies of the week from TMDB third-party API
  async getTrending() {
    try {
      const genresDict = await getGenresMap()
      const response = await tmdbClient.get('/trending/movie/week')
      if (response.data && response.data.results) {
        return response.data.results.map((m) => formatTmdbMovie(m, genresDict))
      }
    } catch (error) {
      console.warn('TMDB Trending failed:', error.message)
    }
    return []
  },

  // Search movies live via TMDB third-party API
  async searchMovies(query) {
    if (!query || query.trim().length === 0) {
      return this.getNowPlaying()
    }
    try {
      const genresDict = await getGenresMap()
      const response = await tmdbClient.get('/search/movie', {
        params: { query: query.trim() }
      })
      if (response.data && response.data.results && response.data.results.length > 0) {
        return response.data.results.map((m) => formatTmdbMovie(m, genresDict))
      }
      // If TMDB returns empty, try TVMaze search API
      const tvRes = await tvmazeClient.get(`/search/shows?q=${encodeURIComponent(query.trim())}`)
      if (tvRes.data && tvRes.data.length > 0) {
        return tvRes.data.map(formatTvmazeShow)
      }
    } catch (error) {
      console.warn('Third-party movie search error:', error.message)
      try {
        const tvRes = await tvmazeClient.get(`/search/shows?q=${encodeURIComponent(query.trim())}`)
        return tvRes.data.map(formatTvmazeShow)
      } catch (e) {
        console.error('Search fallback failed:', e.message)
      }
    }
    return []
  },

  // Store confirmed booking in local storage
  async bookTickets(bookingData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookings = JSON.parse(localStorage.getItem('vscinemas_bookings') || '[]')
        const newBooking = {
          id: `book_${Date.now()}`,
          date: new Date().toISOString(),
          ...bookingData
        }
        bookings.unshift(newBooking)
        localStorage.setItem('vscinemas_bookings', JSON.stringify(bookings))
        resolve({ success: true, booking: newBooking })
      }, 300)
    })
  }
}
