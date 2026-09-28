import axios from 'axios'

// Primary Third-Party API: The Movie Database (TMDB)
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// Secondary Third-Party API: TVMaze (public, no key required)
const TVMAZE_BASE_URL = 'https://api.tvmaze.com'

// Axios client for TMDB
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: TMDB_API_KEY
  }
})

// Axios client for TVMaze
const tvmazeClient = axios.create({
  baseURL: TVMAZE_BASE_URL,
  timeout: 10000
})

// Cache for TMDB genres lookup
let genreMap = null

// Fetch genre dictionary from TMDB third-party API
async function getGenresMap() {
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

  const screens = ['IMAX Laser 3D', 'Dolby Cinema', '4DX Atmos', 'Auditorium 1', 'Screen 3 VIP']
  const screen = screens[raw.id % screens.length]
  const basePrice = 220 + ((raw.id % 5) * 40) // Indian Rupees (₹220 to ₹380)

  return {
    id: raw.id,
    title: raw.title || raw.name || 'Untitled Feature',
    overview: raw.overview || 'No overview available for this cinematic release.',
    rating: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : 7.5,
    poster: raw.poster_path
      ? `${TMDB_IMAGE_BASE}${raw.poster_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
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
    poster: show.image?.medium || show.image?.original || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    genre: (show.genres && show.genres.length > 0) ? show.genres.slice(0, 2).join(' / ') : 'Drama / Thriller',
    screen: 'Auditorium 2 Dolby',
    price: 250,
    duration: `${show.runtime || 60}m`,
    showtimes: ['2:00 PM', '5:15 PM', '8:30 PM']
  }
}

// Multiplex Theatres across the network
export const THEATRES_LIST = [
  {
    id: 'th-1',
    name: 'VS Cinemas IMAX Laser - Central Galleria',
    location: 'MG Road, Central Business District',
    screensCount: 6,
    dailyShows: 24,
    soundSystem: 'Dolby Atmos 128 Channel',
    facilities: ['IMAX Laser 3D', 'VIP Recliners', 'Café Lounge']
  },
  {
    id: 'th-2',
    name: 'VS Cinemas Dolby Cinema - Grand Mall',
    location: 'Koramangala 5th Block',
    screensCount: 5,
    dailyShows: 20,
    soundSystem: 'Dolby Cinema & Christie Dual 4K',
    facilities: ['Dolby Cinema', 'Wheelchair Access', 'Gourmet Counter']
  },
  {
    id: 'th-3',
    name: 'VS Cinemas 4DX Sensory - Cyber City',
    location: 'Electronics City Phase 1',
    screensCount: 4,
    dailyShows: 16,
    soundSystem: '4DX Motion Sound System',
    facilities: ['4DX Dynamic Seats', 'Air & Water FX', 'Online Valet']
  },
  {
    id: 'th-4',
    name: 'VS Cinemas Gold Class - Bay View',
    location: 'Indiranagar 100ft Road',
    screensCount: 3,
    dailyShows: 12,
    soundSystem: 'THX Certified Ultraphonic',
    facilities: ['Gold Class Loungers', 'Butler Service', 'Private Screening']
  },
  {
    id: 'th-5',
    name: 'VS Cinemas CinePlex - Nexus Avenue',
    location: 'Whitefield Main Road',
    screensCount: 5,
    dailyShows: 20,
    soundSystem: 'Barco 4K Laser & 7.1 Surround',
    facilities: ['Playhouse Kids', 'Laser Projection', 'Food Court Link']
  },
  {
    id: 'th-6',
    name: 'VS Cinemas City Center - Heritage Plaza',
    location: 'Brigade Road Junction',
    screensCount: 4,
    dailyShows: 16,
    soundSystem: 'JBL Professional Sound',
    facilities: ['Historic Auditorium', 'Snack Bar', 'Express Kiosk']
  }
]

// Revenue Summary Dummy Data in Indian Rupees (₹)
export const REVENUE_DATA = {
  totalRevenue: 384250, // ₹3,84,250
  todayRevenue: 42800,  // ₹42,800
  weeklyGrowth: '+18.4%',
  averageTicketPrice: 285,
  seatOccupancyRate: 84.6,
  formatDistribution: [
    { format: 'IMAX Laser 3D', revenue: 148500, percentage: 38.6, color: '#38bdf8' },
    { format: 'Dolby Cinema', revenue: 112000, percentage: 29.1, color: '#818cf8' },
    { format: '4DX Sensory Atmos', revenue: 78750, percentage: 20.5, color: '#f59e0b' },
    { format: 'Auditorium Standard', revenue: 45000, percentage: 11.8, color: '#10b981' }
  ]
}

// Initial Seed Bookings for Recent Bookings display
export const INITIAL_RECENT_BOOKINGS = [
  {
    id: 'VS-7842',
    movieTitle: 'Top Gun: Maverick',
    screen: 'IMAX Laser 3D',
    showtime: '7:45 PM',
    seats: ['E4', 'E5'],
    totalAmount: 520,
    userEmail: 'arun.kumar@gmail.com',
    userName: 'Arun Kumar',
    date: 'Today, 2:15 PM',
    status: 'Confirmed'
  },
  {
    id: 'VS-7841',
    movieTitle: 'Avatar: The Way of Water',
    screen: 'Dolby Cinema',
    showtime: '9:00 PM',
    seats: ['C3', 'C4', 'C5'],
    totalAmount: 780,
    userEmail: 'priya.s@yahoo.com',
    userName: 'Priya Sharma',
    date: 'Today, 1:40 PM',
    status: 'Confirmed'
  },
  {
    id: 'VS-7840',
    movieTitle: 'Oppenheimer',
    screen: '70mm IMAX',
    showtime: '4:00 PM',
    seats: ['D6', 'D7'],
    totalAmount: 600,
    userEmail: 'rahul.dev@gmail.com',
    userName: 'Rahul Dev',
    date: 'Today, 11:20 AM',
    status: 'Confirmed'
  },
  {
    id: 'VS-7839',
    movieTitle: 'Another Earth',
    screen: 'Auditorium 4',
    showtime: '6:30 PM',
    seats: ['B2'],
    totalAmount: 220,
    userEmail: 'neha.v@gmail.com',
    userName: 'Neha Verma',
    date: 'Yesterday',
    status: 'Confirmed'
  }
]

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
      try {
        const fallbackRes = await tvmazeClient.get('/shows')
        return fallbackRes.data.slice(0, 18).map(formatTvmazeShow)
      } catch (fbErr) {
        console.error('All third-party movie APIs failed:', fbErr.message)
      }
    }
    return []
  },

  // Fetch upcoming movies from TMDB third-party API
  async getUpcoming(page = 1) {
    try {
      const genresDict = await getGenresMap()
      const response = await tmdbClient.get('/movie/upcoming', {
        params: { page }
      })
      if (response.data && response.data.results) {
        return response.data.results.map((m) => formatTmdbMovie(m, genresDict))
      }
    } catch (error) {
      console.warn('TMDB Upcoming request failed:', error.message)
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
          id: `VS-${Math.floor(1000 + Math.random() * 9000)}`,
          date: 'Just now',
          status: 'Confirmed',
          ...bookingData
        }
        bookings.unshift(newBooking)
        localStorage.setItem('vscinemas_bookings', JSON.stringify(bookings))
        resolve({ success: true, booking: newBooking })
      }, 300)
    })
  }
}
