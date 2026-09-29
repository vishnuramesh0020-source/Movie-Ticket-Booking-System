import axios from 'axios'

// Primary Third-Party API: The Movie Database (TMDB)
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'

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

// Comprehensive TMDB Genre Catalog
export const GENRES_LIST = [
  { id: '', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' }
]

// Language code to human-readable names
export const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  es: 'Spanish',
  fr: 'French',
  ja: 'Japanese',
  ko: 'Korean',
  de: 'German',
  it: 'Italian',
  zh: 'Chinese',
  pt: 'Portuguese',
  ru: 'Russian'
}

export const LANGUAGES_LIST = [
  { code: '', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'de', name: 'German' }
]

// Rating filter thresholds
export const RATING_OPTIONS = [
  { value: '', label: 'All Ratings' },
  { value: '8', label: '8.0+ Blockbusters' },
  { value: '7', label: '7.0+ Highly Rated' },
  { value: '6', label: '6.0+ Good' },
  { value: '5', label: '5.0+ Average' }
]

// Sort options (including release date)
export const SORT_OPTIONS = [
  { value: 'release_date.desc', label: 'Release Date: Newest First' },
  { value: 'release_date.asc', label: 'Release Date: Oldest First' },
  { value: 'vote_average.desc', label: 'Rating: High to Low' },
  { value: 'popularity.desc', label: 'Popularity: Most Popular' },
  { value: 'title.asc', label: 'Title: A to Z' }
]

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

// Fallback curated movies in case of offline/network failure
const FALLBACK_MOVIES = [
  {
    id: 969681,
    title: 'Spider-Man: Brand New Day',
    overview: 'Fighting crime full-time as Spider-Man in a world that does not remember him sparks a profound change in Peter Parker.',
    rating: 8.2,
    voteCount: 3410,
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    genre: 'Action / Sci-Fi',
    genreIds: [28, 878],
    language: 'English',
    languageCode: 'en',
    duration: '2h 25m',
    runtimeMinutes: 145,
    releaseDate: '2026-07-29',
    screen: 'IMAX Laser 3D',
    price: 380,
    trailerKey: 'FB-pD2gDH2Q',
    showtimes: ['1:15 PM', '4:30 PM', '7:45 PM', '10:15 PM']
  },
  {
    id: 823464,
    title: 'Godzilla x Kong: The New Empire',
    overview: 'An all-new cinematic adventure pits the almighty Kong and the fearsome Godzilla against a colossal undiscovered threat hidden within our world.',
    rating: 7.4,
    voteCount: 4120,
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    genre: 'Action / Sci-Fi',
    genreIds: [28, 878],
    language: 'English',
    languageCode: 'en',
    duration: '1h 55m',
    runtimeMinutes: 115,
    releaseDate: '2026-03-29',
    screen: 'Dolby Cinema',
    price: 340,
    trailerKey: 'lV1OOlGwExg',
    showtimes: ['2:00 PM', '5:15 PM', '8:30 PM']
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators.',
    rating: 8.5,
    voteCount: 5890,
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    genre: 'Sci-Fi / Adventure',
    genreIds: [878, 12],
    language: 'English',
    languageCode: 'en',
    duration: '2h 46m',
    runtimeMinutes: 166,
    releaseDate: '2026-03-01',
    screen: 'IMAX Laser 3D',
    price: 420,
    trailerKey: 'Way9Dexny3w',
    showtimes: ['1:30 PM', '5:00 PM', '8:45 PM']
  },
  {
    id: 763215,
    title: 'Kalki 2898 AD',
    overview: 'A modern avatar of Vishnu descends to Earth to protect the world from evil forces in a distant dystopian sci-fi realm.',
    rating: 8.1,
    voteCount: 2950,
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    genre: 'Sci-Fi / Action',
    genreIds: [878, 28],
    language: 'Telugu',
    languageCode: 'te',
    duration: '2h 50m',
    runtimeMinutes: 170,
    releaseDate: '2026-06-27',
    screen: '4DX Atmos',
    price: 360,
    trailerKey: 'kQDd1AhGIHk',
    showtimes: ['11:00 AM', '3:15 PM', '7:00 PM', '10:30 PM']
  }
]

