import React, { useState, useEffect } from 'react'
import {
  Film,
  Ticket,
  Clock,
  Star,
  X,
  CreditCard,
  RefreshCw,
  Building2,
  CalendarDays,
  MapPin,
  Printer,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PieChart,
  Layers,
  TrendingUp,
  QrCode,
  ArrowUpRight,
  BadgeIndianRupee
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import {
  movieService,
  THEATRES_LIST,
  REVENUE_DATA,
  INITIAL_RECENT_BOOKINGS
} from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [upcomingMovies, setUpcomingMovies] = useState([])
  const [activeTab, setActiveTab] = useState('now_playing') // 'now_playing' | 'upcoming' | 'theatres'
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(4)

  // Booking modal states
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // E-Ticket modal state
  const [activeTicket, setActiveTicket] = useState(null)

  // Interactive Chart States
  const [activeBarMonth, setActiveBarMonth] = useState(null)
  const [revenuePeriod, setRevenuePeriod] = useState('All') // 'All' | 'Q1' | 'Q2'
  const [activeProfitPoint, setActiveProfitPoint] = useState(null)
  const [profitMetricView, setProfitMetricView] = useState('both') // 'both' | 'profit' | 'occupancy'

  // Cinema Analytics: Format Share selection state
  const [selectedFormat, setSelectedFormat] = useState(null)

  // Bookings state initialized from localStorage
  const [bookings, setBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('vscinemas_bookings')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.length > 0) return parsed
      }
      localStorage.setItem('vscinemas_bookings', JSON.stringify(INITIAL_RECENT_BOOKINGS))
      return INITIAL_RECENT_BOOKINGS
    } catch {
      return INITIAL_RECENT_BOOKINGS
    }
  })

  const theatres = THEATRES_LIST
  const revenueSummary = REVENUE_DATA

  // Fetch movies from TMDB third-party API
  useEffect(() => {
    let ignore = false

    const fetchAllData = async () => {
      try {
        const [nowPlaying, upcoming] = await Promise.all([
          movieService.getNowPlaying(),
          movieService.getUpcoming()
        ])
        if (!ignore) {
          setNowPlayingMovies(nowPlaying)
          setUpcomingMovies(upcoming)
          setIsLoading(false)
        }
      } catch {
        if (!ignore) {
          toast.error('Failed to load live cinema catalog')
          setIsLoading(false)
        }
      }
    }

    fetchAllData()
    return () => { ignore = true }
  }, [])

  // Live search query via Third-Party Search API
  useEffect(() => {
    if (!searchQuery.trim()) return

    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsLoading(true)
        const results = await movieService.searchMovies(searchQuery)
        setNowPlayingMovies(results)
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Event handlers that reset pagination to initial 4 movies
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchQuery('')
    setVisibleCount(4)
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setVisibleCount(4)
  }

  // Open booking modal
  const handleOpenBooking = (movie) => {
    setSelectedMovie(movie)
    setSelectedShowtime(movie.showtimes?.[0] || '7:45 PM')
    setSelectedSeats(['D3', 'D4'])
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
      userEmail: user?.email || 'guest@vscinemas.com',
      userName: user?.name || 'Valued Guest'
    }

    const res = await movieService.bookTickets(bookingPayload)
    if (res.success) {
      toast.success(`🎉 Booked ${selectedSeats.length} ticket(s) for "${selectedMovie.title}"!`)
      setBookings((prev) => [res.booking, ...prev])
      setIsBookingModalOpen(false)
      setActiveTicket(res.booking)
    }
  }

  // Summary Metrics calculations
  const totalMoviesCount = nowPlayingMovies.length + upcomingMovies.length
  const totalTheatresCount = theatres.length
  const totalBookingsCount = 1420 + bookings.length
  const availableShowsCount = theatres.reduce((acc, t) => acc + t.dailyShows, 0)
  const todayBookingsCount = bookings.filter((b) => b.date?.includes('Today') || b.date?.includes('Just now')).length + 48

  // Current displayed movie list based on active tab
  const displayedMovies = activeTab === 'upcoming' ? upcomingMovies : nowPlayingMovies
  const visibleMovies = displayedMovies.slice(0, visibleCount)

  // Revenue statistic bar chart dataset with real values in INR
  const revenueChartData = [
    { m: 'Jan', imax: 63000, dolby: 58000, gH: 135, bH: 100, x: 60, tickets: 420, quarter: 'Q1', growth: '+14%' },
    { m: 'Feb', imax: 57500, dolby: 55000, gH: 95, bH: 75, x: 120, tickets: 380, quarter: 'Q1', growth: '+8%' },
    { m: 'Mar', imax: 60500, dolby: 57000, gH: 115, bH: 90, x: 180, tickets: 410, quarter: 'Q1', growth: '+12%' },
    { m: 'Apr', imax: 65000, dolby: 59000, gH: 150, bH: 105, x: 240, tickets: 460, quarter: 'Q1', growth: '+19%' },
    { m: 'May', imax: 68000, dolby: 60000, gH: 170, bH: 110, x: 300, tickets: 510, quarter: 'Q2', growth: '+28%' },
    { m: 'Jun', imax: 59500, dolby: 55500, gH: 110, bH: 80, x: 360, tickets: 395, quarter: 'Q2', growth: '+10%' },
    { m: 'Jul', imax: 64000, dolby: 58500, gH: 140, bH: 100, x: 420, tickets: 445, quarter: 'Q2', growth: '+18%' },
    { m: 'Aug', imax: 64000, dolby: 58500, gH: 140, bH: 100, x: 480, tickets: 445, quarter: 'Q2', growth: '+17%' }
  ]

  // Filtered revenue bars based on selected period
  const filteredRevenueBars = revenueChartData.filter((item) => {
    if (revenuePeriod === 'Q1') return item.quarter === 'Q1'
    if (revenuePeriod === 'Q2') return item.quarter === 'Q2'
    return true
  })

  // Profit chart spline dataset with occupancy and profit values
  const profitChartData = [
    { m: 'Jan', x: 50, profitY: 155, occupancyY: 140, profitVal: '75%', occupancyVal: '79%', revenue: '₹48,200', note: 'New Year Releases' },
    { m: 'Feb', x: 125, profitY: 135, occupancyY: 170, profitVal: '79%', occupancyVal: '84%', revenue: '₹52,400', note: 'Valentine Weekend' },
    { m: 'Mar', x: 200, profitY: 195, occupancyY: 195, profitVal: '67%', occupancyVal: '65%', revenue: '₹41,000', note: 'Pre-Summer Lull' },
    { m: 'Apr', x: 280, profitY: 110, occupancyY: 125, profitVal: '92%', occupancyVal: '80%', revenue: '₹61,800', note: 'Summer Blockbusters' },
    { m: 'May', x: 355, profitY: 60, occupancyY: 95, profitVal: '105%', occupancyVal: '92%', revenue: '₹74,500', note: 'Peak Vacation Surge' },
    { m: 'Jun', x: 435, profitY: 140, occupancyY: 135, profitVal: '81%', occupancyVal: '87%', revenue: '₹55,200', note: 'Monsoon Premieres' },
    { m: 'Jul', x: 510, profitY: 155, occupancyY: 125, profitVal: '76%', occupancyVal: '94%', revenue: '₹49,800', note: 'Mid-Year Releases' }
  ]

  // Cinema Screen Format & Sales Share dataset (Cinema Analytics)
  const formatShareData = [
    {
      id: 'imax',
      name: 'IMAX Laser',
      share: 42,
      revenue: 284000,
      tickets: 1840,
      color: '#228653',
      occupancy: '94%',
      badge: '+38% YoY'
    },
    {
      id: 'dolby',
      name: 'Dolby Cinema',
      share: 34,
      revenue: 195000,
      tickets: 1420,
      color: '#2163e8',
      occupancy: '89%',
      badge: '+22% YoY'
    },
    {
      id: '4dx',
      name: '4DX Dynamic',
      share: 15,
      revenue: 98000,
      tickets: 650,
      color: '#8b5cf6',
      occupancy: '82%',
      badge: '+15% YoY'
    },
    {
      id: 'standard',
      name: 'Standard 2D',
      share: 9,
      revenue: 42000,
      tickets: 410,
      color: '#ea580c',
      occupancy: '71%',
      badge: 'Steady'
    }
  ]

  // Avatar presets for team stack display
  const customerAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80'
  ]

  return (
    <div className="min-h-screen bg-[#f0f3f8] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Top Header Bar */}
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-7 sm:space-y-8">
        {/* ========================================================
            MODULE 2 - ITEM 1 TO 5: THE 5 RESPONSIVE STAT CARDS
            (MATCHING EXACT VIBRANT COLORS, NOTCHES, & SEGMENTED DASHES)
            ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Total Movies - Green Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#228653] text-white p-4.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />

            <div className="absolute right-2 top-2 opacity-15 pointer-events-none">
              <Film className="w-20 h-20" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-base font-bold tracking-tight block">Total Movies</span>
                <span className="text-[11px] text-white/80 font-normal">Active & Upcoming</span>
              </div>
              <button type="button" className="text-white/80 hover:text-white cursor-pointer p-0.5">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight">
                {isLoading ? '...' : totalMoviesCount}
              </span>
              <span className="text-xs font-bold flex items-center gap-0.5">
                24.7% ↑
              </span>
            </div>

            {/* 5 Segmented dashes */}
            <div className="relative z-10 mt-2.5 grid grid-cols-5 gap-1">
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white/60" />
              <div className="h-1 rounded-full bg-white/20" />
              <div className="h-1 rounded-full bg-white/20" />
            </div>
          </div>

          {/* 2. Total Theatres - Blue Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#1f66d0] text-white p-4.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />

            <div className="absolute right-2 top-2 opacity-15 pointer-events-none">
              <Building2 className="w-20 h-20" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-base font-bold tracking-tight block">Total Theatres</span>
                <span className="text-[11px] text-white/80 font-normal">27 Cinema Screens</span>
              </div>
              <button type="button" className="text-white/80 hover:text-white cursor-pointer p-0.5">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight">{totalTheatresCount}</span>
              <span className="text-xs font-bold flex items-center gap-0.5">
                5.28% ↑
              </span>
            </div>

            <div className="relative z-10 mt-2.5 grid grid-cols-5 gap-1">
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white/40" />
              <div className="h-1 rounded-full bg-white/20" />
              <div className="h-1 rounded-full bg-white/20" />
            </div>
          </div>

          {/* 3. Total Bookings - Purple Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#7e22ce] text-white p-4.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />

            <div className="absolute right-2 top-2 opacity-15 pointer-events-none">
              <Ticket className="w-20 h-20" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-base font-bold tracking-tight block">Total Bookings</span>
                <span className="text-[11px] text-white/80 font-normal">Confirmed Passes</span>
              </div>
              <button type="button" className="text-white/80 hover:text-white cursor-pointer p-0.5">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight">
                {totalBookingsCount.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold flex items-center gap-0.5">
                16% ↑
              </span>
            </div>

            <div className="relative z-10 mt-2.5 grid grid-cols-5 gap-1">
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white/20" />
            </div>
          </div>

          {/* 4. Available Shows - Amber/Gold Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#d97706] text-white p-4.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />

            <div className="absolute right-2 top-2 opacity-15 pointer-events-none">
              <Clock className="w-20 h-20" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-base font-bold tracking-tight block">Available Shows</span>
                <span className="text-[11px] text-white/80 font-normal">Across 6 Venues</span>
              </div>
              <button type="button" className="text-white/80 hover:text-white cursor-pointer p-0.5">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight">{availableShowsCount}</span>
              <span className="text-xs font-bold flex items-center gap-0.5">
                12.4% ↑
              </span>
            </div>

            <div className="relative z-10 mt-2.5 grid grid-cols-5 gap-1">
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white/70" />
              <div className="h-1 rounded-full bg-white/20" />
              <div className="h-1 rounded-full bg-white/20" />
            </div>
          </div>

          {/* 5. Today's Bookings - Tangerine Orange Card */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 relative overflow-hidden rounded-2xl bg-[#ea580c] text-white p-4.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f0f3f8]" />

            <div className="absolute right-2 top-2 opacity-15 pointer-events-none">
              <CalendarDays className="w-20 h-20" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-base font-bold tracking-tight block">Today's Bookings</span>
                <span className="text-[11px] text-white/80 font-normal">Live Admissions</span>
              </div>
              <button type="button" className="text-white/80 hover:text-white cursor-pointer p-0.5">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight">{todayBookingsCount}</span>
              <span className="text-xs font-bold flex items-center gap-0.5">
                5.07% ↑
              </span>
            </div>

            <div className="relative z-10 mt-2.5 grid grid-cols-5 gap-1">
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white" />
              <div className="h-1 rounded-full bg-white/30" />
              <div className="h-1 rounded-full bg-white/20" />
            </div>
          </div>
        </section>

        {/* ========================================================
            MODULE 2 - ITEM 9: QUICK ACTION CARDS
            ======================================================== */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#007bff]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Quick Action Cards
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Action 1: Book Tickets */}
            <div
              onClick={() => {
                handleTabChange('now_playing')
                const el = document.getElementById('cinema-catalog')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white border border-slate-200/80 hover:border-blue-400 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs hover:shadow-md flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1f66d0] flex items-center justify-center shrink-0 group-hover:bg-[#1f66d0] group-hover:text-white transition-colors">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#1f66d0] transition-colors">
                  Book Tickets Now
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instant seat reservation
                </p>
              </div>
            </div>

            {/* Quick Action 2: Upcoming Releases */}
            <div
              onClick={() => {
                handleTabChange('upcoming')
                const el = document.getElementById('cinema-catalog')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white border border-slate-200/80 hover:border-purple-400 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs hover:shadow-md flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#7e22ce] flex items-center justify-center shrink-0 group-hover:bg-[#7e22ce] group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#7e22ce] transition-colors">
                  Upcoming Movies
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preview next releases
                </p>
              </div>
            </div>

            {/* Quick Action 3: Theatres & Screens */}
            <div
              onClick={() => {
                handleTabChange('theatres')
                const el = document.getElementById('theatres-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white border border-slate-200/80 hover:border-emerald-400 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs hover:shadow-md flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#228653] flex items-center justify-center shrink-0 group-hover:bg-[#228653] group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#228653] transition-colors">
                  Multiplex Theatres
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Venues & sound specs
                </p>
              </div>
            </div>

            {/* Quick Action 4: View E-Tickets */}
            <div
              onClick={() => {
                const el = document.getElementById('recent-bookings')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white border border-slate-200/80 hover:border-amber-400 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs hover:shadow-md flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:bg-[#ea580c] group-hover:text-white transition-colors">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#ea580c] transition-colors">
                  Recent E-Passes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect & print passes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            MODULE 2 - ITEM 7: REVENUE SUMMARY (DUMMY DATA) & DUAL CHARTS
            ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BadgeIndianRupee className="w-5 h-5 text-[#228653]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Revenue Summary (Dummy Data)
                </h2>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full">
                  INR Box Office
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial performance, theatre format breakdown, and weekly occupancy trend.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 font-medium">Total Monthly Box Office:</span>
              <p className="text-2xl sm:text-3xl font-black text-[#228653] tracking-tight">
                ₹{revenueSummary.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Revenue KPI Summary Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#f8fafc] border border-slate-200/70 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Today's Collection</span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                ₹{revenueSummary.todayRevenue.toLocaleString('en-IN')}
              </p>
              <span className="text-[10.5px] text-[#228653] font-medium flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> 92% online payments
              </span>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200/70 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Weekly Growth</span>
              <p className="text-lg sm:text-xl font-bold text-[#1f66d0] mt-1">
                {revenueSummary.weeklyGrowth}
              </p>
              <span className="text-[10.5px] text-slate-400">vs previous 7 days</span>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200/70 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Average Ticket Rate</span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                ₹{revenueSummary.averageTicketPrice}
              </p>
              <span className="text-[10.5px] text-slate-400">Weighted avg price</span>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200/70 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Seat Occupancy</span>
              <p className="text-lg sm:text-xl font-bold text-[#ea580c] mt-1">
                {revenueSummary.seatOccupancyRate}%
              </p>
              <span className="text-[10.5px] text-slate-400">Peak weekend shows</span>
            </div>
          </div>

          {/* Dual Charts from the reference design */}
          {/* Dual Charts from the reference design (Fully Interactive) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Chart 1: Revenue Statistic Bar Chart */}
            <div className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      Revenue Statistic
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Live Sync
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Monthly breakdown in ₹ (IMAX vs Dolby)</p>
                  </div>

                  {/* Period Filter Tabs */}
                  <div className="inline-flex rounded-xl bg-slate-200/60 p-1 text-xs font-semibold">
                    {['All', 'Q1', 'Q2'].map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => {
                          setRevenuePeriod(period)
                          setActiveBarMonth(null)
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all duration-150 text-[11px] ${
                          revenuePeriod === period
                            ? 'bg-[#228653] text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {period === 'All' ? 'Full Year' : period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legends */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#228653]" />
                    IMAX Laser
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2163e8]" />
                    Dolby Cinema
                  </span>
                </div>

                {/* SVG Bar Chart */}
                <div className="w-full relative">
                  <svg
                    viewBox="0 0 540 240"
                    className="w-full h-56 text-slate-400 select-none overflow-visible"
                  >
                    {[
                      { y: 25, val: '₹70k' },
                      { y: 62, val: '₹65k' },
                      { y: 99, val: '₹60k' },
                      { y: 136, val: '₹55k' },
                      { y: 173, val: '₹50k' },
                      { y: 210, val: '₹45k' }
                    ].map((grid) => (
                      <g key={grid.y}>
                        <text
                          x="34"
                          y={grid.y + 4}
                          fill="#94a3b8"
                          fontSize="10"
                          textAnchor="end"
                          fontWeight="500"
                        >
                          {grid.val}
                        </text>
                        <line
                          x1="42"
                          y1={grid.y}
                          x2="525"
                          y2={grid.y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      </g>
                    ))}

                    {filteredRevenueBars.map((bar) => {
                      const baseY = 210
                      const greenY = baseY - bar.gH
                      const blueY = baseY - bar.bH
                      const isHovered = activeBarMonth?.m === bar.m

                      return (
                        <g
                          key={bar.m}
                          className="cursor-pointer group"
                          onMouseEnter={() => setActiveBarMonth(bar)}
                          onMouseLeave={() => setActiveBarMonth(null)}
                          onClick={() => setActiveBarMonth(activeBarMonth?.m === bar.m ? null : bar)}
                        >
                          {/* Background hover highlight pill */}
                          <rect
                            x={bar.x - 5}
                            y="18"
                            width="48"
                            height="195"
                            rx="8"
                            fill={isHovered ? '#228653' : 'transparent'}
                            opacity={isHovered ? 0.08 : 0}
                            className="transition-opacity duration-150"
                          />

                          {/* Green Bar (IMAX Laser) */}
                          <rect
                            x={bar.x}
                            y={greenY}
                            width="17"
                            height={bar.gH}
                            rx="8.5"
                            fill="#228653"
                            className="transition-all duration-200"
                            filter={isHovered ? 'brightness(1.1)' : 'none'}
                          />
                          <rect
                            x={bar.x}
                            y={greenY}
                            width="17"
                            height={Math.min(bar.gH * 0.45, 50)}
                            rx="8.5"
                            fill="#34a853"
                            opacity={isHovered ? 1 : 0.85}
                          />

                          {/* Blue Bar (Dolby Cinema) */}
                          <rect
                            x={bar.x + 20}
                            y={blueY}
                            width="17"
                            height={bar.bH}
                            rx="8.5"
                            fill="#2163e8"
                            className="transition-all duration-200"
                            filter={isHovered ? 'brightness(1.15)' : 'none'}
                          />

                          {/* Month Label */}
                          <text
                            x={bar.x + 18}
                            y="230"
                            fill={isHovered ? '#0f172a' : '#64748b'}
                            fontSize="11"
                            textAnchor="middle"
                            fontWeight={isHovered ? '700' : '500'}
                          >
                            {bar.m}
                          </text>

                          {/* Active Value Bubble on Top */}
                          {isHovered && (
                            <g>
                              <rect
                                x={bar.x - 12}
                                y={Math.min(greenY, blueY) - 24}
                                width="62"
                                height="20"
                                rx="10"
                                fill="#0f172a"
                              />
                              <text
                                x={bar.x + 19}
                                y={Math.min(greenY, blueY) - 10}
                                fill="#ffffff"
                                fontSize="9.5"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {bar.growth}
                              </text>
                            </g>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>

              {/* Bottom Interactive Info Strip */}
              <div className="mt-3 pt-3 border-t border-slate-200/70 text-xs">
                {activeBarMonth ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#228653] text-white font-bold rounded-md text-[11px]">
                        {activeBarMonth.m} ({activeBarMonth.quarter})
                      </span>
                      <span className="font-semibold text-slate-800">
                        Total: ₹{(activeBarMonth.imax + activeBarMonth.dolby).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#228653]" />
                        IMAX: ₹{activeBarMonth.imax.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#2163e8]" />
                        Dolby: ₹{activeBarMonth.dolby.toLocaleString()}
                      </span>
                      <span className="font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        🎟 {activeBarMonth.tickets} seats
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-slate-500 py-1 px-1">
                    <span>💡 Hover or tap any bar column to inspect detailed screen format revenue</span>
                    <span className="font-bold text-slate-700">
                      Total: ₹{filteredRevenueBars.reduce((acc, b) => acc + b.imax + b.dolby, 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Profit Chart / Occupancy Curve */}
            <div className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      Profit Chart
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                        Analytics
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Occupancy & net profit dynamics</p>
                  </div>

                  {/* Metric Toggle Tabs */}
                  <div className="inline-flex rounded-xl bg-slate-200/60 p-1 text-xs font-semibold">
                    {[
                      { key: 'both', label: 'All' },
                      { key: 'profit', label: 'Profit %' },
                      { key: 'occupancy', label: 'Occupancy %' }
                    ].map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => setProfitMetricView(mode.key)}
                        className={`px-2.5 py-1 rounded-lg transition-all duration-150 text-[11px] ${
                          profitMetricView === mode.key
                            ? 'bg-[#228653] text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legends */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 mb-2">
                  {(profitMetricView === 'both' || profitMetricView === 'profit') && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#15803d] rounded-full" />
                      Net Profit %
                    </span>
                  )}
                  {(profitMetricView === 'both' || profitMetricView === 'occupancy') && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t-2 border-dashed border-[#2563eb]" />
                      Seat Occupancy %
                    </span>
                  )}
                </div>

                {/* SVG Curve Chart */}
                <div className="w-full relative">
                  <svg
                    viewBox="0 0 540 240"
                    className="w-full h-56 text-slate-400 select-none overflow-visible cursor-crosshair"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const mouseX = ((e.clientX - rect.left) / rect.width) * 540
                      // Find closest point in profitChartData
                      let closest = profitChartData[0]
                      let minDiff = Math.abs(profitChartData[0].x - mouseX)
                      for (const pt of profitChartData) {
                        const diff = Math.abs(pt.x - mouseX)
                        if (diff < minDiff) {
                          minDiff = diff
                          closest = pt
                        }
                      }
                      setActiveProfitPoint(closest)
                    }}
                    onMouseLeave={() => setActiveProfitPoint(null)}
                  >
                    <defs>
                      <linearGradient id="profitGradRev" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#228653" stopOpacity="0.25" />
                        <stop offset="85%" stopColor="#228653" stopOpacity="0.02" />
                        <stop offset="100%" stopColor="#228653" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {[
                      { y: 25, val: '110%' },
                      { y: 62, val: '100%' },
                      { y: 99, val: '90%' },
                      { y: 136, val: '80%' },
                      { y: 173, val: '70%' },
                      { y: 210, val: '60%' }
                    ].map((grid) => (
                      <g key={grid.y}>
                        <text
                          x="34"
                          y={grid.y + 4}
                          fill="#94a3b8"
                          fontSize="10"
                          textAnchor="end"
                          fontWeight="500"
                        >
                          {grid.val}
                        </text>
                        <line
                          x1="42"
                          y1={grid.y}
                          x2="525"
                          y2={grid.y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      </g>
                    ))}

                    {/* Gradient Fill under Green Profit Curve */}
                    {(profitMetricView === 'both' || profitMetricView === 'profit') && (
                      <path
                        d="M 50 155 C 80 135, 100 135, 130 165 C 160 195, 180 195, 210 150 C 235 115, 255 60, 280 110 C 305 150, 325 145, 350 60 C 375 20, 395 60, 420 140 C 445 160, 480 145, 515 155 L 515 210 L 50 210 Z"
                        fill="url(#profitGradRev)"
                        className="transition-opacity duration-300"
                      />
                    )}

                    {/* Blue Dashed Curve (Occupancy) */}
                    {(profitMetricView === 'both' || profitMetricView === 'occupancy') && (
                      <path
                        d="M 50 140 C 80 170, 110 160, 140 125 C 170 105, 190 165, 220 195 C 250 140, 275 130, 305 95 C 335 80, 365 135, 395 100 C 425 80, 455 165, 485 120 C 500 110, 510 115, 515 125"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Green Solid Curve (Profit) */}
                    {(profitMetricView === 'both' || profitMetricView === 'profit') && (
                      <path
                        d="M 50 155 C 80 135, 100 135, 130 165 C 160 195, 180 195, 210 150 C 235 115, 255 60, 280 110 C 305 150, 325 145, 350 60 C 375 20, 395 60, 420 140 C 445 160, 480 145, 515 155"
                        fill="none"
                        stroke="#15803d"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Data Points and Interactivity */}
                    {profitChartData.map((pt) => {
                      const isHovered = activeProfitPoint?.m === pt.m
                      return (
                        <g
                          key={pt.m}
                          className="cursor-pointer"
                          onClick={() => setActiveProfitPoint(activeProfitPoint?.m === pt.m ? null : pt)}
                        >
                          {/* Invisible hit-area */}
                          <rect
                            x={pt.x - 20}
                            y="20"
                            width="40"
                            height="190"
                            fill="transparent"
                          />

                          {/* Green Profit Dot */}
                          {(profitMetricView === 'both' || profitMetricView === 'profit') && (
                            <circle
                              cx={pt.x}
                              cy={pt.profitY}
                              r={isHovered ? 5.5 : 3.5}
                              fill="#15803d"
                              stroke="#ffffff"
                              strokeWidth={isHovered ? 2.5 : 1.5}
                              className="transition-all duration-150"
                            />
                          )}

                          {/* Blue Occupancy Dot */}
                          {(profitMetricView === 'both' || profitMetricView === 'occupancy') && (
                            <circle
                              cx={pt.x}
                              cy={pt.occupancyY}
                              r={isHovered ? 5 : 3}
                              fill="#2563eb"
                              stroke="#ffffff"
                              strokeWidth={isHovered ? 2 : 1}
                              className="transition-all duration-150"
                            />
                          )}

                          {/* Month X-Axis Label */}
                          <text
                            x={pt.x}
                            y="230"
                            fill={isHovered ? '#0f172a' : '#64748b'}
                            fontSize="11"
                            textAnchor="middle"
                            fontWeight={isHovered ? '700' : '500'}
                          >
                            {pt.m}
                          </text>
                        </g>
                      )
                    })}

                    {/* Active Point Vertical Crosshair Line and Tooltip */}
                    {activeProfitPoint && (
                      <g>
                        <line
                          x1={activeProfitPoint.x}
                          y1="22"
                          x2={activeProfitPoint.x}
                          y2="210"
                          stroke="#0f172a"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          opacity="0.4"
                        />
                        {/* Hover Ring on active dot */}
                        {(profitMetricView === 'both' || profitMetricView === 'profit') && (
                          <circle
                            cx={activeProfitPoint.x}
                            cy={activeProfitPoint.profitY}
                            r="9"
                            fill="#15803d"
                            opacity="0.25"
                          />
                        )}
                        {(profitMetricView === 'both' || profitMetricView === 'occupancy') && (
                          <circle
                            cx={activeProfitPoint.x}
                            cy={activeProfitPoint.occupancyY}
                            r="9"
                            fill="#2563eb"
                            opacity="0.25"
                          />
                        )}
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Bottom Interactive Info Strip */}
              <div className="mt-3 pt-3 border-t border-slate-200/70 text-xs">
                {activeProfitPoint ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#0f172a] text-white font-bold rounded-md text-[11px]">
                        {activeProfitPoint.m}
                      </span>
                      <span className="text-slate-500 font-medium italic">
                        &quot;{activeProfitPoint.note}&quot;
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 text-[11px] font-semibold">
                      {(profitMetricView === 'both' || profitMetricView === 'profit') && (
                        <span className="flex items-center gap-1 text-[#15803d]">
                          <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                          Profit: {activeProfitPoint.profitVal}
                        </span>
                      )}
                      {(profitMetricView === 'both' || profitMetricView === 'occupancy') && (
                        <span className="flex items-center gap-1 text-[#2563eb]">
                          <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                          Occupancy: {activeProfitPoint.occupancyVal}
                        </span>
                      )}
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                        Net: {activeProfitPoint.revenue}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-slate-500 py-1 px-1">
                    <span>💡 Hover or move cursor over the curve to inspect profit & occupancy metrics</span>
                    <span className="font-bold text-slate-700">
                      Avg Occupancy: 83%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            MODULE 2 - ITEM 8: RECENT BOOKINGS & CINEMA CHECKLIST
            ======================================================== */}
        <section id="recent-bookings" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Bookings Table (8 cols) styled as Project Details */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/60">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Recent Bookings
                </h2>
                <span className="text-xs text-slate-400">
                  Live ticket reservation transactions feed ({bookings.length})
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 font-bold text-xs border-b border-slate-100 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Movie & Venue</th>
                    <th className="py-2.5 px-3">Format Tier</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {bookings.slice(0, 4).map((b, idx) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Customer Stack */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center">
                            <img
                              src={customerAvatars[idx % customerAvatars.length]}
                              alt={b.userName}
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-2xs"
                            />
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white -ml-1.5">
                              {idx + 3}+
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{b.userName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{b.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Movie Name & Screen */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-900 text-xs block">{b.movieTitle}</span>
                        <span className="text-[11px] text-slate-400 block">{b.screen} • {b.showtime}</span>
                      </td>

                      {/* Format Priority Line */}
                      <td className="py-3.5 px-3">
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: idx === 0 ? '70%' : idx === 1 ? '50%' : '40%',
                              backgroundColor: idx === 0 ? '#228653' : idx === 1 ? '#1f66d0' : '#7e22ce'
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                          {b.seats?.join(', ')}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${
                            idx === 0
                              ? 'bg-[#ea580c] text-white'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {b.status || 'Confirmed'}
                        </span>
                      </td>

                      {/* Amount in ₹ */}
                      <td className="py-3.5 px-3 font-extrabold text-[#228653] text-sm">
                        ₹{b.totalAmount}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTicket(b)}
                          className="text-xs font-bold text-[#1f66d0] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          View Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cinema Analytics: Format & Sales Share (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#228653]" />
                    Format Share
                  </h2>
                  <span className="text-xs text-slate-400">Live box office & format share</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
              </div>

              {/* Interactive Donut Chart */}
              <div className="relative flex items-center justify-center my-2">
                <svg
                  viewBox="0 0 160 160"
                  className="w-36 h-36 select-none overflow-visible"
                >
                  {/* Background Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="56"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  {(() => {
                    const radius = 56
                    const circumference = 2 * Math.PI * radius
                    let cumulative = 0
                    return formatShareData.map((item) => {
                      const dashLength = (item.share / 100) * circumference
                      const dashOffset = -(cumulative / 100) * circumference
                      cumulative += item.share
                      const isSelected = selectedFormat?.id === item.id

                      return (
                        <circle
                          key={item.id}
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth={isSelected ? 18 : 13}
                          strokeDasharray={`${dashLength - 2} ${circumference - dashLength + 2}`}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          transform="rotate(-90 80 80)"
                          className="transition-all duration-200 cursor-pointer hover:opacity-90"
                          onMouseEnter={() => setSelectedFormat(item)}
                          onMouseLeave={() => setSelectedFormat(null)}
                          onClick={() => setSelectedFormat(selectedFormat?.id === item.id ? null : item)}
                        />
                      )
                    })
                  })()}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                  {selectedFormat ? (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[90px]">
                        {selectedFormat.name}
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 leading-tight">
                        {selectedFormat.share}%
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        ₹{(selectedFormat.revenue / 1000).toFixed(0)}k
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Sales
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 leading-tight">
                        4,320
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        ₹6.19L Gross
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Format Progress Rows */}
              <div className="space-y-2 mt-2">
                {formatShareData.map((item) => {
                  const isSelected = selectedFormat?.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedFormat(selectedFormat?.id === item.id ? null : item)}
                      className={`p-2 rounded-xl cursor-pointer transition-all duration-150 border ${
                        isSelected
                          ? 'bg-slate-50 border-slate-300 shadow-2xs'
                          : 'hover:bg-slate-50/70 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold text-slate-800 text-[12px]">{item.name}</span>
                          <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                            {item.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">{item.occupancy} occ.</span>
                          <span className="font-bold text-slate-900 text-xs">
                            ₹{(item.revenue / 1000).toFixed(0)}k
                          </span>
                          <span className="text-slate-500 font-bold w-6 text-right text-[11px]">
                            {item.share}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.share}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer summary */}
            <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Top: IMAX Laser (42% Share)
              </span>
              <span className="text-[#228653] font-bold">VS Central Live</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            MODULE 2 - ITEM 6: UPCOMING MOVIES & LIVE CINEMA CATALOG
            (NOW PLAYING / UPCOMING MOVIES / THEATRES TABS)
            ======================================================== */}
        <section id="cinema-catalog" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/60 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#007bff]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {activeTab === 'upcoming' ? 'Upcoming Movies' : 'Live Cinema Catalog'}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'upcoming'
                  ? 'Official upcoming releases synced from TMDB third-party API.'
                  : 'Real-time releases with instant seat reservation.'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('now_playing')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'now_playing' && !searchQuery
                    ? 'bg-[#007bff] text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Now Playing ({nowPlayingMovies.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('upcoming')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'upcoming' && !searchQuery
                    ? 'bg-[#007bff] text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Upcoming Movies ({upcomingMovies.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('theatres')}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'theatres'
                    ? 'bg-[#007bff] text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Theatres ({theatres.length})</span>
              </button>
            </div>
          </div>

          {/* Conditional Display: Theatres Tab or Movies Grid */}
          {activeTab === 'theatres' ? (
            <div id="theatres-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {theatres.map((th) => (
                <div
                  key={th.id}
                  className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 hover:border-blue-400 hover:bg-white transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {th.location}
                      </span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold text-[11px]">
                        {th.screensCount} Screens
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-2">
                      {th.name}
                    </h3>
                    <p className="text-xs text-purple-700 font-medium mt-1">
                      🔊 {th.soundSystem}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/70">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1.5">
                      Auditorium Facilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {th.facilities.map((fac) => (
                        <span key={fac} className="bg-white border border-slate-200 text-slate-700 text-[11px] px-2 py-0.5 rounded shadow-2xs">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-[#007bff] animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                Fetching live releases from TMDB Cloud API...
              </p>
            </div>
          ) : displayedMovies.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <Film className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No movies found matching your search.</p>
            </div>
          ) : (
            <div>
              {/* Symmetrical 4 Movies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#007bff] transition-all duration-300 flex flex-col group hover:shadow-lg shadow-2xs"
                  >
                    {/* Movie Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-600 flex items-center gap-1 border border-white/40 shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{movie.rating}</span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
                          {movie.genre}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 leading-snug drop-shadow-md line-clamp-1">
                          {movie.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Details & Actions */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5 bg-white">
                      <div className="space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <Clock className="w-3 h-3 text-[#007bff]" />
                            {movie.duration}
                          </span>
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                            {movie.screen}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-slate-500 text-xs leading-relaxed pt-1">
                          {movie.overview}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                            {activeTab === 'upcoming' ? 'Est. Ticket' : 'From'}
                          </span>
                          <span className="text-base font-extrabold text-[#228653]">
                            ₹{movie.price}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenBooking(movie)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{activeTab === 'upcoming' ? 'Advance Book' : 'Book Seats'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More / Show Less Toggle Button aligned right with no background */}
              {displayedMovies.length > 4 && (
                <div className="flex justify-end pt-5 pb-1">
                  {visibleCount < displayedMovies.length ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCount(displayedMovies.length)}
                      className="group inline-flex items-center gap-2 text-[#007bff] hover:text-blue-700 font-bold text-sm transition-all duration-200 cursor-pointer hover:gap-2.5"
                    >
                      <span>Show More</span>
                      <span className="text-xs text-slate-400 font-normal">
                        (+{displayedMovies.length - visibleCount} balance)
                      </span>
                      <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setVisibleCount(4)
                        const el = document.getElementById('cinema-catalog')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="group inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-all duration-200 cursor-pointer hover:gap-2"
                    >
                      <span>Show Less</span>
                      <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ========================================================
          SEAT RESERVATION MODAL
          ======================================================== */}
      {isBookingModalOpen && selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-10 h-14 object-cover rounded-lg shadow-xs"
                />
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {selectedMovie.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedMovie.screen} • ₹{selectedMovie.price} / ticket
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Showtime Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Showtime
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(selectedMovie.showtimes || ['1:15 PM', '4:30 PM', '7:45 PM', '10:15 PM']).map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedShowtime(time)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        selectedShowtime === time
                          ? 'bg-[#007bff] text-white border-[#007bff] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theater Cinema Curved Screen */}
              <div className="py-1 text-center">
                <div className="w-4/5 h-1.5 bg-gradient-to-r from-transparent via-[#007bff] to-transparent mx-auto rounded-full shadow-[0_0_8px_#007bff]" />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block mt-1.5">
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
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-[#007bff] text-white ring-2 ring-blue-300 shadow-xs scale-105'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {seat}
                      </button>
                    )
                  })}
                </div>

                {/* Seat Legend */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#007bff]" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-100 opacity-50" />
                    <span>Occupied</span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Selected Seats:</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ticket Rate:</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedSeats.length} × ₹{selectedMovie.price}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-[#228653] font-extrabold text-base">
                    ₹{selectedSeats.length * selectedMovie.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={selectedSeats.length === 0}
                className="flex-1 py-2.5 px-4 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm Reservation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DIGITAL E-TICKET PASS MODAL
          ======================================================== */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative">
            <button
              type="button"
              onClick={() => setActiveTicket(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ticket Header */}
            <div className="bg-[#1f66d0] p-5 text-white text-center border-b border-blue-700">
              <span className="text-[10px] uppercase tracking-widest text-sky-200 font-bold">
                VS Cinemas Official E-Pass
              </span>
              <h3 className="text-xl font-bold mt-1">{activeTicket.movieTitle}</h3>
              <p className="text-xs text-sky-100 mt-0.5">{activeTicket.screen}</p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Booking ID</span>
                  <span className="text-[#1f66d0] font-mono font-bold text-sm">{activeTicket.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Showtime</span>
                  <span className="text-slate-800 font-bold text-sm">{activeTicket.showtime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Seats</span>
                  <span className="text-[#7e22ce] font-bold text-sm">{activeTicket.seats?.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Paid Amount</span>
                  <span className="text-[#228653] font-bold text-sm">₹{activeTicket.totalAmount}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="text-center py-2 border-t border-slate-100">
                <div className="flex justify-center items-center gap-1.5 py-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="h-10 w-1 bg-black" />
                  <div className="h-10 w-2 bg-black" />
                  <div className="h-10 w-0.5 bg-black" />
                  <div className="h-10 w-3 bg-black" />
                  <div className="h-10 w-1 bg-black" />
                  <div className="h-10 w-2 bg-black" />
                  <div className="h-10 w-1 bg-black" />
                  <div className="h-10 w-3 bg-black" />
                  <div className="h-10 w-0.5 bg-black" />
                  <div className="h-10 w-2 bg-black" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  Scan at VS Cinemas Turnstile Entrance
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
                className="w-full py-2.5 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print or Save Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
