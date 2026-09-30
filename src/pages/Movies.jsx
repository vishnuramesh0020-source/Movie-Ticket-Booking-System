import React, { useState, useEffect } from 'react'
import {
  Film,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import TrailerModal from '../components/TrailerModal'
import BookingModal from '../components/BookingModal'
import TicketModal from '../components/TicketModal'
import {
  movieService,
  GENRES_LIST,
  LANGUAGES_LIST,
  RATING_OPTIONS,
  SORT_OPTIONS
} from '../services/api'
import { useAuth } from '../context/AuthContext'

const MOVIE_SKELETON_SLOTS = ['mskel-1', 'mskel-2', 'mskel-3', 'mskel-4', 'mskel-5', 'mskel-6', 'mskel-7', 'mskel-8']

export default function Movies() {
  const { user } = useAuth()

  // State management
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & Sorting & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all' | 'now_playing' | 'upcoming'
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [selectedSort, setSelectedSort] = useState('release_date.desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  // Modals state
  const [trailerMovie, setTrailerMovie] = useState(null)
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [bookingMovie, setBookingMovie] = useState(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)
  const [isTicketOpen, setIsTicketOpen] = useState(false)

  // Debounce search query input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page when any filter or sort changes
  const handleFilterChange = (setter, value) => {
    setIsLoading(true)
    setter(value)
    setCurrentPage(1)
  }

  // Load movies from third-party TMDB API
  useEffect(() => {
    let ignore = false

    const loadMovies = async () => {
      try {
        const res = await movieService.getMoviesList({
          page: currentPage,
          category: selectedCategory,
          genre: selectedGenre,
          language: selectedLanguage,
          rating: selectedRating,
          sortBy: selectedSort,
          search: debouncedSearch
        })

        if (!ignore) {
          setMovies(res.movies || [])
          setTotalPages(Math.max(1, res.totalPages || 1))
          setTotalResults(res.totalResults || res.movies.length)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch movies:', err)
          setError(err.message || 'Unable to fetch movies from third-party cinema servers.')
          setIsLoading(false)
          toast.error('Could not connect to cinema API.')
        }
      }
    }

    loadMovies()
    return () => {
      ignore = true
    }
  }, [currentPage, selectedCategory, selectedGenre, selectedLanguage, selectedRating, selectedSort, debouncedSearch])

  // Retry action
  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    movieService
      .getMoviesList({
        page: currentPage,
        category: selectedCategory,
        genre: selectedGenre,
        language: selectedLanguage,
        rating: selectedRating,
        sortBy: selectedSort,
        search: debouncedSearch
      })
      .then((res) => {
        setMovies(res.movies || [])
        setTotalPages(Math.max(1, res.totalPages || 1))
        setTotalResults(res.totalResults || res.movies.length)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Unable to fetch movies from third-party cinema servers.')
        setIsLoading(false)
      })
  }

  // Reset all filters to default
  const handleResetFilters = () => {
    setIsLoading(true)
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedCategory('all')
    setSelectedGenre('')
    setSelectedLanguage('')
    setSelectedRating('')
    setSelectedSort('release_date.desc')
    setCurrentPage(1)
  }

  const isAnyFilterActive =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'all' ||
    selectedGenre !== '' ||
    selectedLanguage !== '' ||
    selectedRating !== '' ||
    selectedSort !== 'release_date.desc'

  // Modal Triggers
  const handleWatchTrailer = (movie) => {
    setTrailerMovie(movie)
    setIsTrailerOpen(true)
  }

  const handleOpenBooking = (movie) => {
    setBookingMovie(movie)
    setIsBookingOpen(true)
  }

  const handleConfirmBooking = async (payload) => {
    try {
      const bookingPayload = {
        ...payload,
        userEmail: user?.email || 'guest@vscinemas.com',
        userName: user?.name || 'Valued Guest'
      }
      const res = await movieService.bookTickets(bookingPayload)
      if (res.success) {
        toast.success(`🎉 Booked ${payload.seats.length} ticket(s) for "${payload.movieTitle}"!`)
        setIsBookingOpen(false)
        setActiveTicket(res.booking)
        setIsTicketOpen(true)
      }
    } catch (err) {
      toast.error(err.message || 'Booking transaction failed. Please retry.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f3f8] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Top Header Bar */}
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* ========================================================
            PAGE HERO BANNER
            ======================================================== */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#023e73] via-[#045296] to-[#007bff] text-white p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Theatrical Releases & Movie Explorer
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
                Discover the latest blockbuster releases, sort by release date, filter by language & genre, watch theatrical trailers, and reserve premium cinema seats.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-right">
                <span className="text-[11px] text-blue-200 block font-medium">Available Movies</span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {isLoading ? '...' : totalResults.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FILTER & SORT TOOLBAR
            ======================================================== */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            {/* Category Tabs: Synchronized with Dashboard */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleFilterChange(setSelectedCategory, 'all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#007bff] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                All Releases
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange(setSelectedCategory, 'now_playing')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'now_playing'
                    ? 'bg-[#007bff] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                Now Playing
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange(setSelectedCategory, 'upcoming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'upcoming'
                    ? 'bg-[#007bff] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                Upcoming Releases
              </button>
            </div>

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Search Titles
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movie name..."
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-8.5 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear Search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Genre */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Genre
              </label>
              <div className="relative">
                <select
                  value={selectedGenre}
                  onChange={(e) => handleFilterChange(setSelectedGenre, e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none"
                >
                  {GENRES_LIST.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter by Language */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Language
              </label>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleFilterChange(setSelectedLanguage, e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none"
                >
                  {LANGUAGES_LIST.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter by Rating */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Rating
              </label>
              <div className="relative">
                <select
                  value={selectedRating}
                  onChange={(e) => handleFilterChange(setSelectedRating, e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none"
                >
                  {RATING_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort by Release Date & Metrics */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => handleFilterChange(setSelectedSort, e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ERROR STATE
            ======================================================== */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center justify-between gap-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h2 className="text-sm font-bold">API Connectivity Notice</h2>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ========================================================
            LOADING SHIMMER SKELETONS
            ======================================================== */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {MOVIE_SKELETON_SLOTS.map((skelId) => (
              <div
                key={skelId}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-[2/3] bg-slate-200 rounded-xl w-full" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            EMPTY RESULTS STATE
            ======================================================== */}
        {!isLoading && !error && movies.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">No Movies Found</h2>
              <p className="text-xs text-slate-500 mt-1">
                No cinematic releases match your active filters or search query. Try broadening your criteria.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#007bff] hover:bg-[#0062cc] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ========================================================
            MOVIE LIST GRID (EACH CARD RENDERS ALL 9 REQUIRED ITEMS)
            ======================================================== */}
        {!isLoading && !error && movies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchTrailer={handleWatchTrailer}
                onBookTicket={handleOpenBooking}
              />
            ))}
          </div>
        )}

        {/* ========================================================
            PAGINATION CONTROLS
            ======================================================== */}
        {!isLoading && !error && movies.length > 0 && totalPages > 1 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">
              Showing Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span> ({totalResults.toLocaleString('en-IN')} releases)
            </div>

            <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Dynamic Page Buttons */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pageNum = idx + 1
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + idx
                  }
                  if (pageNum > totalPages) {
                    pageNum = totalPages - (4 - idx)
                  }
                }

                const isActive = pageNum === currentPage

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-[#007bff] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Trailer Modal (UI Only) */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movie={trailerMovie}
        onBook={handleOpenBooking}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        movie={bookingMovie}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        ticket={activeTicket}
      />
    </div>
  )
}
