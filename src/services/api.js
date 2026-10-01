import axios from 'axios'

// Primary Third-Party API: The Movie Database (TMDB)
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'

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
const LANGUAGE_NAMES = {
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

// Fallback curated movies in case of offline/network failure
const FALLBACK_MOVIES = [
  {
    id: 677179,
    title: 'Creed III',
    overview: 'After dominating the boxing world, Adonis Creed has been thriving in both his career and family life. When a childhood friend and former boxing prodigy resurfaces, the face-off is more than just a fight.',
    rating: 8.4,
    voteCount: 3840,
    poster: 'https://image.tmdb.org/t/p/w500/cvsXj3I9Q00I9igWv1hv39RuwNJ.jpg',
    backdrop: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&auto=format&fit=crop&q=80',
    genre: 'Drama / Action',
    genreIds: [18, 28],
    language: 'English',
    languageCode: 'en',
    duration: '1h 56m',
    runtimeMinutes: 116,
    releaseDate: '2026-03-03',
    screen: 'Screen 02 (Dolby Cinema)',
    price: 350,
    trailerKey: 'AHmCH7iB_IM',
    showtimes: ['1:30 PM', '4:45 PM', '7:45 PM', '10:45 PM']
  },
  {
    id: 569094,
    title: 'Spider-Man: Beyond the Spider-Verse',
    overview: 'Miles Morales catapults across the Multiverse with Gwen Stacy and a team of Spider-Heroes to confront an enigmatic threat.',
    rating: 8.7,
    voteCount: 4210,
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    genre: 'Animation / Action',
    genreIds: [16, 28],
    language: 'English',
    languageCode: 'en',
    duration: '2h 20m',
    runtimeMinutes: 140,
    releaseDate: '2026-06-15',
    screen: 'Screen 01 (IMAX Laser 3D)',
    price: 380,
    trailerKey: 'cqGjhVJWtEg',
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
    screen: 'Screen 02 (Dolby Cinema)',
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
    screen: 'Screen 01 (IMAX Laser 3D)',
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
    screen: 'Screen 03 (4DX Dynamic)',
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

  const screens = ['Screen 01 (IMAX Laser 3D)', 'Screen 02 (Dolby Cinema)', 'Screen 03 (4DX Dynamic)', 'Screen 04 (Premiere Club)', 'Screen 05 (Classic Cinema)']
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

// Multiplex Theatres across the network (Enriched for Module 4)
export const THEATRES_LIST = [
  {
    id: 'th-1',
    name: 'VS Cinemas IMAX Laser - Central Galleria',
    location: 'MG Road, Central Business District',
    address: 'Level 4, The Central Galleria, 88 MG Road, Ashok Nagar',
    city: 'Bengaluru',
    screensCount: 6,
    dailyShows: 24,
    soundSystem: 'Dolby Atmos 128 Channel',
    facilities: ['IMAX Laser 3D', 'VIP Recliners', 'Gourmet Café', 'Valet Parking', 'Wheelchair Access'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 1840,
    contact: {
      phone: '+91 80 4910 2200',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'galleria.blr@vscinemas.com',
      boxOfficeHours: '9:30 AM - 11:45 PM Daily',
      manager: 'Rajesh Kumar (Senior Ops Manager)'
    },
    locationDetails: {
      address: 'Level 4, The Central Galleria, 88 MG Road, Ashok Nagar',
      city: 'Bengaluru',
      landmark: 'Near MG Road Metro Station & Trinity Circle',
      coordinates: { lat: 12.9756, lng: 77.6066 },
      mapUrl: 'https://maps.google.com/?q=MG+Road+Bengaluru',
      parking: '4-level multi-deck parking with dedicated valet and EV charging points',
      transit: 'Direct connected skywalk from MG Road Metro (Purple Line) Gate 2'
    },
    screens: [
      { id: 'th1-s1', screenNumber: 1, name: 'Screen 1 (IMAX Laser 3D)', type: 'IMAX Laser 3D', capacity: 380, sound: 'Dolby Atmos 128-Channel', projection: 'Dual 4K Laser RealDepth', features: ['1.43:1 Giant Canvas', 'VIP Leather Recliners'] },
      { id: 'th1-s2', screenNumber: 2, name: 'Screen 2 (Dolby Cinema)', type: 'Dolby Cinema', capacity: 280, sound: 'Dolby Atmos Surround', projection: 'Dolby Vision Dual 4K', features: ['Deep Blacks HDR', 'Step-Free Seating'] },
      { id: 'th1-s3', screenNumber: 3, name: 'Screen 3 (4DX Dynamic)', type: '4DX', capacity: 160, sound: 'JBL 7.1 Surround', projection: 'Barco 4K Laser', features: ['Motion Synchronized Seats', 'Environmental FX (Fog, Wind, Scents)'] },
      { id: 'th1-s4', screenNumber: 4, name: 'Screen 4 (Premiere Club)', type: 'Premiere 2D', capacity: 210, sound: 'Dolby 7.1', projection: 'Christie Laser 4K', features: ['Ergonomic Plush Seats', 'Spacious Legroom'] },
      { id: 'th1-s5', screenNumber: 5, name: 'Screen 5 (Classic Cinema)', type: 'Classic 2D', capacity: 190, sound: 'Dolby Surround 7.1', projection: 'Barco 2K Digital', features: ['Acoustic Wall Treatment', 'Snack Tray Holders'] },
      { id: 'th1-s6', screenNumber: 6, name: 'Screen 6 (VIP Gold Class)', type: 'Gold Class', capacity: 90, sound: 'THX Spatial Audio', projection: 'Sony 4K SXRD', features: ['Full Flat Recliners', 'At-Seat Butler Service'] }
    ],
    availableShows: [
      { id: 'th1-sh1', time: '10:15 AM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (IMAX Laser 3D)', format: 'IMAX 3D', price: 380, language: 'English', status: 'Filling Fast' },
      { id: 'th1-sh2', time: '1:45 PM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (IMAX Laser 3D)', format: 'IMAX 3D', price: 420, language: 'English', status: 'Available' },
      { id: 'th1-sh3', time: '4:30 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 2 (Dolby Cinema)', format: 'Dolby Atmos', price: 340, language: 'Telugu', status: 'Almost Full' },
      { id: 'th1-sh4', time: '7:45 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (IMAX Laser 3D)', format: 'IMAX 3D', price: 400, language: 'English', status: 'Filling Fast' },
      { id: 'th1-sh5', time: '10:30 PM', movieTitle: 'Interstellar', screen: 'Screen 2 (Dolby Cinema)', format: 'Dolby Atmos', price: 320, language: 'English', status: 'Available' }
    ]
  },
  {
    id: 'th-2',
    name: 'VS Cinemas Dolby Cinema - Grand Mall',
    location: 'Koramangala 5th Block',
    address: 'Grand Forum Mall, Hosur Main Road, Koramangala 5th Block',
    city: 'Bengaluru',
    screensCount: 5,
    dailyShows: 20,
    soundSystem: 'Dolby Cinema & Christie Dual 4K',
    facilities: ['Dolby Cinema', 'Wheelchair Access', 'Gourmet Counter', 'Recliner Lounges', 'Instant Ticket Kiosks'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 1530,
    contact: {
      phone: '+91 80 4122 8844',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'grandmall.blr@vscinemas.com',
      boxOfficeHours: '9:00 AM - 11:30 PM Daily',
      manager: 'Sunita Menon (Guest Relations Lead)'
    },
    locationDetails: {
      address: 'Grand Forum Mall, Hosur Main Road, Koramangala 5th Block',
      city: 'Bengaluru',
      landmark: 'Next to Koramangala Police Station & Jyoti Nivas College',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      mapUrl: 'https://maps.google.com/?q=Koramangala+Bengaluru',
      parking: 'Basement levels B1 and B2 with online pre-booking',
      transit: 'Koramangala BMTC Junction bus stop right outside'
    },
    screens: [
      { id: 'th2-s1', screenNumber: 1, name: 'Screen 1 (Dolby Cinema)', type: 'Dolby Cinema', capacity: 310, sound: 'Dolby Atmos 64-Channel', projection: 'Christie 4K Laser', features: ['Dolby Vision HDR', 'Gliding Recliners'] },
      { id: 'th2-s2', screenNumber: 2, name: 'Screen 2 (Onyx LED)', type: 'Samsung Onyx LED', capacity: 220, sound: 'Harman Professional', projection: 'Active Matrix LED', features: ['DCI Certified 4K HDR', 'Zero Distortion Sound'] },
      { id: 'th2-s3', screenNumber: 3, name: 'Screen 3 (Atmos Gold)', type: 'Dolby Atmos', capacity: 180, sound: 'Dolby Atmos', projection: 'Barco 4K Laser', features: ['Plush Velvet Seating', 'Food & Drink Table'] },
      { id: 'th2-s4', screenNumber: 4, name: 'Screen 4 (Family Lounge)', type: 'Standard 2D', capacity: 240, sound: 'JBL 7.1', projection: 'NEC Digital 2K', features: ['Kids Booster Seats', 'Wide Armrests'] },
      { id: 'th2-s5', screenNumber: 5, name: 'Screen 5 (Classic)', type: 'Standard 2D', capacity: 190, sound: 'Dolby 7.1', projection: 'Barco 2K', features: ['Standard Stadium Rows', 'Fast Exit Corridors'] }
    ],
    availableShows: [
      { id: 'th2-sh1', time: '11:00 AM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (Dolby Cinema)', format: 'Dolby Vision', price: 320, language: 'English', status: 'Available' },
      { id: 'th2-sh2', time: '2:15 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (Dolby Cinema)', format: 'Dolby Vision', price: 360, language: 'English', status: 'Filling Fast' },
      { id: 'th2-sh3', time: '5:30 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 2 (Onyx LED)', format: 'Onyx 4K', price: 380, language: 'Telugu', status: 'Almost Full' },
      { id: 'th2-sh4', time: '8:45 PM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (Dolby Cinema)', format: 'Dolby Vision', price: 380, language: 'English', status: 'Filling Fast' }
    ]
  },
  {
    id: 'th-3',
    name: 'VS Cinemas 4DX Sensory - Cyber City',
    location: 'Electronics City Phase 1',
    address: 'Tech Boulevard, Velocity Mall, Electronics City Phase 1',
    city: 'Bengaluru',
    screensCount: 4,
    dailyShows: 16,
    soundSystem: '4DX Motion Sound System',
    facilities: ['4DX Dynamic Seats', 'Air & Water FX', 'Online Valet', 'Gaming Arcade', 'Cafeteria'],
    image: 'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 1190,
    contact: {
      phone: '+91 80 4355 1199',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'cybercity.blr@vscinemas.com',
      boxOfficeHours: '10:00 AM - 11:15 PM Daily',
      manager: 'Vikram Joshi (Operations Manager)'
    },
    locationDetails: {
      address: 'Tech Boulevard, Velocity Mall, Electronics City Phase 1',
      city: 'Bengaluru',
      landmark: 'Near Infosys Gate 1 & Toll Plaza',
      coordinates: { lat: 12.8452, lng: 77.6602 },
      mapUrl: 'https://maps.google.com/?q=Electronics+City+Bengaluru',
      parking: 'Corporate & Mall Valet Parking for 1200+ cars',
      transit: 'Electronics City Elevated Flyover & Yellow Line Metro'
    },
    screens: [
      { id: 'th3-s1', screenNumber: 1, name: 'Screen 1 (4DX Extreme)', type: '4DX 3D', capacity: 160, sound: 'JBL Professional 4DX Sound', projection: 'Barco 4K Laser', features: ['Roll, Pitch & Heave Seats', 'Snow, Rain & Scent Effects'] },
      { id: 'th3-s2', screenNumber: 2, name: 'Screen 2 (Dolby Atmos Prime)', type: 'Dolby Atmos', capacity: 250, sound: 'Dolby Atmos 9.1', projection: 'Christie Laser 4K', features: ['Acoustic Curved Walls', 'Premium Pushback Seats'] },
      { id: 'th3-s3', screenNumber: 3, name: 'Screen 3 (Laser 3D)', type: 'Laser 3D', capacity: 200, sound: 'Dolby 7.1', projection: 'Barco Laser', features: ['High Lumens Polarized 3D', 'Wide Aisles'] },
      { id: 'th3-s4', screenNumber: 4, name: 'Screen 4 (Executive)', type: 'Classic 2D', capacity: 170, sound: 'Dolby 7.1', projection: 'Sony 4K', features: ['Individual Armrests', 'Spacious Seating'] }
    ],
    availableShows: [
      { id: 'th3-sh1', time: '11:30 AM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (4DX Extreme)', format: '4DX 3D', price: 420, language: 'English', status: 'Available' },
      { id: 'th3-sh2', time: '3:00 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (4DX Extreme)', format: '4DX 3D', price: 420, language: 'English', status: 'Filling Fast' },
      { id: 'th3-sh3', time: '6:30 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 2 (Dolby Atmos Prime)', format: 'Dolby Atmos', price: 340, language: 'English', status: 'Almost Full' },
      { id: 'th3-sh4', time: '9:45 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 1 (4DX Extreme)', format: '4DX 3D', price: 450, language: 'Telugu', status: 'Filling Fast' }
    ]
  },
  {
    id: 'th-4',
    name: 'VS Cinemas Gold Class - Bay View Multiplex',
    location: 'Marine Lines & Marine Drive Promenade',
    address: 'Opposite Marine Drive Promenade, Marine Lines, South Mumbai',
    city: 'Mumbai',
    screensCount: 4,
    dailyShows: 16,
    soundSystem: 'THX Certified Ultraphonic',
    facilities: ['Gold Class Loungers', 'Butler Service', 'Private Screening', 'Gourmet Dining', 'Sea View Lounge'],
    image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 2100,
    contact: {
      phone: '+91 22 2281 9900',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'bayview.mum@vscinemas.com',
      boxOfficeHours: '9:30 AM - Midnight Daily',
      manager: 'Feroz Wadia (Director of Hospitality)'
    },
    locationDetails: {
      address: 'Opposite Marine Drive Promenade, Marine Lines, South Mumbai',
      city: 'Mumbai',
      landmark: 'Next to Cricket Club of India & Brabourne Stadium',
      coordinates: { lat: 18.9438, lng: 72.8234 },
      mapUrl: 'https://maps.google.com/?q=Marine+Drive+Mumbai',
      parking: 'Dedicated complimentary valet parking for all cinema patrons',
      transit: '5 minutes walk from Marine Lines Railway Station'
    },
    screens: [
      { id: 'th4-s1', screenNumber: 1, name: 'Screen 1 (Royal Gold Class)', type: 'Gold Class VIP', capacity: 110, sound: 'THX Spatial Sound', projection: 'Christie RealLaser 4K', features: ['Full Reclining Beds', 'Chef Menu Service', 'Cashmere Blankets'] },
      { id: 'th4-s2', screenNumber: 2, name: 'Screen 2 (Dolby Atmos Prime)', type: 'Dolby Atmos', capacity: 220, sound: 'Dolby Atmos 64-Channel', projection: 'Barco 4K Laser', features: ['Italian Leather Seats', 'Generous Pitch'] },
      { id: 'th4-s3', screenNumber: 3, name: 'Screen 3 (Celebrity Suite)', type: 'Private VIP', capacity: 70, sound: 'Bowers & Wilkins Spatial', projection: 'Sony 4K HDR', features: ['Private Screen Hire', 'Dedicated Lounge Bar'] },
      { id: 'th4-s4', screenNumber: 4, name: 'Screen 4 (Premiere)', type: 'Standard 2D', capacity: 190, sound: 'Dolby 7.1', projection: 'Barco 2K', features: ['High Tiered Seating', 'Direct Concession Link'] }
    ],
    availableShows: [
      { id: 'th4-sh1', time: '10:45 AM', movieTitle: 'Interstellar', screen: 'Screen 1 (Royal Gold Class)', format: 'Gold Class VIP', price: 650, language: 'English', status: 'Available' },
      { id: 'th4-sh2', time: '2:30 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (Royal Gold Class)', format: 'Gold Class VIP', price: 750, language: 'English', status: 'Filling Fast' },
      { id: 'th4-sh3', time: '6:15 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 2 (Dolby Atmos Prime)', format: 'Dolby Atmos', price: 420, language: 'English', status: 'Almost Full' },
      { id: 'th4-sh4', time: '9:30 PM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (Royal Gold Class)', format: 'Gold Class VIP', price: 800, language: 'English', status: 'Filling Fast' }
    ]
  },
  {
    id: 'th-5',
    name: 'VS Cinemas IMAX Dome - Phoenix Palladium',
    location: 'Lower Parel, Phoenix Mills Compound',
    address: 'Phoenix Palladium, 462 Senapati Bapat Marg, Lower Parel',
    city: 'Mumbai',
    screensCount: 7,
    dailyShows: 28,
    soundSystem: 'IMAX 12-Channel Precision & Dolby Atmos',
    facilities: ['IMAX Laser 3D', 'Dolby Cinema', 'Onyx LED', 'Luxury Lounge', 'Valet Parking', 'Wheelchair Access'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 2650,
    contact: {
      phone: '+91 22 6655 4321',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'palladium.mum@vscinemas.com',
      boxOfficeHours: '9:00 AM - Midnight Daily',
      manager: 'Kavita Singhal (Multiplex Operations Head)'
    },
    locationDetails: {
      address: 'Phoenix Palladium, 462 Senapati Bapat Marg, Lower Parel',
      city: 'Mumbai',
      landmark: 'Opposite High Street Phoenix & St. Regis Hotel',
      coordinates: { lat: 18.9954, lng: 72.8252 },
      mapUrl: 'https://maps.google.com/?q=Phoenix+Palladium+Mumbai',
      parking: 'Grand multi-level parking for 3000+ vehicles with EV points',
      transit: '10 min from Lower Parel Local Station & Monorail'
    },
    screens: [
      { id: 'th5-s1', screenNumber: 1, name: 'Screen 1 (IMAX Laser GT)', type: 'IMAX Laser 3D', capacity: 420, sound: 'IMAX 12-Channel Sound', projection: 'Dual 4K Laser Commercial GT', features: ['Massive 70mm Equivalent Screen', 'Sub-Bass Transducers'] },
      { id: 'th5-s2', screenNumber: 2, name: 'Screen 2 (Dolby Cinema)', type: 'Dolby Cinema', capacity: 310, sound: 'Dolby Atmos 128-Channel', projection: 'Dolby Vision 4K', features: ['Infinity Black Contrast', 'Acoustic Transparency'] },
      { id: 'th5-s3', screenNumber: 3, name: 'Screen 3 (4DX Dynamic)', type: '4DX 3D', capacity: 180, sound: 'JBL 7.1', projection: 'Barco 4K', features: ['Motion Synchronized Seats', 'Weather Effects'] },
      { id: 'th5-s4', screenNumber: 4, name: 'Screen 4 (Club Premiere)', type: 'Premiere 2D', capacity: 220, sound: 'Dolby 7.1', projection: 'Christie Laser', features: ['Extra Wide Recliners', 'Dedicated Food Service'] },
      { id: 'th5-s5', screenNumber: 5, name: 'Screen 5 (Classic)', type: 'Standard 2D', capacity: 200, sound: 'Dolby 7.1', projection: 'NEC 2K', features: ['Tiered Stadium Seating', 'Quick Exit Gates'] },
      { id: 'th5-s6', screenNumber: 6, name: 'Screen 6 (Gold Lounge)', type: 'Gold Class', capacity: 95, sound: 'THX Spatial', projection: 'Barco 4K', features: ['Full Power Recliners', 'Complimentary Popcorn'] },
      { id: 'th5-s7', screenNumber: 7, name: 'Screen 7 (Sensory Atmos)', type: 'Dolby Atmos', capacity: 180, sound: 'Dolby Atmos', projection: 'Christie 4K', features: ['Vibrating Seats', 'Dynamic Lighting'] }
    ],
    availableShows: [
      { id: 'th5-sh1', time: '10:00 AM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (IMAX Laser GT)', format: 'IMAX 3D', price: 450, language: 'English', status: 'Filling Fast' },
      { id: 'th5-sh2', time: '1:30 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 2 (Dolby Cinema)', format: 'Dolby Atmos', price: 380, language: 'Telugu', status: 'Almost Full' },
      { id: 'th5-sh3', time: '5:00 PM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (IMAX Laser GT)', format: 'IMAX 3D', price: 480, language: 'English', status: 'Filling Fast' },
      { id: 'th5-sh4', time: '8:30 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (IMAX Laser GT)', format: 'IMAX 3D', price: 460, language: 'English', status: 'Almost Full' }
    ]
  },
  {
    id: 'th-6',
    name: 'VS Cinemas Laser Plex - Ambience Horizon',
    location: 'NH-8, Ambience Island, Gurugram',
    address: 'Ambience Mall, NH-8, Ambience Island, Gurugram',
    city: 'Delhi NCR',
    screensCount: 6,
    dailyShows: 24,
    soundSystem: 'Dolby Atmos & Meyer Sound EXP',
    facilities: ['IMAX Laser 3D', '4DX Motion', 'Platinum Recliners', 'Café Express', 'Wheelchair Access', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 1720,
    contact: {
      phone: '+91 124 466 7788',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'ambience.del@vscinemas.com',
      boxOfficeHours: '9:30 AM - 11:30 PM Daily',
      manager: 'Amanpreet Singh (Operations Manager)'
    },
    locationDetails: {
      address: 'Ambience Mall, NH-8, Ambience Island, Gurugram',
      city: 'Delhi NCR',
      landmark: 'Next to The Leela Hotel & Cyber City Toll Gate',
      coordinates: { lat: 28.5042, lng: 77.0965 },
      mapUrl: 'https://maps.google.com/?q=Ambience+Mall+Gurugram',
      parking: 'Direct access to P3 and P4 parking with 4000+ slots',
      transit: 'Moulsari Avenue Rapid Metro Station (5 min walk)'
    },
    screens: [
      { id: 'th6-s1', screenNumber: 1, name: 'Screen 1 (IMAX Laser)', type: 'IMAX Laser 3D', capacity: 360, sound: 'Meyer Sound EXP & IMAX', projection: 'Dual 4K Laser', features: ['Massive Floor-to-Ceiling Screen', 'Plush VIP Seats'] },
      { id: 'th6-s2', screenNumber: 2, name: 'Screen 2 (Dolby Atmos Cinema)', type: 'Dolby Atmos', capacity: 280, sound: 'Dolby Atmos 64-Channel', projection: 'Barco 4K Laser', features: ['Acoustic Clarity', 'Motorized Footrests'] },
      { id: 'th6-s3', screenNumber: 3, name: 'Screen 3 (4DX Dynamic)', type: '4DX 3D', capacity: 160, sound: 'JBL 7.1', projection: 'Christie Laser', features: ['Motion Dynamic Seats', 'Wind, Scent & Bubble Effects'] },
      { id: 'th6-s4', screenNumber: 4, name: 'Screen 4 (Platinum Lounge)', type: 'Platinum VIP', capacity: 110, sound: 'THX Certified', projection: 'Barco 4K', features: ['Full Power Recliners', 'In-Seat Dining'] },
      { id: 'th6-s5', screenNumber: 5, name: 'Screen 5 (Classic)', type: 'Standard 2D', capacity: 210, sound: 'Dolby 7.1', projection: 'Sony 4K', features: ['Tiered Stadium Seating', 'Ergonomic Support'] },
      { id: 'th6-s6', screenNumber: 6, name: 'Screen 6 (Club)', type: 'Standard 2D', capacity: 180, sound: 'Dolby 7.1', projection: 'NEC 2K', features: ['Family Friendly Layout', 'Spacious Legroom'] }
    ],
    availableShows: [
      { id: 'th6-sh1', time: '10:30 AM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', price: 380, language: 'English', status: 'Available' },
      { id: 'th6-sh2', time: '2:00 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', price: 420, language: 'English', status: 'Filling Fast' },
      { id: 'th6-sh3', time: '5:45 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 2 (Dolby Atmos Cinema)', format: 'Dolby Atmos', price: 340, language: 'Telugu', status: 'Almost Full' },
      { id: 'th6-sh4', time: '9:15 PM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', price: 440, language: 'English', status: 'Filling Fast' }
    ]
  },
  {
    id: 'th-7',
    name: 'VS Cinemas Heritage - Connaught Circle',
    location: 'Inner Circle, Connaught Place',
    address: 'Block E, Inner Circle, Connaught Place, Central Delhi',
    city: 'Delhi NCR',
    screensCount: 4,
    dailyShows: 16,
    soundSystem: 'JBL Professional Sound & Dolby 7.1',
    facilities: ['Heritage Architecture', 'Art Deco Lounge', 'Dolby Atmos', 'Café Deli', 'Valet Desk'],
    image: 'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 1410,
    contact: {
      phone: '+91 11 2341 5566',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'heritage.del@vscinemas.com',
      boxOfficeHours: '9:30 AM - 11:15 PM Daily',
      manager: 'Deepak Sharma (Heritage Operations)'
    },
    locationDetails: {
      address: 'Block E, Inner Circle, Connaught Place, Central Delhi',
      city: 'Delhi NCR',
      landmark: 'Near Rajiv Chowk Metro Gate 5 & Central Park',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      mapUrl: 'https://maps.google.com/?q=Connaught+Place+Delhi',
      parking: 'NDMC underground multi-level parking at Shivaji Stadium & Palika',
      transit: '100 meters from Rajiv Chowk Metro Hub (Blue & Yellow Lines)'
    },
    screens: [
      { id: 'th7-s1', screenNumber: 1, name: 'Screen 1 (The Heritage Grand)', type: 'Dolby Atmos', capacity: 320, sound: 'Dolby Atmos 64-Channel', projection: 'Christie Laser 4K', features: ['Art Deco Grand Ceiling', 'Plush High-Back Seating'] },
      { id: 'th7-s2', screenNumber: 2, name: 'Screen 2 (Regal Cinema)', type: 'Dolby 7.1', capacity: 240, sound: 'JBL Professional', projection: 'Barco 4K', features: ['Acoustic Silk Drapery', 'Wide Row Spacing'] },
      { id: 'th7-s3', screenNumber: 3, name: 'Screen 3 (Director’s Lounge)', type: 'VIP Gold', capacity: 90, sound: 'THX Spatial', projection: 'Sony 4K', features: ['Electronic Recliners', 'Private Butler Service'] },
      { id: 'th7-s4', screenNumber: 4, name: 'Screen 4 (Classic 2D)', type: 'Standard 2D', capacity: 180, sound: 'Dolby 7.1', projection: 'NEC 2K', features: ['Comfort Foam Seats', 'Fast Booking Kiosks'] }
    ],
    availableShows: [
      { id: 'th7-sh1', time: '11:15 AM', movieTitle: 'Interstellar', screen: 'Screen 1 (The Heritage Grand)', format: 'Dolby Atmos', price: 290, language: 'English', status: 'Available' },
      { id: 'th7-sh2', time: '2:45 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (The Heritage Grand)', format: 'Dolby Atmos', price: 340, language: 'English', status: 'Filling Fast' },
      { id: 'th7-sh3', time: '6:30 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 2 (Regal Cinema)', format: 'Dolby 7.1', price: 310, language: 'Telugu', status: 'Almost Full' },
      { id: 'th7-sh4', time: '9:45 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (The Heritage Grand)', format: 'Dolby Atmos', price: 350, language: 'English', status: 'Available' }
    ]
  },
  {
    id: 'th-8',
    name: 'VS Cinemas Dolby Vision - Marina Waves',
    location: 'Anna Salai & Express Avenue, Royapettah',
    address: 'Express Avenue Mall, 49/50 Whites Road, Royapettah',
    city: 'Chennai',
    screensCount: 5,
    dailyShows: 20,
    soundSystem: 'Dolby Atmos 128 Channel & QSC Quantum',
    facilities: ['Dolby Cinema', 'IMAX Laser 3D', 'Gold Class Recliners', 'South Indian Gourmet Kitchen', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 1980,
    contact: {
      phone: '+91 44 2846 3311',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'marinawaves.chn@vscinemas.com',
      boxOfficeHours: '9:00 AM - 11:45 PM Daily',
      manager: 'Karthik Subramanian (Regional Lead)'
    },
    locationDetails: {
      address: 'Express Avenue Mall, 49/50 Whites Road, Royapettah',
      city: 'Chennai',
      landmark: 'Near Thousand Lights Mosque & Spencer Plaza',
      coordinates: { lat: 13.0583, lng: 78.0261 },
      mapUrl: 'https://maps.google.com/?q=Express+Avenue+Chennai',
      parking: 'Extensive 3-tier underground parking with digital space indicators',
      transit: 'Thousand Lights Metro Station (Blue Line) - 300m away'
    },
    screens: [
      { id: 'th8-s1', screenNumber: 1, name: 'Screen 1 (IMAX Laser)', type: 'IMAX Laser 3D', capacity: 370, sound: 'Dolby Atmos 128-Channel', projection: 'Dual 4K Laser RealDepth', features: ['Massive Curvature Screen', 'VIP Leather Seats'] },
      { id: 'th8-s2', screenNumber: 2, name: 'Screen 2 (Dolby Vision Cinema)', type: 'Dolby Cinema', capacity: 290, sound: 'Dolby Atmos Surround', projection: 'Dolby Vision Dual 4K', features: ['HDR 1000 Nits Brightness', 'Gliding Recliners'] },
      { id: 'th8-s3', screenNumber: 3, name: 'Screen 3 (4DX Dynamic)', type: '4DX 3D', capacity: 160, sound: 'JBL 7.1', projection: 'Barco 4K', features: ['Hydraulic Motion Seats', 'Environmental FX'] },
      { id: 'th8-s4', screenNumber: 4, name: 'Screen 4 (Gold Class Luxe)', type: 'Gold Class', capacity: 95, sound: 'THX Spatial', projection: 'Christie Laser', features: ['Electronic Full Flat Recliners', 'Live Food Order Service'] },
      { id: 'th8-s5', screenNumber: 5, name: 'Screen 5 (Classic)', type: 'Standard 2D', capacity: 210, sound: 'Dolby 7.1', projection: 'NEC 2K', features: ['Stadium Row Clearance', 'Acoustic Wall Panels'] }
    ],
    availableShows: [
      { id: 'th8-sh1', time: '10:30 AM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', price: 360, language: 'Tamil', status: 'Filling Fast' },
      { id: 'th8-sh2', time: '2:00 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 2 (Dolby Vision Cinema)', format: 'Dolby Vision', price: 340, language: 'English', status: 'Available' },
      { id: 'th8-sh3', time: '5:45 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', price: 380, language: 'English', status: 'Almost Full' },
      { id: 'th8-sh4', time: '9:15 PM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', price: 400, language: 'English', status: 'Filling Fast' }
    ]
  },
  {
    id: 'th-9',
    name: 'VS Cinemas SuperPlex - Hitec City Boulevard',
    location: 'Cyberabad IT Corridor, Hitec City',
    address: 'Inorbit Mall, Mindspace IT Park, Hitec City, Madhapur',
    city: 'Hyderabad',
    screensCount: 6,
    dailyShows: 24,
    soundSystem: 'Dolby Atmos & Christie Vive Audio',
    facilities: ['IMAX Laser 3D', 'Dolby Atmos', '4DX Motion', 'Hyderabadi Delicacies Lounge', 'Valet Parking', 'Wheelchair Access'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 2240,
    contact: {
      phone: '+91 40 4788 6622',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'hiteccity.hyd@vscinemas.com',
      boxOfficeHours: '9:00 AM - Midnight Daily',
      manager: 'Venkat Rao (Operations General Manager)'
    },
    locationDetails: {
      address: 'Inorbit Mall, Mindspace IT Park, Hitec City, Madhapur',
      city: 'Hyderabad',
      landmark: 'Overlooking Durgam Cheruvu Lake & Mindspace Gate 2',
      coordinates: { lat: 17.4348, lng: 78.3846 },
      mapUrl: 'https://maps.google.com/?q=Inorbit+Mall+Hitec+City+Hyderabad',
      parking: 'Basement and open valet bays for 2500+ vehicles with charging slots',
      transit: 'Direct connectivity to Hitec City Metro Station (Blue Line)'
    },
    screens: [
      { id: 'th9-s1', screenNumber: 1, name: 'Screen 1 (IMAX Laser 3D)', type: 'IMAX Laser 3D', capacity: 390, sound: 'Dolby Atmos 128-Channel', projection: 'Dual 4K Laser RealDepth', features: ['Colossal Screen Area', 'Custom Ergonomic Recliners'] },
      { id: 'th9-s2', screenNumber: 2, name: 'Screen 2 (Christie Vive Atmos)', type: 'Dolby Atmos', capacity: 300, sound: 'Christie Vive Ribbon Drivers', projection: 'Barco 4K Laser', features: ['Ribbon Driver Audio Purity', 'Wide Seat Pitch'] },
      { id: 'th9-s3', screenNumber: 3, name: 'Screen 3 (4DX Dynamic)', type: '4DX 3D', capacity: 160, sound: 'JBL 7.1', projection: 'Christie Laser', features: ['Motion Tilt Seats', 'Water, Rain & Snow FX'] },
      { id: 'th9-s4', screenNumber: 4, name: 'Screen 4 (Gold Class)', type: 'Gold Class', capacity: 100, sound: 'THX Spatial', projection: 'Sony 4K', features: ['Motorized Recliners', 'Dedicated Butler Call Button'] },
      { id: 'th9-s5', screenNumber: 5, name: 'Screen 5 (Classic 2D)', type: 'Standard 2D', capacity: 220, sound: 'Dolby 7.1', projection: 'NEC 2K', features: ['Plush Velvet Cushions', 'Fast Turnstiles'] },
      { id: 'th9-s6', screenNumber: 6, name: 'Screen 6 (Club)', type: 'Standard 2D', capacity: 190, sound: 'Dolby 7.1', projection: 'Barco 2K', features: ['Generous Legroom', 'Snack Console'] }
    ],
    availableShows: [
      { id: 'th9-sh1', time: '10:00 AM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 1 (IMAX Laser 3D)', format: 'IMAX 3D', price: 380, language: 'Telugu', status: 'Filling Fast' },
      { id: 'th9-sh2', time: '1:45 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (IMAX Laser 3D)', format: 'IMAX 3D', price: 420, language: 'English', status: 'Available' },
      { id: 'th9-sh3', time: '5:30 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 2 (Christie Vive Atmos)', format: 'Dolby Atmos', price: 340, language: 'Telugu', status: 'Almost Full' },
      { id: 'th9-sh4', time: '8:45 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 1 (IMAX Laser 3D)', format: 'IMAX 3D', price: 400, language: 'English', status: 'Filling Fast' }
    ]
  },
  {
    id: 'th-10',
    name: 'VS Cinemas Waterfront - Marine Drive Galleria',
    location: 'Marine Drive Waterfront Promenade',
    address: 'LuLu International Mall & Waterfront, Edappally / Marine Drive',
    city: 'Kochi',
    screensCount: 5,
    dailyShows: 20,
    soundSystem: 'Barco 4K Laser & Dolby Atmos 64-Channel',
    facilities: ['Dolby Atmos', '4DX Sensory', 'Waterfront Dining Lounge', 'VIP Loungers', 'Wheelchair Access', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 1380,
    contact: {
      phone: '+91 484 272 1199',
      helpline: '1800-425-9999 (Toll Free)',
      email: 'waterfront.koc@vscinemas.com',
      boxOfficeHours: '9:30 AM - 11:30 PM Daily',
      manager: 'Mathew Varghese (Station Operations)'
    },
    locationDetails: {
      address: 'LuLu International Mall & Waterfront, Edappally / Marine Drive',
      city: 'Kochi',
      landmark: 'Near Edappally Junction & Rainbow Hanging Bridge',
      coordinates: { lat: 10.0236, lng: 76.3116 },
      mapUrl: 'https://maps.google.com/?q=LuLu+Mall+Kochi',
      parking: 'Multi-deck car park with 3500+ bays and dedicated two-wheeler floor',
      transit: 'Direct pedestrian bridge from Edappally Kochi Metro Station'
    },
    screens: [
      { id: 'th10-s1', screenNumber: 1, name: 'Screen 1 (Dolby Atmos Grand)', type: 'Dolby Atmos', capacity: 330, sound: 'Dolby Atmos 64-Channel', projection: 'Barco 4K Laser', features: ['Deep Bass Subwoofers', 'VIP Glider Recliners'] },
      { id: 'th10-s2', screenNumber: 2, name: 'Screen 2 (4DX Motion)', type: '4DX 3D', capacity: 160, sound: 'JBL 7.1', projection: 'Christie Laser', features: ['Synchronized Motion Seats', 'Ocean Breeze & Fog FX'] },
      { id: 'th10-s3', screenNumber: 3, name: 'Screen 3 (Gold Class)', type: 'Gold Class', capacity: 90, sound: 'THX Spatial', projection: 'Barco Laser', features: ['Full Flat Recliners', 'Local Kerala Delicacy Service'] },
      { id: 'th10-s4', screenNumber: 4, name: 'Screen 4 (Classic 2D)', type: 'Standard 2D', capacity: 210, sound: 'Dolby 7.1', projection: 'NEC 2K', features: ['Wide Seating Pitch', 'Snack Trays'] },
      { id: 'th10-s5', screenNumber: 5, name: 'Screen 5 (Classic 2D)', type: 'Standard 2D', capacity: 180, sound: 'Dolby 7.1', projection: 'Sony 4K', features: ['Stadium Raking', 'Quick Aisles'] }
    ],
    availableShows: [
      { id: 'th10-sh1', time: '10:15 AM', movieTitle: 'Avatar: The Way of Water', screen: 'Screen 1 (Dolby Atmos Grand)', format: 'Dolby Atmos', price: 320, language: 'English', status: 'Available' },
      { id: 'th10-sh2', time: '1:45 PM', movieTitle: 'Kalki 2898 AD', screen: 'Screen 1 (Dolby Atmos Grand)', format: 'Dolby Atmos', price: 340, language: 'Malayalam', status: 'Filling Fast' },
      { id: 'th10-sh3', time: '5:30 PM', movieTitle: 'Spider-Man: Beyond the Spider-Verse', screen: 'Screen 2 (4DX Motion)', format: '4DX 3D', price: 380, language: 'English', status: 'Almost Full' },
      { id: 'th10-sh4', time: '8:45 PM', movieTitle: 'Dune: Part Two', screen: 'Screen 1 (Dolby Atmos Grand)', format: 'Dolby Atmos', price: 350, language: 'English', status: 'Filling Fast' }
    ]
  }
]

// Distinct City Filter Options
export const THEATRE_CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Hyderabad', 'Kochi']

// Module 4: Theatre Listing & Discovery Service Engine
export const theatreService = {
  async getTheatresList({ city = '', search = '', page = 1, limit = 6 } = {}) {
    let filtered = [...THEATRES_LIST]

    // City Filter
    if (city && city.trim() !== '' && city.toLowerCase() !== 'all cities') {
      filtered = filtered.filter(
        (t) => t.city.toLowerCase() === city.toLowerCase()
      )
    }

    // Search Query Filter
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          (t.facilities && t.facilities.some((f) => f.toLowerCase().includes(q))) ||
          (t.screens && t.screens.some((s) => s.type.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))) ||
          (t.availableShows && t.availableShows.some((sh) => sh.movieTitle.toLowerCase().includes(q)))
      )
    }

    const totalResults = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalResults / limit))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const startIndex = (safePage - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    return {
      theatres: paginated,
      totalResults,
      totalPages,
      currentPage: safePage,
      limit,
      cities: THEATRE_CITIES
    }
  },

  async getTheatreDetails(theatreId) {
    const found = THEATRES_LIST.find((t) => String(t.id) === String(theatreId))
    if (!found) {
      throw new Error(`Theatre with ID "${theatreId}" could not be found.`)
    }
    return found
  },

  getCities() {
    return THEATRE_CITIES
  }
}

// Seat Tiers & Layout Constants for Module 5: Seat Selection (Matching Reference Layout)
export const SEAT_TIERS = {
  EXECUTIVE: {
    id: 'EXECUTIVE',
    name: 'Executive',
    rows: ['F', 'E'],
    basePrice: 250,
    badge: 'Upper Tier',
    description: 'Elevated cinema seating with panoramic screen view'
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    rows: ['D', 'C'],
    basePrice: 340,
    badge: 'Club Prime',
    description: 'Central acoustic sweet spot with wide legroom'
  },
  PLATINUM: {
    id: 'PLATINUM',
    name: 'Platinum',
    rows: ['B', 'A'],
    basePrice: 640,
    badge: 'VIP Front Tier',
    description: 'Luxury plush seating with premium viewing proximity'
  }
}

export const AUDITORIUM_TIERS_CONFIG = [
  {
    tierId: 'EXECUTIVE',
    name: 'Executive',
    defaultPrice: 250,
    rows: [
      {
        row: 'F',
        leftSeats: [1, 2, 3, 4],
        rightSeats: [5, 6, 7, 8],
        indentClass: 'sm:pl-6 sm:pr-6'
      },
      {
        row: 'E',
        leftSeats: [1, 2, 3, 4, 5],
        rightSeats: [6, 7, 8, 9, 10],
        indentClass: ''
      }
    ]
  },
  {
    tierId: 'PREMIUM',
    name: 'Premium',
    defaultPrice: 340,
    rows: [
      {
        row: 'D',
        leftSeats: [1, 2, 3, 4, 5],
        rightSeats: [6, 7, 8, 9, 10, 11, 12],
        indentClass: ''
      },
      {
        row: 'C',
        leftSeats: [1, 2, 3, 4, 5, 6, 7],
        rightSeats: [8, 9, 10, 11, 12, 13, 14],
        indentClass: ''
      }
    ]
  },
  {
    tierId: 'PLATINUM',
    name: 'Platinum',
    defaultPrice: 640,
    rows: [
      {
        row: 'B',
        leftSeats: [1, 2, 3, 4, 5],
        rightSeats: [6, 7, 8, 9, 10, 11, 12],
        indentClass: ''
      },
      {
        row: 'A',
        leftSeats: [1, 2, 3, 4, 5, 6, 7],
        rightSeats: [8, 9, 10, 11, 12, 13, 14, 15],
        indentClass: ''
      }
    ]
  }
]

export function getSeatTierPrice(seatId, defaultPrice = 280) {
  if (!seatId) return defaultPrice
  const row = seatId.charAt(0)
  if (['F', 'E'].includes(row)) return 250
  if (['D', 'C'].includes(row)) return 340
  if (['B', 'A'].includes(row)) return 640
  return defaultPrice
}

export const INITIAL_BOOKED_SEATS = [
  // Executive Row F
  'F3', 'F4', 'F6', 'F8',
  // Executive Row E
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10',
  // Premium Row D
  'D3', 'D4', 'D5', 'D6', 'D12',
  // Premium Row C
  'C5', 'C6', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14',
  // Platinum Row B
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
  // Platinum Row A
  'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A13', 'A14'
]

export const MAX_SEAT_LIMIT = 8

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
    movieTitle: 'Creed III',
    screen: 'Screen 02 (Dolby Cinema)',
    showtime: '7:45 PM',
    seats: ['D13', 'D14'],
    row: 'D',
    pricePerSeat: 260,
    baseTicketsTotal: 520,
    convenienceFee: 45,
    gst: 8.1,
    totalAmount: 520,
    paymentMethod: 'Credit Card (•••• 4242)',
    userEmail: 'vishnu.ramesh@gmail.com',
    userName: 'Vishnu Ramesh',
    date: 'Today',
    createdAt: '2026-10-01T14:15:00.000Z',
    status: 'Confirmed',
    poster: 'https://image.tmdb.org/t/p/w500/cvsXj3I9Q00I9igWv1hv39RuwNJ.jpg',
    theatreId: 'th-1',
    theatreName: 'VS Cinemas IMAX Laser - Central Galleria',
    director: 'Michael B. Jordan',
    language: 'English',
    genre: 'Drama / Action'
  },
  {
    id: 'VS-7841',
    movieTitle: 'Avatar: The Way of Water',
    screen: 'Screen 01 (Dolby Cinema)',
    showtime: '9:00 PM',
    seats: ['C3', 'C4', 'C5'],
    row: 'C',
    pricePerSeat: 260,
    baseTicketsTotal: 780,
    convenienceFee: 45,
    gst: 8.1,
    totalAmount: 780,
    paymentMethod: 'UPI (vishnu@okhdfcbank)',
    userEmail: 'vishnu.ramesh@gmail.com',
    userName: 'Vishnu Ramesh',
    date: 'Today',
    createdAt: '2026-10-01T13:40:00.000Z',
    status: 'Confirmed',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    theatreId: 'th-2',
    theatreName: 'VS Cinemas Dolby Cinema - Grand Mall',
    director: 'James Cameron',
    language: 'English',
    genre: 'Sci-Fi / Adventure'
  },
  {
    id: 'VS-7840',
    movieTitle: 'Oppenheimer',
    screen: 'Screen 01 (70mm IMAX)',
    showtime: '4:00 PM',
    seats: ['D6', 'D7'],
    row: 'D',
    pricePerSeat: 300,
    baseTicketsTotal: 600,
    convenienceFee: 45,
    gst: 8.1,
    totalAmount: 600,
    paymentMethod: 'Net Banking (HDFC Bank)',
    userEmail: 'vishnu.ramesh@gmail.com',
    userName: 'Vishnu Ramesh',
    date: '28 Sep 2026',
    createdAt: '2026-09-28T11:20:00.000Z',
    status: 'Completed',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    theatreId: 'th-5',
    theatreName: 'VS Cinemas IMAX Dome - Phoenix Palladium',
    director: 'Christopher Nolan',
    language: 'English',
    genre: 'Biography / Drama'
  },
  {
    id: 'VS-7839',
    movieTitle: 'Dune: Part Two',
    screen: 'Screen 01 (IMAX Laser 3D)',
    showtime: '5:00 PM',
    seats: ['E4', 'E5'],
    row: 'E',
    pricePerSeat: 420,
    baseTicketsTotal: 840,
    convenienceFee: 45,
    gst: 8.1,
    totalAmount: 840,
    paymentMethod: 'Credit Card (•••• 8821)',
    userEmail: 'vishnu.ramesh@gmail.com',
    userName: 'Vishnu Ramesh',
    date: 'Tomorrow',
    createdAt: '2026-10-01T10:00:00.000Z',
    status: 'Confirmed',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    theatreId: 'th-1',
    theatreName: 'VS Cinemas IMAX Laser - Central Galleria',
    director: 'Denis Villeneuve',
    language: 'English',
    genre: 'Sci-Fi / Adventure'
  },
  {
    id: 'VS-7838',
    movieTitle: 'Spider-Man: Beyond the Spider-Verse',
    screen: 'Screen 01 (IMAX Laser 3D)',
    showtime: '7:45 PM',
    seats: ['B3', 'B4'],
    row: 'B',
    pricePerSeat: 380,
    baseTicketsTotal: 760,
    convenienceFee: 45,
    gst: 8.1,
    totalAmount: 760,
    paymentMethod: 'Paytm Wallet',
    userEmail: 'vishnu.ramesh@gmail.com',
    userName: 'Vishnu Ramesh',
    date: '25 Sep 2026',
    createdAt: '2026-09-25T15:30:00.000Z',
    status: 'Completed',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    theatreId: 'th-1',
    theatreName: 'VS Cinemas IMAX Laser - Central Galleria',
    director: 'Joaquim Dos Santos',
    language: 'English',
    genre: 'Animation / Action'
  },
  {
    id: 'VS-7837',
    movieTitle: 'Godzilla x Kong: The New Empire',
    screen: 'Screen 02 (Dolby Cinema)',
    showtime: '8:30 PM',
    seats: ['D1', 'D2'],
    row: 'D',
    pricePerSeat: 340,
    baseTicketsTotal: 680,
    convenienceFee: 45,
    gst: 8.1,
    totalAmount: 680,
    paymentMethod: 'Debit Card (•••• 1109)',
    userEmail: 'vishnu.ramesh@gmail.com',
    userName: 'Vishnu Ramesh',
    date: '20 Sep 2026',
    createdAt: '2026-09-20T18:00:00.000Z',
    status: 'Cancelled',
    cancelledAt: '2026-09-20T19:15:00.000Z',
    cancellationReason: 'Change of schedule / personal plans',
    refundStatus: 'Refund Credited',
    refundAmount: 612,
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    theatreId: 'th-2',
    theatreName: 'VS Cinemas Dolby Cinema - Grand Mall',
    director: 'Adam Wingard',
    language: 'English',
    genre: 'Action / Sci-Fi'
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
        const castMembers = (show['_embedded']?.cast || []).slice(0, 6).map((c) => ({
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

  // Retrieve booked seats for a movie, showtime, date, and theatre
  getBookedSeats(movieTitle, showtime, date, theatreId) {
    try {
      const stored = localStorage.getItem('vscinemas_bookings')
      const bookedSet = new Set(INITIAL_BOOKED_SEATS)
      if (stored) {
        const bookings = JSON.parse(stored)
        bookings.forEach((b) => {
          const matchTitle = !movieTitle || b.movieTitle?.toLowerCase() === movieTitle?.toLowerCase()
          const matchTime = !showtime || b.showtime === showtime
          const matchDate = !date || !b.date || b.date === date
          const matchTheatre = !theatreId || !b.theatreId || String(b.theatreId) === String(theatreId)
          if (matchTitle && matchTime && matchDate && matchTheatre && Array.isArray(b.seats)) {
            b.seats.forEach((seat) => bookedSet.add(seat))
          }
        })
      }
      return Array.from(bookedSet)
    } catch {
      return INITIAL_BOOKED_SEATS
    }
  },

  // Store confirmed booking in local storage with strict DUPLICATE BOOKING PREVENTION
  async bookTickets(bookingData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem('vscinemas_bookings')
          const bookings = stored ? JSON.parse(stored) : []

          // 1. Validation: At least one seat
          if (!bookingData.seats || bookingData.seats.length === 0) {
            return reject(new Error('Please select at least 1 seat to complete booking.'))
          }

          // 2. Validation: Max seat limit
          if (bookingData.seats.length > MAX_SEAT_LIMIT) {
            return reject(new Error(`Selection exceeds maximum limit of ${MAX_SEAT_LIMIT} seats per booking.`))
          }

          // 3. PREVENT DUPLICATE BOOKINGS: Check if any requested seat is already booked for this exact show
          const alreadyBooked = movieService.getBookedSeats(
            bookingData.movieTitle,
            bookingData.showtime,
            bookingData.date,
            bookingData.theatreId
          )

          const conflictSeats = (bookingData.seats || []).filter((seat) => alreadyBooked.includes(seat))
          if (conflictSeats.length > 0) {
            return reject(
              new Error(
                `Duplicate Booking Prevented: Seat(s) ${conflictSeats.join(', ')} have already been booked for this show.`
              )
            )
          }

          // 4. Generate unique, authentic Booking ID: VS-BK-XXXXX
          const bookingId = `VS-BK-${Math.floor(10000 + Math.random() * 90000)}`
          const newBooking = {
            id: bookingId,
            createdAt: new Date().toISOString(),
            date: bookingData.date || 'Today',
            status: 'Confirmed',
            ...bookingData
          }

          bookings.unshift(newBooking)
          localStorage.setItem('vscinemas_bookings', JSON.stringify(bookings))
          notifyBookingsChanged(bookings)
          resolve({ success: true, booking: newBooking })
        } catch (err) {
          reject(err)
        }
      }, 350)
    })
  },

  // Cancel an active booking and record refund status (Module 8 Feature: Cancel Booking)
  async cancelBooking(bookingId, reason = 'Customer requested cancellation') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem('vscinemas_bookings')
          let bookings = stored ? JSON.parse(stored) : [...INITIAL_RECENT_BOOKINGS]
          const targetIndex = bookings.findIndex((b) => b.id === bookingId)
          if (targetIndex === -1) {
            return reject(new Error(`Booking with ID "${bookingId}" could not be found.`))
          }

          const existing = bookings[targetIndex]
          const refundAmount = Math.round((Number(existing.totalAmount) || 0) * 0.9) // 90% refund after nominal fee
          const updatedBooking = {
            ...existing,
            status: 'Cancelled',
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
            refundStatus: 'Refund Initiated',
            refundAmount,
            refundTxnId: `REF-${Math.floor(100000 + Math.random() * 900000)}`
          }

          bookings[targetIndex] = updatedBooking
          localStorage.setItem('vscinemas_bookings', JSON.stringify(bookings))
          notifyBookingsChanged(bookings)
          resolve({ success: true, booking: updatedBooking })
        } catch (err) {
          reject(err)
        }
      }, 300)
    })
  }
}

