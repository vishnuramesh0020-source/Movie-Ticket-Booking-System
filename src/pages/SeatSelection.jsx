import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  Ticket,
  Calendar,
  Clock,
  Building2,
  MapPin,
  Star,
  AlertCircle,
  X,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Info,
  Film,
  Search,
  Check
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import TicketModal from '../components/TicketModal'
import {
  movieService,
  THEATRES_LIST,
  SEAT_TIERS,
  INITIAL_BOOKED_SEATS,
  MAX_SEAT_LIMIT,
  AUDITORIUM_TIERS_CONFIG
} from '../services/api'
import { useAuth } from '../context/AuthContext'

// Generate next 5 booking calendar dates
function generateBookingDates() {
  const dates = []
  const today = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 0; i < 5; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()]
    const dateNum = d.getDate()
    const monthName = months[d.getMonth()]
    dates.push({
      id: `date-${i}`,
      label: `${dayName}, ${dateNum} ${monthName}`,
      day: dayName,
      dateFormatted: `${dateNum} ${monthName}`
    })
  }
  return dates
}

export default function SeatSelection() {
  const { movieId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Movie & Catalog Data
  const [movie, setMovie] = useState(null)
  const [allMovies, setAllMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Booking Venue & Timing States
  const calendarDates = useMemo(() => generateBookingDates(), [])
  const [selectedDate, setSelectedDate] = useState(calendarDates[0])
  const [selectedTheatre, setSelectedTheatre] = useState(() => {
    const theatreParam = searchParams.get('theatre')
    if (theatreParam) {
      const match = THEATRES_LIST.find((t) => String(t.id) === String(theatreParam))
      if (match) return match
    }
    return THEATRES_LIST[0]
  })
  const [selectedShowtime, setSelectedShowtime] = useState(() => {
    return searchParams.get('time') || '7:45 PM'
  })

  // Initial Selected Seats: D1 & D2 (matching user screenshot)
  const [selectedSeats, setSelectedSeats] = useState([
    { id: 'D1', row: 'D', num: 1, tier: 'PREMIUM', price: 340, tierName: 'Premium' },
    { id: 'D2', row: 'D', num: 2, tier: 'PREMIUM', price: 340, tierName: 'Premium' }
  ])
  const [extraBookedSeats, setExtraBookedSeats] = useState([])
  const [zoomLevel, setZoomLevel] = useState(1) // 0.85 | 1 | 1.15 | 1.25
  // Post-booking & Modals
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)
  const [isTicketOpen, setIsTicketOpen] = useState(false)

  // Module 6: Movie & Cinema Selection Modals
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false)
  const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false)

  // Fetch Movie Details & Catalog
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const catalog = await movieService.getNowPlaying()
        if (ignore) return

        // If movieId is provided in route params, use it; otherwise default to the FIRST movie in the active catalog list
        let chosenId = null
        if (movieId) {
          chosenId = movieId
        } else if (catalog && catalog.length > 0) {
          chosenId = catalog[0].id
        }

        let details = null
        if (chosenId) {
          try {
            details = await movieService.getMovieDetails(chosenId)
          } catch {
            details = catalog.find((m) => String(m.id) === String(chosenId)) || catalog[0]
          }
        }

        if (!ignore && details) {
          // Ensure selected movie is always in the allMovies list for dropdown and picker modal
          const isInCatalog = catalog.some((m) => String(m.id) === String(details.id))
          const fullCatalog = isInCatalog ? catalog : [details, ...catalog]

          setAllMovies(fullCatalog)
          setMovie(details)

          // Set showtime from params or movie default
          const timeParam = searchParams.get('time')
          if (timeParam) {
            setSelectedShowtime(timeParam)
          } else if (details.showtimes && details.showtimes.length > 0) {
            setSelectedShowtime(details.showtimes[0])
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load seat selection movie data:', err)
          setError('Could not load movie seating configuration.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [movieId, searchParams])

  // Occupied / Booked Seats computed dynamically scoped to exact movie, showtime, date, and theatre
  const bookedSeats = useMemo(() => {
    if (!movie) return INITIAL_BOOKED_SEATS
    const fromService = movieService.getBookedSeats(
      movie.title,
      selectedShowtime,
      selectedDate.label,
      selectedTheatre?.id
    )
    return Array.from(new Set([...fromService, ...extraBookedSeats]))
  }, [movie, selectedShowtime, selectedDate, selectedTheatre, extraBookedSeats])

  // Tier Pricing Dictionary: Executive (250), Premium (340), Platinum (640)
  const tierPricing = useMemo(() => {
    return {
      EXECUTIVE: {
        ...SEAT_TIERS.EXECUTIVE,
        price: SEAT_TIERS.EXECUTIVE?.basePrice || 250
      },
      PREMIUM: {
        ...SEAT_TIERS.PREMIUM,
        price: SEAT_TIERS.PREMIUM?.basePrice || 340
      },
      PLATINUM: {
        ...SEAT_TIERS.PLATINUM,
        price: SEAT_TIERS.PLATINUM?.basePrice || 640
      }
    }
  }, [])

  // Date and Showtime selection handlers
  const handleDateChange = (dateObj) => {
    setSelectedDate(dateObj)
    setSelectedSeats([])
  }

  const handleShowtimeChange = (st) => {
    setSelectedShowtime(st)
    setSelectedSeats([])
  }

  // Movie Switcher Handler
  const handleSelectMovie = (chosenMovie) => {
    setMovie(chosenMovie)
    setSelectedSeats([])
    setIsMovieModalOpen(false)
    navigate(`/booking/${chosenMovie.id}`, { replace: true })
    toast.info(`Switched movie to "${chosenMovie.title}"`)
  }

  // Theatre Switcher Handler
  const handleSelectTheatre = (theatreObj) => {
    setSelectedTheatre(theatreObj)
    setSelectedSeats([])
    setIsTheatreModalOpen(false)
    toast.info(`Cinema venue updated to ${theatreObj.name}`)
  }

  // Seat toggle handler
  const handleToggleSeat = (seatObj) => {
    const isBooked = bookedSeats.includes(seatObj.id)
    if (isBooked) {
      toast.info(`Seat ${seatObj.id} is already reserved by another guest.`)
      return
    }

    const isAlreadySelected = selectedSeats.some((s) => s.id === seatObj.id)

    if (isAlreadySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seatObj.id))
    } else {
      // Check maximum limit of 8 seats
      if (selectedSeats.length >= MAX_SEAT_LIMIT) {
        toast.warning(
          `Maximum seat selection limit reached: You can select up to ${MAX_SEAT_LIMIT} seats per booking.`
        )
        return
      }
      setSelectedSeats((prev) => [...prev, seatObj])
    }
  }

  // Remove specific seat from tags
  const handleRemoveSeat = (seatId) => {
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId))
  }

  // Clear all selected seats
  const handleClearAll = () => {
    if (selectedSeats.length === 0) return
    setSelectedSeats([])
    toast.info('Seat selection cleared.')
  }

  // Financial Calculations
  const baseTicketsTotal = useMemo(() => {
    return selectedSeats.reduce((sum, s) => sum + s.price, 0)
  }, [selectedSeats])

  const convenienceFeePerSeat = 30
  const totalConvenienceFee = selectedSeats.length * convenienceFeePerSeat
  const totalGst = Math.round(totalConvenienceFee * 0.18) // 18% GST on convenience fee
  const grandTotal = baseTicketsTotal + totalConvenienceFee + totalGst

  // Tier Counts Breakdown
  const tierBreakdown = useMemo(() => {
    const breakdown = { EXECUTIVE: 0, PREMIUM: 0, PLATINUM: 0 }
    selectedSeats.forEach((s) => {
      if (breakdown[s.tier] !== undefined) {
        breakdown[s.tier] += 1
      }
    })
    return breakdown
  }, [selectedSeats])

  // Confirm booking & generate E-ticket with strict DUPLICATE BOOKING PREVENTION
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least 1 seat to confirm your booking.')
      return
    }

    // 1. Pre-flight duplicate check against fresh storage state
    const currentOccupied = movieService.getBookedSeats(
      movie.title,
      selectedShowtime,
      selectedDate.label,
      selectedTheatre.id
    )
    const duplicateSeats = selectedSeats.filter((s) => currentOccupied.includes(s.id))
    if (duplicateSeats.length > 0) {
      toast.error(
        `Duplicate Booking Prevented: Seat(s) ${duplicateSeats.map((s) => s.id).join(', ')} were just reserved by another patron. Please select alternative seats.`
      )
      // Unselect conflicted seats and mark them booked in local state
      setSelectedSeats((prev) => prev.filter((s) => !currentOccupied.includes(s.id)))
      setExtraBookedSeats((prev) => Array.from(new Set([...prev, ...duplicateSeats.map((s) => s.id)])))
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        movieId: movie.id,
        movieTitle: movie.title,
        screen: `${selectedTheatre.name} • ${movie.screen || 'Screen 1'}`,
        showtime: selectedShowtime,
        date: selectedDate.label,
        seats: selectedSeats.map((s) => s.id),
        seatDetails: selectedSeats.map((s) => ({
          id: s.id,
          tier: s.tier,
          price: s.price,
          tierName: s.tierName
        })),
        pricePerSeat: Math.round(baseTicketsTotal / selectedSeats.length),
        totalAmount: grandTotal,
        baseTicketsTotal,
        convenienceFee: totalConvenienceFee,
        gst: totalGst,
        poster: movie.poster,
        language: movie.language,
        genre: movie.genre,
        theatreId: selectedTheatre.id,
        theatreName: selectedTheatre.name,
        userEmail: user?.email || 'guest@vscinemas.com',
        userName: user?.name || 'Valued Guest'
      }

      const res = await movieService.bookTickets(payload)
      if (res.success) {
        toast.success(`🎉 Booked ${selectedSeats.length} ticket(s) for "${movie.title}"!`)
        // Update local booked seats immediately
        setExtraBookedSeats((prev) => [...prev, ...selectedSeats.map((s) => s.id)])
        setSelectedSeats([])
        setActiveTicket(res.booking)
        setIsTicketOpen(true)
      }
    } catch (err) {
      console.error('Booking failed:', err)
      toast.error(err.message || 'Booking transaction could not be processed. Please retry.')
      if (movie) {
        const freshBooked = movieService.getBookedSeats(
          movie.title,
          selectedShowtime,
          selectedDate.label,
          selectedTheatre.id
        )
        setExtraBookedSeats((prev) => Array.from(new Set([...prev, ...freshBooked])))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Available showtimes list
  const availableShowtimes = movie?.showtimes || [
    '10:15 AM',
    '1:45 PM',
    '4:30 PM',
    '7:45 PM',
    '10:30 PM'
  ]

  // Showtime Status Mapping for Real-time capacity awareness
  const showtimeStatuses = {
    '10:15 AM': { status: 'Available', color: 'emerald' },
    '1:45 PM': { status: 'Filling Fast', color: 'amber' },
    '4:30 PM': { status: 'Almost Full', color: 'rose' },
    '7:45 PM': { status: 'Filling Fast', color: 'amber' },
    '10:30 PM': { status: 'Available', color: 'emerald' }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Top Header Bar */}
      <Navbar />

      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Navigation Breadcrumb & Back Action */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Quick Movie Switcher & Change Movie Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMovieModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Change Movie</span>
            </button>

            <select
              value={movie?.id || ''}
              onChange={(e) => {
                const found = allMovies.find((m) => String(m.id) === String(e.target.value))
                if (found) {
                  handleSelectMovie(found)
                } else {
                  navigate(`/booking/${e.target.value}`)
                }
              }}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs max-w-[200px] truncate"
            >
              {allMovies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 animate-pulse">
            <div className="h-24 bg-slate-200 rounded-2xl w-full" />
            <div className="h-96 bg-slate-100 rounded-2xl w-full" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-4 my-8">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <div>
              <h2 className="text-base font-bold text-rose-900">Seating Plan Unavailable</h2>
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

        {/* ========================================================
            MAIN SEAT SELECTION INTERFACE
            ======================================================== */}
        {!isLoading && !error && movie && (
          <div className="space-y-6">
            {/* 1. CINEMA SHOW & VENUE SELECTION TOOLBAR */}
            <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                {/* Movie Summary Meta */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl shadow-md border border-slate-200 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src =
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                    }}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {movie.screen || 'IMAX Laser 3D'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {movie.duration} • {movie.language}
                      </span>
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        {movie.rating}
                      </span>
                    </div>

                    <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                      {movie.title}
                    </h1>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800">{selectedTheatre.name}</span>
                      <span>• {selectedTheatre.city}</span>
                    </p>
                  </div>
                </div>

                {/* Theatre Venue Selector & Change Cinema Action */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsTheatreModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Change Cinema</span>
                  </button>

                  <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-2 flex items-center gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <select
                      value={selectedTheatre.id}
                      onChange={(e) => {
                        const found = THEATRES_LIST.find((t) => t.id === e.target.value)
                        if (found) handleSelectTheatre(found)
                      }}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate"
                    >
                      {THEATRES_LIST.map((th) => (
                        <option key={th.id} value={th.id}>
                          {th.name} ({th.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date & Showtime Selector Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Booking Dates Pills */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span>Select Date</span>
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {calendarDates.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDateChange(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          selectedDate.id === d.id
                            ? 'bg-[#007bff] text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                        }`}
                      >
                        <span className="block text-[10px] opacity-80 uppercase">{d.day}</span>
                        <span>{d.dateFormatted}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Showtimes Pills with Capacity Status Tags */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>Available Showtimes</span>
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {availableShowtimes.map((st) => {
                      const isSelected = selectedShowtime === st
                      const info = showtimeStatuses[st] || { status: 'Available', color: 'emerald' }
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleShowtimeChange(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex flex-col items-center gap-0.5 ${
                            isSelected
                              ? 'bg-[#007bff] text-white shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{st}</span>
                          </div>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : info.color === 'emerald'
                                ? 'bg-emerald-100 text-emerald-800'
                                : info.color === 'amber'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {info.status}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================
                2. SEAT LAYOUT & SELECTION SUMMARY GRID
                ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Clean Auditorium Layout Matching Reference Image */}
              <div className="lg:col-span-8 space-y-5">
                <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
                  {/* Top Bar: Zoom Controls & Clear Selection */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        Auditorium Seating
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          selectedSeats.length === MAX_SEAT_LIMIT
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {selectedSeats.length} / {MAX_SEAT_LIMIT} Seats Selected
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setZoomLevel(1)}
                        className="px-2.5 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>100%</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(1.25, Number((z + 0.15).toFixed(2))))}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>

                      {selectedSeats.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="px-3 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer ml-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SEAT MATRIX WRAPPER (MATCHING USER SCREENSHOT EXACTLY) */}
                  <div className="overflow-x-auto w-full py-4">
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease-out'
                      }}
                      className="min-w-[620px] max-w-2xl mx-auto space-y-6 sm:space-y-7"
                    >
                      {/* Cinema Screen Banner (Matching user reference image: "Screen this side") */}
                      <div className="pb-5 pt-1 text-center w-full max-w-xl mx-auto select-none">
                        <div className="relative flex flex-col items-center">
                          <svg
                            viewBox="0 0 540 64"
                            className="w-full h-11 sm:h-13 drop-shadow-[0_2px_8px_rgba(186,230,253,0.35)]"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <linearGradient id="screenTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.75" />
                                <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.3" />
                              </linearGradient>
                            </defs>

                            {/* Screen Canopy Perspective Polygon with subtle curved edges */}
                            <path
                              d="M 14 12 Q 270 4 526 12 L 480 54 Q 270 45 60 54 Z"
                              fill="url(#screenTopGrad)"
                              stroke="#bae6fd"
                              strokeWidth="1.2"
                              strokeOpacity="0.7"
                            />

                            {/* Top Edge Highlight */}
                            <path
                              d="M 16 12 Q 270 4 524 12"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              strokeOpacity="0.85"
                              strokeLinecap="round"
                            />

                            {/* Centered "Screen this side" Text matching user screenshot */}
                            <text
                              x="270"
                              y="32"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-[#8fa1b3] font-medium tracking-wide select-none"
                              style={{ fontSize: '13px', fontFamily: 'inherit' }}
                            >
                              Screen this side
                            </text>
                          </svg>
                        </div>
                      </div>

                      {AUDITORIUM_TIERS_CONFIG.map((tierGroup) => {
                        const currentTierPrice =
                          tierPricing[tierGroup.tierId]?.price || tierGroup.defaultPrice

                        return (
                          <div key={tierGroup.tierId} className="space-y-3">
                            {/* Tier Heading: Left-aligned clean typography (e.g. Executive - ₹ 250) */}
                            <div className="text-xs sm:text-sm font-semibold text-slate-700 tracking-normal pl-1">
                              {tierGroup.name} - ₹ {currentTierPrice}
                            </div>

                            {/* Rows of this Tier */}
                            <div className="space-y-3 sm:space-y-3.5">
                              {tierGroup.rows.map((rowConfig) => {
                                const rowLetter = rowConfig.row

                                return (
                                  <div
                                    key={rowLetter}
                                    className="flex items-center justify-between gap-3 sm:gap-4"
                                  >
                                    {/* Left Row Letter */}
                                    <span className="w-4 text-xs sm:text-sm font-medium text-slate-400 text-center select-none shrink-0">
                                      {rowLetter}
                                    </span>

                                    {/* Center Seating Row with Walkway Aisle */}
                                    <div
                                      className={`flex-1 flex items-center justify-center gap-6 sm:gap-10 ${rowConfig.indentClass}`}
                                    >
                                      {/* Left Seat Block */}
                                      <div className="flex items-center gap-1.5 sm:gap-2">
                                        {rowConfig.leftSeats.map((seatNum) => {
                                          const seatId = `${rowLetter}${seatNum}`
                                          const isBooked = bookedSeats.includes(seatId)
                                          const isSelected = selectedSeats.some(
                                            (s) => s.id === seatId
                                          )
                                          const seatObj = {
                                            id: seatId,
                                            row: rowLetter,
                                            num: seatNum,
                                            tier: tierGroup.tierId,
                                            price: currentTierPrice,
                                            tierName: tierGroup.name
                                          }

                                          return (
                                            <button
                                              key={seatId}
                                              type="button"
                                              disabled={isBooked}
                                              onClick={() => handleToggleSeat(seatObj)}
                                              aria-label={`Seat ${seatId}, ${tierGroup.name}, ₹${currentTierPrice}, ${
                                                isBooked
                                                  ? 'Booked'
                                                  : isSelected
                                                  ? 'Selected'
                                                  : 'Available'
                                              }`}
                                              title={`Seat ${seatId} • ${tierGroup.name} - ₹${currentTierPrice} ${
                                                isBooked ? '• Reserved' : ''
                                              }`}
                                              className="group relative cursor-pointer disabled:cursor-not-allowed focus:outline-none transition-transform active:scale-95"
                                            >
                                              <CinemaSeatGraphic
                                                status={
                                                  isBooked
                                                    ? 'booked'
                                                    : isSelected
                                                    ? 'selected'
                                                    : 'available'
                                                }
                                              />
                                            </button>
                                          )
                                        })}
                                      </div>

                                      {/* Right Seat Block */}
                                      <div className="flex items-center gap-1.5 sm:gap-2">
                                        {rowConfig.rightSeats.map((seatNum) => {
                                          const seatId = `${rowLetter}${seatNum}`
                                          const isBooked = bookedSeats.includes(seatId)
                                          const isSelected = selectedSeats.some(
                                            (s) => s.id === seatId
                                          )
                                          const seatObj = {
                                            id: seatId,
                                            row: rowLetter,
                                            num: seatNum,
                                            tier: tierGroup.tierId,
                                            price: currentTierPrice,
                                            tierName: tierGroup.name
                                          }

                                          return (
                                            <button
                                              key={seatId}
                                              type="button"
                                              disabled={isBooked}
                                              onClick={() => handleToggleSeat(seatObj)}
                                              aria-label={`Seat ${seatId}, ${tierGroup.name}, ₹${currentTierPrice}, ${
                                                isBooked
                                                  ? 'Booked'
                                                  : isSelected
                                                  ? 'Selected'
                                                  : 'Available'
                                              }`}
                                              title={`Seat ${seatId} • ${tierGroup.name} - ₹${currentTierPrice} ${
                                                isBooked ? '• Reserved' : ''
                                              }`}
                                              className="group relative cursor-pointer disabled:cursor-not-allowed focus:outline-none transition-transform active:scale-95"
                                            >
                                              <CinemaSeatGraphic
                                                status={
                                                  isBooked
                                                    ? 'booked'
                                                    : isSelected
                                                    ? 'selected'
                                                    : 'available'
                                                }
                                              />
                                            </button>
                                          )
                                        })}
                                      </div>
                                    </div>

                                    {/* Right Row Letter */}
                                    <span className="w-4 text-xs sm:text-sm font-medium text-slate-400 text-center select-none shrink-0">
                                      {rowLetter}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Clean Legend matching Reference Colors */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <CinemaSeatGraphic status="available" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Available</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CinemaSeatGraphic status="selected" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-bold text-blue-600">Selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CinemaSeatGraphic status="booked" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Booked</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column (4 cols): Sticky Seat Selection Summary */}
              <div className="lg:col-span-4 w-full space-y-5 lg:sticky lg:top-20">
                <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span>Seat Selection Summary</span>
                    </h2>
                    {selectedSeats.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {selectedSeats.length} Selected
                      </span>
                    )}
                  </div>

                  {/* Selected Movie & Screen Card */}
                  <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {movie.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedTheatre.name}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                        {movie.screen || 'Screen 1'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Date
                        </span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          {selectedDate.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Showtime
                        </span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {selectedShowtime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Seats Badges List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Chosen Seats:</span>
                      <span className="text-slate-400 font-medium">
                        {selectedSeats.length > 0
                          ? `${selectedSeats.length} of ${MAX_SEAT_LIMIT} max`
                          : 'None selected yet'}
                      </span>
                    </div>

                    {selectedSeats.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {selectedSeats.map((seat) => (
                          <div
                            key={seat.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 shadow-2xs group"
                          >
                            <span>{seat.id}</span>
                            <span className="text-[10px] font-medium text-blue-600">
                              ({seat.tierName} • ₹{seat.price})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSeat(seat.id)}
                              className="text-blue-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                              title={`Remove Seat ${seat.id}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400 space-y-1">
                        <p>No seats selected yet.</p>
                        <p className="text-[10px] text-slate-400">
                          Click available seats on the layout to select.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Seat Tier Breakdown (if seats are selected) */}
                  {selectedSeats.length > 0 && (
                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      {tierBreakdown.EXECUTIVE > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Executive ({tierBreakdown.EXECUTIVE} × ₹{tierPricing.EXECUTIVE.price})</span>
                          <span className="font-bold text-slate-800">
                            ₹{(tierBreakdown.EXECUTIVE * tierPricing.EXECUTIVE.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {tierBreakdown.PREMIUM > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Premium ({tierBreakdown.PREMIUM} × ₹{tierPricing.PREMIUM.price})</span>
                          <span className="font-bold text-slate-800">
                            ₹{(tierBreakdown.PREMIUM * tierPricing.PREMIUM.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {tierBreakdown.PLATINUM > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Platinum ({tierBreakdown.PLATINUM} × ₹{tierPricing.PLATINUM.price})</span>
                          <span className="font-bold text-slate-800">
                            ₹{(tierBreakdown.PLATINUM * tierPricing.PLATINUM.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comprehensive Price Calculation Breakdown */}
                  <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Base Ticket Subtotal:</span>
                      <span className="font-bold text-slate-800">
                        ₹{baseTicketsTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <span>Convenience Fee</span>
                        <Info className="w-3 h-3 text-slate-400" title="₹30 per seat standard fee" />
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹{totalConvenienceFee.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Integrated GST (18% on fee):</span>
                      <span className="font-bold text-slate-800">
                        ₹{totalGst.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">
                          Total Payable:
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          All taxes & charges included
                        </span>
                      </div>
                      <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Proceed & Confirm Booking CTA Button */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      disabled={isSubmitting || selectedSeats.length === 0}
                      onClick={handleConfirmBooking}
                      className="w-full py-3.5 bg-[#4361ee] hover:bg-[#3651d4] active:bg-[#2b42b5] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>
                            {selectedSeats.length > 0
                              ? `Pay & Confirm ₹${grandTotal.toLocaleString('en-IN')}`
                              : 'Select Seats to Proceed'}
                          </span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Guaranteed Official Cinema Reservation</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM DOCK (For 320px - 640px screens) */}
      {!isLoading && !error && movie && selectedSeats.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-xl flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>{selectedSeats.length} Seat(s)</span>
              <span className="text-slate-400">•</span>
              <span className="text-sm font-black text-emerald-700">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate block max-w-[180px]">
              {selectedSeats.map((s) => s.id).join(', ')}
            </span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmBooking}
            className="px-5 py-2.5 bg-[#4361ee] hover:bg-[#3651d4] active:bg-[#2b42b5] text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5" />
                <span>Book Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Official Confirmed E-Ticket Modal */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        ticket={activeTicket}
      />

      {/* Module 6: Interactive Movie Picker Modal */}
      <MoviePickerModal
        isOpen={isMovieModalOpen}
        onClose={() => setIsMovieModalOpen(false)}
        movies={allMovies}
        currentMovieId={movie?.id}
        onSelectMovie={handleSelectMovie}
      />

      {/* Module 6: Interactive Cinema Venue Picker Modal */}
      <TheatrePickerModal
        isOpen={isTheatreModalOpen}
        onClose={() => setIsTheatreModalOpen(false)}
        theatres={THEATRES_LIST}
        currentTheatreId={selectedTheatre?.id}
        onSelectTheatre={handleSelectTheatre}
      />
    </div>
  )
}

// Custom Cinema Armchair SVG Graphic matching the user's reference image
function CinemaSeatGraphic({ status = 'available', className = '', rotate = false }) {
  const rotateClass = rotate ? 'rotate-180' : ''

  if (status === 'selected') {
    return (
      <svg
        viewBox="0 0 32 30"
        className={`w-6 h-6 sm:w-7.5 sm:h-7.5 transition-transform duration-150 ${rotateClass} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0px 3px 8px rgba(67, 97, 238, 0.45))'
        }}
      >
        {/* Outer Armrest & Base Frame */}
        <path
          d="M 4 11 L 4 22 C 4 25.5 6.2 27 9 27 L 23 27 C 25.8 27 28 25.5 28 22 L 28 11"
          stroke="#4361ee"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Inner Cushion */}
        <rect
          x="7.5"
          y="3"
          width="17"
          height="18"
          rx="3.5"
          fill="#4361ee"
        />
      </svg>
    )
  }

  if (status === 'booked') {
    return (
      <svg
        viewBox="0 0 32 30"
        className={`w-6 h-6 sm:w-7.5 sm:h-7.5 ${rotateClass} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Armrest & Base Frame */}
        <path
          d="M 4 11 L 4 22 C 4 25.5 6.2 27 9 27 L 23 27 C 25.8 27 28 25.5 28 22 L 28 11"
          stroke="#7e8693"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Inner Cushion */}
        <rect
          x="7.5"
          y="3"
          width="17"
          height="18"
          rx="3.5"
          fill="#8d95a2"
        />
      </svg>
    )
  }

  // Available Seat
  return (
    <svg
      viewBox="0 0 32 30"
      className={`w-6 h-6 sm:w-7.5 sm:h-7.5 transition-all duration-150 group-hover:scale-105 ${rotateClass} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Armrest & Base Frame */}
      <path
        d="M 4 11 L 4 22 C 4 25.5 6.2 27 9 27 L 23 27 C 25.8 27 28 25.5 28 22 L 28 11"
        stroke="#cbd5e1"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="group-hover:stroke-blue-400 transition-colors"
      />
      {/* Inner Cushion */}
      <rect
        x="7.5"
        y="3"
        width="17"
        height="18"
        rx="3.5"
        fill="#f1f3f5"
        stroke="#e2e8f0"
        strokeWidth="1"
        className="group-hover:fill-blue-50/70 group-hover:stroke-blue-300 transition-colors"
      />
    </svg>
  )
}

// Module 6: Movie Selector Modal for Feature 1 (Select Movie)
function MoviePickerModal({ isOpen, onClose, movies, currentMovieId, onSelectMovie }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')

  if (!isOpen) return null

  const genres = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Telugu', 'English']

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      !searchTerm.trim() ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.language?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGenre =
      selectedGenre === 'All' ||
      m.genre?.toLowerCase().includes(selectedGenre.toLowerCase()) ||
      m.language?.toLowerCase().includes(selectedGenre.toLowerCase())

    return matchesSearch && matchesGenre
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-picker-title"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </span>
            <div>
              <h2 id="movie-picker-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                Select Movie for Ticket Booking
              </h2>
              <p className="text-xs text-slate-400">
                Choose a cinema feature to view auditorium seating and book your passes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Movie Picker"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Genre Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-[#f8fafc] space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by movie title, genre, language..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedGenre === g
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No movies match your search. Try another keyword.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMovies.map((m) => {
                const isCurrent = String(m.id) === String(currentMovieId)
                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-16 h-24 object-cover rounded-xl shadow-xs shrink-0 border border-slate-200"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src =
                            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                        }}
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                            {m.screen || 'IMAX 3D'}
                          </span>
                          <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-current" />
                            {m.rating}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                          {m.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {m.duration} • {m.language}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{m.genre}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        ₹250 - ₹640
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectMovie(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Current</span>
                          </>
                        ) : (
                          <span>Select Movie</span>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Module 6: Theatre / Cinema Selector Modal for Feature 2 (Select Theatre)
function TheatrePickerModal({ isOpen, onClose, theatres, currentTheatreId, onSelectTheatre }) {
  const [selectedCity, setSelectedCity] = useState('All')

  if (!isOpen) return null

  const cities = ['All', 'Bengaluru', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Kochi']

  const filteredTheatres = theatres.filter((th) => {
    return selectedCity === 'All' || th.city.toLowerCase() === selectedCity.toLowerCase()
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theatre-picker-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 id="theatre-picker-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                Select Cinema & Screen Venue
              </h2>
              <p className="text-xs text-slate-400">
                Choose an auditorium location near you for instant seat allocation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Theatre Picker"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* City Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-[#f8fafc] space-y-2 shrink-0">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Filter by City
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Theatres List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {filteredTheatres.map((th) => {
            const isCurrent = String(th.id) === String(currentTheatreId)
            return (
              <div
                key={th.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {th.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {th.screensCount} Screens
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{th.address}, {th.city}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600">Sound:</span> {th.soundSystem}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {(th.facilities || []).slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {th.dailyShows} Daily Shows
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTheatre(th)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Current Cinema</span>
                      </>
                    ) : (
                      <span>Select Cinema</span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

