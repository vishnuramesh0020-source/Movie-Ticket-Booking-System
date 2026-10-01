import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Star,
  Ticket,
  Car,
  Train,
  SlidersHorizontal,
  Share2,
  Bookmark,
  CheckCircle2,
  Tv,
  Volume2,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import BookingModal from '../components/BookingModal'
import TicketModal from '../components/TicketModal'
import { theatreService, movieService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function TheatreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [theatre, setTheatre] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Showtimes time-of-day filter
  const [timeFilter, setTimeFilter] = useState('all') // 'all' | 'morning' | 'afternoon' | 'evening' | 'night'

  // Booking & Ticket Modals
  const [bookingMovie, setBookingMovie] = useState(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)
  const [isTicketOpen, setIsTicketOpen] = useState(false)

  // Fetch theatre details
  useEffect(() => {
    let ignore = false

    const loadTheatre = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const details = await theatreService.getTheatreDetails(id)
        if (!ignore) {
          setTheatre(details)
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load theatre details:', err)
          setError(err.message || 'Cinema theatre not found.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadTheatre()
    return () => {
      ignore = true
    }
  }, [id])

  // Filter shows by time-of-day
  const filteredShows = (theatre?.availableShows || []).filter((show) => {
    if (timeFilter === 'all') return true
    const timeStr = show.time.toUpperCase()

    // Parse hour
    const isPM = timeStr.includes('PM')
    const parts = timeStr.replace(/(AM|PM)/g, '').trim().split(':')
    let hour = parseInt(parts[0], 10)
    if (isPM && hour !== 12) hour += 12
    if (!isPM && hour === 12) hour = 0

    if (timeFilter === 'morning') return hour < 12
    if (timeFilter === 'afternoon') return hour >= 12 && hour < 17
    if (timeFilter === 'evening') return hour >= 17 && hour < 21
    if (timeFilter === 'night') return hour >= 21
    return true
  })

  // Quick book showtime
  const handleBookShow = (show) => {
    const bookingMoviePayload = {
      id: `th-${theatre.id}-${show.id}`,
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
        theatreName: theatre?.name || 'VS Cinemas',
        userEmail: user?.email || 'guest@vscinemas.com',
        userName: user?.name || 'Valued Guest'
      }
      const res = await movieService.bookTickets(bookingPayload)
      if (res.success) {
        toast.success(`🎉 Booked ${payload.seats.length} ticket(s) at ${theatre.name}!`)
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
      toast.info('Theatre link copied to clipboard!')
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
            onClick={() => navigate('/theatres')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Theatres</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Share Theatre Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toast.success('Saved to your favorite theatres!')}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Save to Favorites"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
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
              <h2 className="text-base font-bold text-rose-900">Theatre Not Found</h2>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
            <Link
              to="/theatres"
              className="inline-block px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Return to Theatres
            </Link>
          </div>
        )}

        {/* Loaded Theatre Details */}
        {!isLoading && !error && theatre && (
          <div className="space-y-6">
            {/* ========================================================
                1. THEATRE HERO BANNER
                ======================================================== */}
            <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl min-h-[380px] sm:min-h-[420px] flex flex-col justify-end">
              {/* Multiplex Photo */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 filter scale-105"
                style={{ backgroundImage: `url(${theatre.image})` }}
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

              {/* Hero Info */}
              <div className="relative z-10 p-5 sm:p-8 md:p-10 space-y-4 max-w-4xl">
                {/* City & Specs Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{theatre.screensCount} Auditoriums</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{theatre.city}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{theatre.rating} ({theatre.reviewsCount} reviews)</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    {theatre.dailyShows} Daily Shows
                  </span>
                </div>

                {/* Theatre Name */}
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {theatre.name}
                </h1>

                {/* Address & Sound System */}
                <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300 font-medium flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{theatre.address}, {theatre.city}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <Volume2 className="w-4 h-4" />
                    <span>{theatre.soundSystem}</span>
                  </span>
                </div>

                {/* Amenities Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {(theatre.facilities || []).map((fac) => (
                    <span
                      key={fac}
                      className="px-3 py-1 rounded-xl bg-white/15 text-white text-xs font-semibold border border-white/10 backdrop-blur-xs"
                    >
                      {fac}
                    </span>
                  ))}
                </div>

                {/* Quick CTA row */}
                <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
                  <a
                    href="#available-screens"
                    className="w-full xs:w-auto px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Tv className="w-4 h-4 text-blue-400" />
                    <span>View All Screens ({theatre.screensCount})</span>
                  </a>

                  {theatre.locationDetails?.mapUrl && (
                    <a
                      href={theatre.locationDetails.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full xs:w-auto px-6 sm:px-7 py-3 rounded-2xl bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/40 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Get Directions</span>
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* ========================================================
                2. SHOW TIMINGS SECTION (TODAY'S SCHEDULE)
                ======================================================== */}
            <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Today's Show Timings & Movie Schedule</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a showtime to instantly reserve your preferred seats.
                  </p>
                </div>

                {/* Time of Day Filter Tabs */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                  {[
                    { key: 'all', label: 'All Shows' },
                    { key: 'morning', label: 'Morning' },
                    { key: 'afternoon', label: 'Afternoon' },
                    { key: 'evening', label: 'Evening' },
                    { key: 'night', label: 'Night' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTimeFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        timeFilter === tab.key
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredShows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredShows.map((show) => (
                    <div
                      key={show.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-white transition-all flex flex-col justify-between space-y-3 shadow-2xs group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 inline-block mb-1">
                            {show.format} • {show.language}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {show.movieTitle}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium block mt-0.5">
                            {show.screen}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base sm:text-lg font-black text-[#228653] block">
                            ₹{show.price}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              show.status === 'Almost Full'
                                ? 'bg-rose-100 text-rose-700'
                                : show.status === 'Filling Fast'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {show.status}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Showtime: {show.time}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBookShow(show)}
                          className="px-4 py-1.5 bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Book Seats</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No shows match the selected time filter. Try selecting "All Shows".
                </div>
              )}
            </section>

            {/* ========================================================
                3. AVAILABLE SCREENS & AUDITORIUM BREAKDOWN
                ======================================================== */}
            <section id="available-screens" className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Tv className="w-5 h-5 text-blue-600" />
                  <span>Available Screens & Auditoriums ({theatre.screensCount})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed tech specifications, seating capacity, sound, and projection across all screens.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(theatre.screens || []).map((scr) => (
                  <div
                    key={scr.id}
                    className="p-4 rounded-xl bg-[#f8fafc] border border-slate-200/80 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-extrabold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                          Screen {scr.screenNumber} • {scr.type}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {scr.capacity} Seats
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {scr.name}
                      </h3>

                      <div className="space-y-1 mt-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">Audio: {scr.sound}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">Projection: {scr.projection}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Screen Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {scr.features.map((feat) => (
                          <span
                            key={feat}
                            className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ========================================================
                4. THEATRE LOCATION & 5. CONTACT INFORMATION
                ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Location Card (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <span>Theatre Location & Transit Guide</span>
                  </h2>
                  {theatre.locationDetails?.mapUrl && (
                    <a
                      href={theatre.locationDetails.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  )}
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-800 block text-sm">
                      {theatre.name}
                    </span>
                    <p className="text-slate-600 leading-relaxed font-normal">
                      {theatre.address}, {theatre.city}
                    </p>
                    {theatre.locationDetails?.landmark && (
                      <p className="text-blue-600 font-medium text-xs pt-1">
                        📍 Landmark: {theatre.locationDetails.landmark}
                      </p>
                    )}
                  </div>

                  {/* Parking & Transit Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span>Parking Facilities</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        {theatre.locationDetails?.parking || 'Covered multi-level parking available.'}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                        <Train className="w-4 h-4 text-blue-600" />
                        <span>Metro & Public Transit</span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        {theatre.locationDetails?.transit || 'Convenient access to city metro and bus lines.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information & Help Desk (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>Contact Information</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Box office support, ticketing inquiries & private screenings.
                  </p>

                  <div className="space-y-3 mt-4 text-xs">
                    {/* Phone */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Direct Telephone
                          </span>
                          <span className="font-bold text-slate-800">
                            {theatre.contact?.phone || '+91 80 4910 2200'}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`tel:${theatre.contact?.phone || '+918049102200'}`}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        Call
                      </a>
                    </div>

                    {/* Toll-Free Helpline */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Toll-Free Helpline
                          </span>
                          <span className="font-bold text-slate-800">
                            {theatre.contact?.helpline || '1800-425-9999'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        24x7 Support
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-purple-600" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Email Desk
                          </span>
                          <span className="font-bold text-slate-800 truncate max-w-[180px] block">
                            {theatre.contact?.email || 'support@vscinemas.com'}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`mailto:${theatre.contact?.email || 'support@vscinemas.com'}`}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-50"
                      >
                        Email
                      </a>
                    </div>

                    {/* Box Office Hours */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Box Office Operating Hours
                        </span>
                        <span className="font-bold text-slate-800">
                          {theatre.contact?.boxOfficeHours || '9:30 AM - 11:45 PM Daily'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Official Cinema Venue
                  </span>
                  <span>VS Multiplex Network</span>
                </div>
              </div>
            </div>
          </div>
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