// Format TMDB raw movie item into cinema booking format
function formatTmdbMovie(raw, genresDict = {}) {
  const genreNames = (raw.genre_ids || [])
    .map((id) => genresDict[id])
    .filter(Boolean)
    .slice(0, 2)
    .join(' / ') || 'Cinema / Feature'

  const screens = ['IMAX Laser 3D', 'Dolby Cinema', '4DX Atmos', 'Auditorium 1', 'Screen 3 VIP']
  const screen = screens[Math.abs(Number(raw.id) || 0) % screens.length]
  const basePrice = 220 + ((Math.abs(Number(raw.id) || 0) % 5) * 40) // Indian Rupees (₹220 to ₹380)

  // Language mapping
  const rawLang = raw.original_language || 'en'
  const languageName = LANGUAGE_NAMES[rawLang] || rawLang.toUpperCase()

  // Duration formatting
  const runtimeMins = raw.runtime || (100 + (Math.abs(Number(raw.id) || 1) % 55))
  const hours = Math.floor(runtimeMins / 60)
  const mins = runtimeMins % 60
  const durationStr = `${hours}h ${mins}m`

  // Format release date nicely
  const releaseDate = raw.release_date || '2026-05-15'

  return {
    id: raw.id,
    title: raw.title || raw.name || 'Untitled Feature',
    originalTitle: raw.original_title || raw.title || 'Untitled Feature',
    overview: raw.overview || 'Experience this feature film in ultra-clarity projection at VS Cinemas with immersive audio and luxury seating.',
    rating: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : 7.5,
    voteCount: raw.vote_count || 150,
    poster: raw.poster_path
      ? `${TMDB_IMAGE_BASE}${raw.poster_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: raw.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${raw.backdrop_path}`
      : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80',
    genre: genreNames,
    genreIds: raw.genre_ids || [],
    language: languageName,
    languageCode: rawLang,
    duration: durationStr,
    runtimeMinutes: runtimeMins,
    releaseDate,
    screen,
    price: basePrice,
    trailerKey: 'FB-pD2gDH2Q', // High quality cinema trailer default
    showtimes: ['1:15 PM', '4:30 PM', '7:45 PM', '10:15 PM']
  }
}

