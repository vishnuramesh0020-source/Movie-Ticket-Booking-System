import React, { useState, useEffect } from 'react'
import {
  Film,
  Ticket,
  Clock,
  Star,
  Search,
  X,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Radio
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { movieService } from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [movies, setMovies] = useState([])
  const [activeTab, setActiveTab] = useState('now_playing') // 'now_playing' | 'trending'
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vscinemas_bookings') || '[]')
    } catch {
      return []
    }
  })

  // Load movies on mount and on tab change
  useEffect(() => {
    let ignore = false
    if (!searchQuery.trim()) {
      const fetcher = activeTab === 'trending'
        ? movieService.getTrending()
        : movieService.getNowPlaying()

      fetcher.then((data) => {
        if (!ignore) {
          setMovies(data)
          setIsLoading(false)
        }
      }).catch(() => {
        if (!ignore) {
          toast.error('Failed to load movies from third-party API')
          setIsLoading(false)
        }
      })
    }
    return () => { ignore = true }
  }, [activeTab, searchQuery])

  // Live search query via Third-Party Search API
  useEffect(() => {
    if (!searchQuery.trim()) return

    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsLoading(true)
        const results = await movieService.searchMovies(searchQuery)
        setMovies(results)
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Open booking modal
  const handleOpenBooking = (movie) => {
    setSelectedMovie(movie)
    setSelectedShowtime(movie.showtimes[0])
    setSelectedSeats(['D3', 'D4']) // Default suggested seats
    setIsBookingModalOpen(true)
  }

  // Toggle seat selection
  const handleToggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId))
    } else {
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat.')
      return
    }

    const totalAmount = selectedMovie.price * selectedSeats.length
    const bookingPayload = {
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      screen: selectedMovie.screen,
      showtime: selectedShowtime,
      seats: selectedSeats,
      totalAmount,
      poster: selectedMovie.poster,
      userEmail: user?.email,
      userName: user?.name
    }

    const res = await movieService.bookTickets(bookingPayload)
    if (res.success) {
      toast.success(`🎉 Booked ${selectedSeats.length} ticket(s) for "${selectedMovie.title}"!`)
      setBookings((prev) => [res.booking, ...prev])
      setIsBookingModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
        {/* Welcome Banner & Live Third-Party API status indicator */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c0841] via-[#2c1157] to-[#14062f] border border-purple-800/40 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live Third-Party API Connected (TMDB)
                </span>
                <span className="text-[11px] text-purple-300 font-medium hidden sm:inline">
                  • Real-time Cinema Feed
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || 'Cinephile'}!
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                Browse official releases directly from <strong>The Movie Database (TMDB) API</strong>. Select your movie, showtime, and auditorium seats in real time.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-xs">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#5e3bf2]"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                }}
              />
              <div>
                <p className="text-slate-400 text-[11px]">Logged in as</p>
                <p className="font-semibold text-white truncate max-w-[170px]">{user?.email}</p>
                <span className="text-[10px] text-emerald-400 font-medium">Session Authenticated</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab & Search Navigation */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          {/* Tab Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('now_playing')
                setSearchQuery('')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'now_playing' && !searchQuery
                  ? 'bg-[#5e3bf2] text-white shadow-lg shadow-purple-900/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Now Playing</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('trending')
                setSearchQuery('')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'trending' && !searchQuery
                  ? 'bg-[#5e3bf2] text-white shadow-lg shadow-purple-900/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending This Week</span>
            </button>
          </div>

          {/* Live Search Input calling Third-Party Search API */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search via TMDB API (e.g. Avatar, Batman)..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-[#5e3bf2] rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#5e3bf2] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-9 h-9 text-[#5e3bf2] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200">
              Fetching live releases from Third-Party TMDB API...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Pulling latest cinema showtimes, high-res posters, and ratings
            </p>
          </div>
        ) : movies.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <Film className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No movies found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try searching for a different title or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                fetchLiveMovies('now_playing')
              }}
              className="mt-4 px-4 py-2 bg-[#5e3bf2] text-xs font-semibold rounded-lg hover:bg-[#4d2bd9] transition-colors"
            >
              Reset to Now Playing
            </button>
          </div>
        ) : (
          /* Movies Catalog Grid populated exclusively by Third-Party API */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-[#5e3bf2]/60 transition-all duration-300 flex flex-col group hover:shadow-xl hover:shadow-purple-950/30"
              >
                {/* Poster Artwork from TMDB CDN */}
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1 border border-white/10 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{movie.rating}</span>
                  </div>

                  {/* Title & Genre over poster */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10.5px] font-bold text-[#c084fc] uppercase tracking-wider bg-purple-950/90 px-2 py-0.5 rounded border border-purple-800/40 backdrop-blur-xs">
                      {movie.genre}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug drop-shadow-md line-clamp-1">
                      {movie.title}
                    </h3>
                  </div>
                </div>

                {/* Details & Booking Action */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Clock className="w-3 h-3 text-[#5e3bf2]" />
                        {movie.duration}
                      </span>
                      <span className="bg-slate-800 text-purple-300 font-semibold px-2 py-0.5 rounded">
                        {movie.screen}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-slate-400 text-xs leading-relaxed pt-1">
                      {movie.overview}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                        Ticket
                      </span>
                      <span className="text-base font-extrabold text-emerald-400">
                        ₹{movie.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(movie)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5e3bf2] hover:bg-[#4d2bd9] text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Book Seats</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Reservations Section */}
        <section id="my-bookings" className="pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" />
              Your Confirmed Ticket Bookings ({bookings.length})
            </h2>
            <span className="text-xs text-slate-400">Stored in LocalStorage</span>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">No bookings recorded yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Select any movie above to choose showtimes and reserve seats!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center justify-between hover:border-emerald-500/40 transition-colors"
                >
                  {booking.poster && (
                    <img
                      src={booking.poster}
                      alt={booking.movieTitle}
                      className="w-16 h-22 object-cover rounded-xl shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-purple-400 truncate">
                        {booking.screen}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Confirmed
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm truncate">
                      {booking.movieTitle}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.showtime}
                    </p>
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      Seats: <span className="text-[#a78bfa]">{booking.seats.join(', ')}</span>
                    </p>
                    <div className="mt-2 text-xs font-bold text-emerald-400">
                      Total: ₹{booking.totalAmount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Interactive Booking & Real-Time Seat Selection Modal */}
      {isBookingModalOpen && selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-10 h-14 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {selectedMovie.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedMovie.screen} • ₹{selectedMovie.price} / ticket
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Showtime Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Showtime
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedMovie.showtimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedShowtime(time)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        selectedShowtime === time
                          ? 'bg-[#5e3bf2] text-white border-[#5e3bf2] shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theater Cinema Curved Screen */}
              <div className="py-1 text-center">
                <div className="w-4/5 h-1.5 bg-gradient-to-r from-transparent via-[#5e3bf2] to-transparent mx-auto rounded-full shadow-[0_0_12px_#5e3bf2]" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mt-1.5">
                  Cinema Screen Curve
                </span>
              </div>

              {/* Seat Layout Matrix */}
              <div>
                <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto">
                  {['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6'].map((seat) => {
                    const isSelected = selectedSeats.includes(seat)
                    const isOccupied = ['B2', 'B3', 'C4', 'E1'].includes(seat)

                    return (
                      <button
                        key={seat}
                        disabled={isOccupied}
                        onClick={() => handleToggleSeat(seat)}
                        className={`w-9 h-8 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          isOccupied
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-40'
                            : isSelected
                            ? 'bg-[#5e3bf2] text-white ring-2 ring-purple-400 shadow-md scale-105'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {seat}
                      </button>
                    )
                  })}
                </div>

                {/* Seat Legend */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#5e3bf2]" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-800 opacity-40" />
                    <span>Occupied</span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Seats:</span>
                  <span className="text-white font-medium">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ticket Price:</span>
                  <span className="text-white font-medium">
                    {selectedSeats.length} × ₹{selectedMovie.price}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400">
                    ₹{selectedSeats.length * selectedMovie.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={selectedSeats.length === 0}
                className="flex-1 py-2.5 px-4 bg-[#5e3bf2] hover:bg-[#4d2bd9] text-white rounded-xl text-xs font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm Reservation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
