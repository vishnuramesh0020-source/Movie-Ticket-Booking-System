import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Globe,
  Play,
  Ticket,
  Film,
  Building2,
  Users,
  AlertCircle,
  Share2,
  Bookmark
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import TrailerModal from '../components/TrailerModal'
import BookingModal from '../components/BookingModal'
import TicketModal from '../components/TicketModal'
import { movieService, THEATRES_LIST } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)
  const [isTicketOpen, setIsTicketOpen] = useState(false)

  // Selected theatre & showtime for direct booking
  const [selectedTheatre, setSelectedTheatre] = useState(THEATRES_LIST[0])
  const [selectedShowtime, setSelectedShowtime] = useState('7:45 PM')

  useEffect(() => {
    let ignore = false

    const loadDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const details = await movieService.getMovieDetails(id)
        if (!ignore) {
          setMovie(details)
          setSelectedShowtime(details.showtimes?.[0] || '7:45 PM')
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load movie details:', err)
          setError('Could not load movie information from cinema database.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadDetails()
    return () => { ignore = true }
  }, [id])

  const handleConfirmBooking = async (payload) => {
    try {
      const bookingPayload = {
        ...payload,
        theatreName: selectedTheatre?.name || 'VS Cinemas IMAX Galleria',
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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.info('Movie link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f3f8] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Top Header Bar */}
      <Navbar />

      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Movies</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Share Movie"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toast.success('Added to your watchlist!')}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Save to Watchlist"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 animate-pulse">
            <div className="h-64 bg-slate-200 rounded-2xl w-full" />
            <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
            <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-4 my-8">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <div>
              <h2 className="text-base font-bold text-rose-900">Movie Not Found</h2>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
            <Link
              to="/movies"
              className="inline-block px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Return to Catalog
            </Link>
          </div>
        )}

        {/* Movie Content */}
        {!isLoading && !error && movie && (
          <div className="space-y-6">
            {/* ========================================================
                CINEMATIC HERO BANNER WITH BACKDROP
                ======================================================== */}
            <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl min-h-[460px] flex flex-col justify-end">
              {/* High-res Backdrop Image */}
              {movie.backdrop && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 filter blur-[0.5px] scale-105"
                  style={{ backgroundImage: `url(${movie.backdrop})` }}
                />
              )}

              {/* Cinematic Vignette Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

              {/* Hero Information Grid */}
              <div className="relative z-10 p-5 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
                {/* Movie Poster */}
                <div className="md:col-span-4 lg:col-span-3">
                  <div className="relative aspect-[2/3] w-48 sm:w-56 md:w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Movie Meta & Synopsis */}
                <div className="md:col-span-8 lg:col-span-9 space-y-4">
                  {/* Format & Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-extrabold text-xs uppercase tracking-wider">
                      {movie.screen || 'IMAX Laser 3D'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs">
                      {movie.status || 'Now Showing'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
                      ₹{movie.price || 280} per ticket
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                      {movie.title}
                    </h1>
                    {movie.tagline && (
                      <p className="text-sm sm:text-base text-slate-300 font-medium italic mt-1">
                        &quot;{movie.tagline}&quot;
                      </p>
                    )}
                  </div>

                  {/* Quick Meta Row */}
                  <div className="flex items-center gap-2.5 sm:gap-5 text-xs sm:text-sm text-slate-300 font-medium flex-wrap">
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      {movie.rating} / 10 ({movie.voteCount} reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-400" />
                      {movie.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      {movie.releaseDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-400" />
                      {movie.spokenLanguages || movie.language}
                    </span>
                  </div>

                  {/* Genres Tags */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {(movie.genre || '').split('/').map((g) => g.trim()).filter(Boolean).map((genreName) => (
                      <span
                        key={genreName}
                        className="px-3 py-1 rounded-xl bg-white/15 text-white text-xs font-semibold border border-white/10"
                      >
                        {genreName}
                      </span>
                    ))}
                  </div>

                  {/* Call to Actions: Trailer Button (UI Only) & Book Tickets */}
                  <div className="pt-3 flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
                    {/* Trailer Button (UI Only) */}
                    <button
                      type="button"
                      onClick={() => setIsTrailerOpen(true)}
                      className="w-full xs:w-auto px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Play className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>Watch Trailer</span>
                    </button>

                    {/* Book Tickets */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/seat-selection/${movie.id}?theatre=${selectedTheatre?.id}&time=${encodeURIComponent(
                            selectedShowtime
                          )}`
                        )
                      }
                      className="w-full xs:w-auto px-6 sm:px-7 py-3 rounded-2xl bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/40 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Book Tickets Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================
                SYNOPSIS, CAST & THEATRE SCHEDULES
                ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Storyline & Cast */}
              <div className="lg:col-span-8 space-y-6">
                {/* Storyline / Synopsis */}
                <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wider">
                    <Film className="w-4 h-4 text-blue-600" />
                    <span>Storyline & Synopsis</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {movie.overview}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Director</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{movie.director || 'Visionary Director'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Original Title</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{movie.originalTitle || movie.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Budget</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{movie.budget || '$120M'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Box Office</span>
                      <span className="font-bold text-emerald-600 mt-0.5 block">{movie.revenue || 'In Theatres'}</span>
                    </div>
                  </div>
                </section>

                {/* Top Cast Section */}
                {movie.cast && movie.cast.length > 0 && (
                  <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wider">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Top Billed Cast</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {movie.cast.map((actor) => (
                        <div key={actor.id} className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <img
                            src={actor.image}
                            alt={actor.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200 shadow-2xs mb-2"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                            }}
                          />
                          <span className="text-xs font-bold text-slate-900 line-clamp-1">{actor.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">{actor.character}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Multiplex Theatres & Shows */}
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Theatres & Showtimes</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Select a cinema multiplex venue to book passes:
                  </p>

                  <div className="space-y-3">
                    {THEATRES_LIST.slice(0, 3).map((th) => (
                      <div
                        key={th.id}
                        onClick={() => setSelectedTheatre(th)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedTheatre.id === th.id
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {th.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {th.location}
                        </span>

                        {/* Showtimes Pill Row */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                          {['1:15 PM', '4:30 PM', '7:45 PM', '10:15 PM'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTheatre(th)
                                setSelectedShowtime(st)
                                navigate(
                                  `/seat-selection/${movie.id}?theatre=${th.id}&time=${encodeURIComponent(st)}`
                                )
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                selectedTheatre.id === th.id && selectedShowtime === st
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 hover:bg-blue-100 border-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/seat-selection/${movie.id}?theatre=${selectedTheatre?.id}&time=${encodeURIComponent(
                          selectedShowtime
                        )}`
                      )
                    }
                    className="w-full py-3 bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Proceed to Seat Selection</span>
                  </button>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Trailer Modal (UI Only) */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movie={movie}
        onBook={() => setIsBookingOpen(true)}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        movie={movie}
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
