import { useState, useEffect } from 'react'
import {
  Building2,
  Search,
  MapPin,
  RefreshCw,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import TheatreCard from '../components/TheatreCard'
import BookingModal from '../components/BookingModal'
import TicketModal from '../components/TicketModal'
import { theatreService, THEATRE_CITIES, movieService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const THEATRE_SKELETON_SLOTS = ['tskel-1', 'tskel-2', 'tskel-3', 'tskel-4', 'tskel-5', 'tskel-6']

export default function Theatres() {
  const { user } = useAuth()

  // State management
  const [theatres, setTheatres] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  // Modal triggers
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

  // Filter change helper
  const handleCityChange = (city) => {
    setIsLoading(true)
    setSelectedCity(city)
    setCurrentPage(1)
  }

  // Load theatres from service
  useEffect(() => {
    let ignore = false

    const loadTheatres = async () => {
      try {
        const res = await theatreService.getTheatresList({
          page: currentPage,
          city: selectedCity === 'All Cities' ? '' : selectedCity,
          search: debouncedSearch,
          limit: 6
        })

        if (!ignore) {
          setTheatres(res.theatres || [])
          setTotalPages(res.totalPages || 1)
          setTotalResults(res.totalResults || 0)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load theatres:', err)
          setError(err.message || 'Unable to retrieve cinema theatres.')
          setIsLoading(false)
          toast.error('Failed to load theatres list.')
        }
      }
    }

    loadTheatres()
    return () => {
      ignore = true
    }
  }, [currentPage, selectedCity, debouncedSearch])

  // Reset filters
  const handleResetFilters = () => {
    setIsLoading(true)
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedCity('All Cities')
    setCurrentPage(1)
  }

  const isFilterActive = searchQuery.trim().length > 0 || selectedCity !== 'All Cities'

  // Quick book show from card
  const handleQuickBook = (show, theatre) => {
    // Generate movie booking payload
    const bookingMoviePayload = {
      id: `th-book-${theatre.id}`,
      title: show.movieTitle,
      screen: `${theatre.name} • ${show.screen}`,
      language: show.language || 'English',
      price: show.price,
      poster: theatre.image,
      showtimes: [show.time, '1:45 PM', '5:30 PM', '8:45 PM'],
      theatreId: theatre.id,
      theatreName: theatre.name
    }
    setBookingMovie(bookingMoviePayload)
    setIsBookingOpen(true)
  }

  // Confirm booking
  const handleConfirmBooking = async (payload) => {
    try {
      const bookingPayload = {
        ...payload,
        userEmail: user?.email || 'guest@vscinemas.com',
        userName: user?.name || 'Valued Guest'
      }
      const res = await movieService.bookTickets(bookingPayload)
      if (res.success) {
        toast.success(`🎉 Booked ${payload.seats.length} ticket(s) at ${payload.screen}!`)
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
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  Multiplex Venues
                </span>
                <span className="text-xs text-blue-200">Across 6 Major Cities</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Multiplex Theatres & Cinema Screens
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
                Explore premium auditoriums, IMAX Laser, Dolby Cinema, and 4DX screens across India with real-time showtimings, contact information, and instant seat reservations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-right">
                <span className="text-[11px] text-blue-200 block font-medium">Available Theatres</span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {isLoading ? '...' : totalResults}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SEARCH & CITY FILTER TOOLBAR
            ======================================================== */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Top row: City Filter Pill Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Cities:</span>
              </span>
              {THEATRE_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCityChange(city)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCity === city
                      ? 'bg-[#007bff] text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by theatre name, address, screen type, or movie..."
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
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

            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Showing <strong className="text-slate-800">{theatres.length}</strong> of{' '}
                <strong className="text-slate-800">{totalResults}</strong> theatres
              </span>
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
                <h2 className="text-sm font-bold">Failed to Load Theatres</h2>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ========================================================
            LOADING SKELETONS
            ======================================================== */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEATRE_SKELETON_SLOTS.map((skelId) => (
              <div
                key={skelId}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
              >
                <div className="h-44 bg-slate-200 rounded-xl w-full" />
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                <div className="h-20 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            EMPTY RESULTS STATE
            ======================================================== */}
        {!isLoading && !error && theatres.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">No Theatres Found</h2>
              <p className="text-xs text-slate-500 mt-1">
                No cinema multiplex matches your city filter or search query. Try choosing "All Cities" or clearing the search text.
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
            THEATRE CARDS GRID
            ======================================================== */}
        {!isLoading && !error && theatres.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theatres.map((theatre) => (
              <TheatreCard
                key={theatre.id}
                theatre={theatre}
                onQuickBook={handleQuickBook}
              />
            ))}
          </div>
        )}

        {/* ========================================================
            PAGINATION CONTROLS
            ======================================================== */}
        {!isLoading && !error && theatres.length > 0 && totalPages > 1 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">
              Showing Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span> ({totalResults} total theatres)
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

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
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