// Format TVMaze item as fallback third-party API
function formatTvmazeShow(item) {
  const show = item.show || item
  return {
    id: `tv_${show.id}`,
    title: show.name,
    originalTitle: show.name,
    overview: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'Experience cinematic brilliance on the grand screen with superior sound technology.',
    rating: show.rating?.average ? Number(show.rating.average.toFixed(1)) : 7.2,
    voteCount: 220,
    poster: show.image?.medium || show.image?.original || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: show.image?.original || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80',
    genre: (show.genres && show.genres.length > 0) ? show.genres.slice(0, 2).join(' / ') : 'Drama / Thriller',
    genreIds: [],
    language: show.language || 'English',
    languageCode: (show.language || 'en').toLowerCase().slice(0, 2),
    duration: `${show.runtime || 95}m`,
    runtimeMinutes: show.runtime || 95,
    releaseDate: show.premiered || '2026-01-10',
    screen: 'Auditorium 2 Dolby',
    price: 260,
    trailerKey: 'Way9Dexny3w',
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
  // Unified Movie Retrieval Engine powering BOTH Dashboard and Movies Page
  async getMoviesList({
    page = 1,
    genre = '',
    language = '',
    rating = '',
    sortBy = 'release_date.desc',
    search = '',
    category = 'all' // 'all' | 'now_playing' | 'upcoming'
  } = {}) {
    const genresDict = await getGenresMap()

    // 1. Text Search mode
    if (search && search.trim().length > 0) {
      try {
        const response = await tmdbClient.get('/search/movie', {
          params: {
            query: search.trim(),
            page
          }
        })
        if (response.data && response.data.results) {
          let movies = response.data.results.map((m) => formatTmdbMovie(m, genresDict))

          // Apply client-side filters on search results
          if (genre) {
            const genreIdNum = Number(genre)
            movies = movies.filter((m) => m.genreIds.includes(genreIdNum))
          }
          if (language) {
            movies = movies.filter((m) => m.languageCode === language)
          }
          if (rating) {
            const minRating = Number(rating)
            movies = movies.filter((m) => m.rating >= minRating)
          }

          // Apply client-side sort on search results
          if (sortBy === 'release_date.desc') {
            movies.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
          } else if (sortBy === 'release_date.asc') {
            movies.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
          } else if (sortBy === 'vote_average.desc') {
            movies.sort((a, b) => b.rating - a.rating)
          } else if (sortBy === 'popularity.desc') {
            movies.sort((a, b) => b.voteCount - a.voteCount)
          } else if (sortBy === 'title.asc') {
            movies.sort((a, b) => a.title.localeCompare(b.title))
          }

          return {
            movies,
            totalPages: Math.min(response.data.total_pages || 1, 50),
            totalResults: response.data.total_results || movies.length,
            page
          }
        }
      } catch (err) {
        console.warn('Search query failed, attempting TVMaze fallback:', err.message)
        try {
          const tvRes = await tvmazeClient.get(`/search/shows?q=${encodeURIComponent(search.trim())}`)
          const tvMovies = tvRes.data.map(formatTvmazeShow)
          return {
            movies: tvMovies,
            totalPages: 1,
            totalResults: tvMovies.length,
            page: 1
          }
        } catch {
          // continue to fallback
        }
      }
    }

    // 2. Specific Category Mode (Now Playing or Upcoming)
    if (category === 'now_playing' || category === 'upcoming') {
      try {
        const endpoint = category === 'now_playing' ? '/movie/now_playing' : '/movie/upcoming'
        const response = await tmdbClient.get(endpoint, {
          params: { page }
        })

        if (response.data && response.data.results) {
          let movies = response.data.results.map((m) => formatTmdbMovie(m, genresDict))

          if (genre) {
            movies = movies.filter((m) => m.genreIds.includes(Number(genre)))
          }
          if (language) {
            movies = movies.filter((m) => m.languageCode === language)
          }
          if (rating) {
            movies = movies.filter((m) => m.rating >= Number(rating))
          }

          if (sortBy === 'release_date.desc') {
            movies.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
          } else if (sortBy === 'release_date.asc') {
            movies.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
          } else if (sortBy === 'vote_average.desc') {
            movies.sort((a, b) => b.rating - a.rating)
          } else if (sortBy === 'popularity.desc') {
            movies.sort((a, b) => b.voteCount - a.voteCount)
          } else if (sortBy === 'title.asc') {
            movies.sort((a, b) => a.title.localeCompare(b.title))
          }

          return {
            movies,
            totalPages: Math.min(response.data.total_pages || 1, 50),
            totalResults: response.data.total_results || movies.length,
            page
          }
        }
      } catch (catErr) {
        console.warn(`TMDB ${category} request failed, attempting fallback:`, catErr.message)
      }
    }

    // 3. Discover mode with full API filters and sorting
    try {
      const sortParamMap = {
        'release_date.desc': 'primary_release_date.desc',
        'release_date.asc': 'primary_release_date.asc',
        'vote_average.desc': 'vote_average.desc',
        'popularity.desc': 'popularity.desc',
        'title.asc': 'original_title.asc'
      }

      const params = {
        page,
        sort_by: sortParamMap[sortBy] || 'primary_release_date.desc',
        'vote_count.gte': sortBy === 'vote_average.desc' ? 100 : 1
      }

      if (genre) params.with_genres = genre
      if (language) params.with_original_language = language
      if (rating) params['vote_average.gte'] = Number(rating)

      // Keep recent / sensible theatrical dates
      if (sortBy === 'release_date.desc') {
        params['primary_release_date.lte'] = '2027-12-31'
      }

      const response = await tmdbClient.get('/discover/movie', { params })

      if (response.data && response.data.results) {
        const movies = response.data.results.map((m) => formatTmdbMovie(m, genresDict))
        return {
          movies,
          totalPages: Math.min(response.data.total_pages || 1, 50),
          totalResults: response.data.total_results || movies.length,
          page
        }
      }
    } catch (error) {
      console.warn('TMDB Discover API request failed, loading fallback catalog:', error.message)
    }

    // 4. Resilient Fallback return
    let fallback = [...FALLBACK_MOVIES]
    if (category === 'upcoming') {
      fallback = fallback.filter((m) => new Date(m.releaseDate) >= new Date('2026-06-01'))
    }
    if (genre) fallback = fallback.filter((m) => m.genreIds.includes(Number(genre)))
    if (language) fallback = fallback.filter((m) => m.languageCode === language)
    if (rating) fallback = fallback.filter((m) => m.rating >= Number(rating))

    return {
      movies: fallback,
      totalPages: 1,
      totalResults: fallback.length,
      page: 1
    }
  },

  // Fetch now playing movies using the unified TMDB movie engine
  async getNowPlaying(page = 1) {
    const res = await this.getMoviesList({ category: 'now_playing', page })
    return res.movies
  },

  // Fetch upcoming movies using the unified TMDB movie engine
  async getUpcoming(page = 1) {
    const res = await this.getMoviesList({ category: 'upcoming', page })
    return res.movies
  },

  // Search movies live using the unified TMDB movie engine
  async searchMovies(query) {
    if (!query || query.trim().length === 0) {
      return this.getNowPlaying()
    }
    const res = await this.getMoviesList({ search: query })
    return res.movies
  },

  // Module 3: Get Detailed Movie Profile with Cast, Video Trailer, & Credits
  async getMovieDetails(movieId) {
    const genresDict = await getGenresMap()

    // Handle TVMaze show IDs
    if (String(movieId).startsWith('tv_')) {
      try {
        const idNum = String(movieId).replace('tv_', '')
        const res = await tvmazeClient.get(`/shows/${idNum}?embed=cast`)
        const show = res.data
        const base = formatTvmazeShow(show)
        const castMembers = (show._embedded?.cast || []).slice(0, 6).map((c) => ({
          id: c.person?.id || Math.random(),
          name: c.person?.name || 'Actor',
          character: c.character?.name || 'Main Cast',
          image: c.person?.image?.medium || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        }))

        return {
          ...base,
          cast: castMembers,
          tagline: 'Stream & Experience at VS Cinemas',
          director: 'Executive Producers',
          budget: 'N/A',
          revenue: 'N/A',
          status: show.status || 'Released'
        }
      } catch (e) {
        console.warn('TVMaze show detail fetch failed:', e.message)
      }
    }

    // TMDB Movie Details
    try {
      const res = await tmdbClient.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'videos,credits,similar'
        }
      })

      if (res.data) {
        const d = res.data
        const base = formatTmdbMovie(d, genresDict)

        // Find official trailer or high quality teaser video
        let trailerKey = 'FB-pD2gDH2Q'
        if (d.videos?.results && d.videos.results.length > 0) {
          const official = d.videos.results.find(
            (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          ) || d.videos.results.find((v) => v.site === 'YouTube')
          if (official && official.key) {
            trailerKey = official.key
          }
        }

        // Extract top cast members
        const cast = (d.credits?.cast || []).slice(0, 8).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character || 'Supporting Role',
          image: c.profile_path
            ? `${TMDB_IMAGE_BASE}${c.profile_path}`
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        }))

        // Extract Director
        const directorObj = (d.credits?.crew || []).find((c) => c.job === 'Director')
        const director = directorObj ? directorObj.name : 'Renowned Filmmaker'

        // Spoken languages formatted
        const spoken = (d.spoken_languages || [])
          .map((l) => l.english_name || l.name)
          .join(', ') || base.language

        // Formatted budget & box office in INR conversion / millions
        const budgetFormatted = d.budget > 0 ? `$${(d.budget / 1000000).toFixed(1)}M` : 'Confidential'
        const revenueFormatted = d.revenue > 0 ? `$${(d.revenue / 1000000).toFixed(1)}M` : 'In Theatres'

        return {
          ...base,
          trailerKey,
          cast,
          director,
          budget: budgetFormatted,
          revenue: revenueFormatted,
          tagline: d.tagline || 'Experience the cinema magic in premium large formats.',
          spokenLanguages: spoken,
          status: d.status || 'Released'
        }
      }
    } catch (err) {
      console.warn('TMDB Movie Details failed:', err.message)
    }

    // Fallback if movie not found
    const matchFallback = FALLBACK_MOVIES.find((m) => String(m.id) === String(movieId)) || FALLBACK_MOVIES[0]
    return {
      ...matchFallback,
      cast: [
        { id: 1, name: 'Lead Performer', character: 'Protagonist', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
        { id: 2, name: 'Co-Star', character: 'Antagonist', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' }
      ],
      director: 'Acclaimed Director',
      budget: '$150M',
      revenue: '$450M',
      tagline: 'Experience cinema in extraordinary precision.',
      spokenLanguages: matchFallback.language,
      status: 'In Theatres'
    }
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