// Real-Time Event Dispatcher for in-tab and cross-tab synchronization
export const notifyBookingsChanged = (updatedBookings) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vscinemas_bookings_updated', {
        detail: { bookings: updatedBookings, timestamp: Date.now() }
      })
    )
  }
}

// Live Booking Service Export with Real-time Subscription
export const bookingService = {
  getBookedSeats: (...args) => movieService.getBookedSeats(...args),
  bookTickets: (...args) => movieService.bookTickets(...args),
  cancelBooking: (...args) => movieService.cancelBooking(...args),
  getAllBookings: () => {
    try {
      const stored = localStorage.getItem('vscinemas_bookings')
      return stored ? JSON.parse(stored) : INITIAL_RECENT_BOOKINGS
    } catch {
      return INITIAL_RECENT_BOOKINGS
    }
  },

  // Real-Time Event Subscription (listens for in-tab custom events & cross-tab storage changes)
  subscribe: (callback) => {
    if (typeof window === 'undefined') return () => {}

    const handleCustom = (e) => {
      callback(e.detail?.bookings || bookingService.getAllBookings())
    }
    const handleStorage = (e) => {
      if (e.key === 'vscinemas_bookings' || !e.key) {
        callback(bookingService.getAllBookings())
      }
    }

    window.addEventListener('vscinemas_bookings_updated', handleCustom)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('vscinemas_bookings_updated', handleCustom)
      window.removeEventListener('storage', handleStorage)
    }
  }
}
