import { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp,
  BadgeIndianRupee,
  Ticket,
  Film,
  Building2,
  Users,
  Clock,
  Download,
  Printer,
  RefreshCw,
  Filter,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
  Percent,
  CreditCard,
  ArrowUpRight,
  PieChart,
  Flame
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import { THEATRES_LIST, bookingService } from '../services/api'
import { useAuth } from '../context/AuthContext'

// ============================================================================
// DUMMY HISTORICAL DATASETS FOR REPORTS & ANALYTICS
// ============================================================================

// 1. Daily Booking Trends (Last 14 Days)
const DAILY_TRENDS_DATA = [
  { date: '18 Sep', day: 'Thu', bookings: 68, tickets: 172, revenue: 48500, occupancy: 74, isWeekend: false, peakMovie: 'Creed III' },
  { date: '19 Sep', day: 'Fri', bookings: 94, tickets: 245, revenue: 71200, occupancy: 86, isWeekend: true, peakMovie: 'Oppenheimer' },
  { date: '20 Sep', day: 'Sat', bookings: 132, tickets: 358, revenue: 104500, occupancy: 95, isWeekend: true, peakMovie: 'Avatar: The Way of Water' },
  { date: '21 Sep', day: 'Sun', bookings: 145, tickets: 392, revenue: 115800, occupancy: 98, isWeekend: true, peakMovie: 'Avatar: The Way of Water' },
  { date: '22 Sep', day: 'Mon', bookings: 54, tickets: 138, revenue: 39600, occupancy: 68, isWeekend: false, peakMovie: 'Creed III' },
  { date: '23 Sep', day: 'Tue', bookings: 62, tickets: 156, revenue: 44200, occupancy: 71, isWeekend: false, peakMovie: 'Dune: Part Two' },
  { date: '24 Sep', day: 'Wed', bookings: 59, tickets: 148, revenue: 42100, occupancy: 70, isWeekend: false, peakMovie: 'Creed III' },
  { date: '25 Sep', day: 'Thu', bookings: 71, tickets: 180, revenue: 51200, occupancy: 76, isWeekend: false, peakMovie: 'The Batman' },
  { date: '26 Sep', day: 'Fri', bookings: 102, tickets: 268, revenue: 78400, occupancy: 89, isWeekend: true, peakMovie: 'Interstellar' },
  { date: '27 Sep', day: 'Sat', bookings: 138, tickets: 374, revenue: 109200, occupancy: 96, isWeekend: true, peakMovie: 'Creed III' },
  { date: '28 Sep', day: 'Sun', bookings: 148, tickets: 405, revenue: 118900, occupancy: 99, isWeekend: true, peakMovie: 'Oppenheimer' },
  { date: '29 Sep', day: 'Mon', bookings: 58, tickets: 145, revenue: 41800, occupancy: 69, isWeekend: false, peakMovie: 'John Wick: Chapter 4' },
  { date: '30 Sep', day: 'Tue', bookings: 65, tickets: 164, revenue: 46800, occupancy: 73, isWeekend: false, peakMovie: 'Dune: Part Two' },
  { date: '01 Oct', day: 'Today', bookings: 88, tickets: 226, revenue: 64900, occupancy: 85, isWeekend: false, peakMovie: 'Creed III' }
]

// 2. Monthly Revenue Data (Jan - Oct 2026) with Multi-format breakdown
const MONTHLY_REVENUE_DATA = [
  { month: 'Jan', imax: 112000, dolby: 84000, sensory4dx: 52000, standard: 34000, total: 282000, occupancy: 76 },
  { month: 'Feb', imax: 125000, dolby: 92000, sensory4dx: 58000, standard: 38000, total: 313000, occupancy: 79 },
  { month: 'Mar', imax: 148000, dolby: 108000, sensory4dx: 72000, standard: 42000, total: 370000, occupancy: 84 },
  { month: 'Apr', imax: 136000, dolby: 98000, sensory4dx: 64000, standard: 40000, total: 338000, occupancy: 81 },
  { month: 'May', imax: 162000, dolby: 124000, sensory4dx: 82000, standard: 48000, total: 416000, occupancy: 88 },
  { month: 'Jun', imax: 154000, dolby: 116000, sensory4dx: 76000, standard: 45000, total: 391000, occupancy: 85 },
  { month: 'Jul', imax: 178000, dolby: 138000, sensory4dx: 94000, standard: 52000, total: 462000, occupancy: 91 },
  { month: 'Aug', imax: 168000, dolby: 128000, sensory4dx: 88000, standard: 49000, total: 433000, occupancy: 87 },
  { month: 'Sep', imax: 172000, dolby: 132000, sensory4dx: 91000, standard: 51000, total: 446000, occupancy: 89 },
  { month: 'Oct', imax: 185000, dolby: 142000, sensory4dx: 98000, standard: 55000, total: 480000, occupancy: 93 }
]

// 3. Revenue by Cinema Format Share
const FORMAT_SHARE = [
  { format: 'IMAX Laser 3D', revenue: 1540000, percentage: 39.2, color: '#38bdf8', icon: '🎬', screens: 6, ticketPrice: 380 },
  { format: 'Dolby Cinema Atmos', revenue: 1162000, percentage: 29.6, color: '#818cf8', icon: '🔊', screens: 8, ticketPrice: 340 },
  { format: '4DX Sensory Experience', revenue: 785000, percentage: 20.0, color: '#f59e0b', icon: '⚡', screens: 4, ticketPrice: 420 },
  { format: 'Auditorium Standard', revenue: 444000, percentage: 11.2, color: '#10b981', icon: '🪑', screens: 10, ticketPrice: 220 }
]

// 4. Seat Occupancy by Tier & Time Slots
const OCCUPANCY_TIERS = [
  { tier: 'Premium Tier (Rows C - D)', occupancy: 92.4, seats: '840 / 910', color: '#10b981', avgPrice: 340, demand: 'Very High' },
  { tier: 'Executive Tier (Rows E - F)', occupancy: 84.8, seats: '1,120 / 1,320', color: '#3b82f6', avgPrice: 280, demand: 'High' },
  { tier: 'Standard Tier (Rows A - B)', occupancy: 72.5, seats: '680 / 940', color: '#f59e0b', avgPrice: 220, demand: 'Moderate' }
]

const OCCUPANCY_TIME_SLOTS = [
  { slot: 'Morning Shows', time: '10:00 AM - 1:00 PM', rate: 64.2, color: '#94a3b8' },
  { slot: 'Matinee Shows', time: '1:30 PM - 4:45 PM', rate: 78.5, color: '#60a5fa' },
  { slot: 'Evening Prime', time: '5:30 PM - 8:30 PM', rate: 95.8, color: '#10b981' },
  { slot: 'Late Night Block', time: '9:00 PM - 11:45 PM', rate: 88.4, color: '#8b5cf6' }
]

// 5. Payment Channel Breakdown
const PAYMENT_CHANNELS = [
  { method: 'UPI (GPay / PhonePe / Paytm)', percentage: 58.4, volume: '₹22,94,800', count: 4890, growth: '+24%' },
  { method: 'Credit & Debit Cards (Visa / MC / RuPay)', percentage: 27.2, volume: '₹10,68,900', count: 2140, growth: '+8%' },
  { method: 'Net Banking & Corporate Pass', percentage: 9.6, volume: '₹3,77,200', count: 680, growth: '+4%' },
  { method: 'Digital Wallets & Cinema Gift Cards', percentage: 4.8, volume: '₹1,88,600', count: 410, growth: '+12%' }
]

// 6. Top Performing Movies Dataset
const TOP_PERFORMING_MOVIES = [
  {
    rank: 1,
    id: 'mov-1',
    title: 'Creed III',
    poster: 'https://image.tmdb.org/t/p/w500/cvsXj3I9Q00I9igWv1hv39RuwNJ.jpg',
    genre: 'Drama / Action',
    language: 'English',
    ticketsSold: 1842,
    bookingsCount: 712,
    revenue: 534180,
    occupancyRate: 94.6,
    avgRating: 7.9,
    status: 'Blockbuster Hit'
  },
  {
    rank: 2,
    id: 'mov-2',
    title: 'Avatar: The Way of Water',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    genre: 'Sci-Fi / Adventure',
    language: 'English',
    ticketsSold: 1620,
    bookingsCount: 645,
    revenue: 486000,
    occupancyRate: 92.8,
    avgRating: 8.2,
    status: 'Blockbuster Hit'
  },
  {
    rank: 3,
    id: 'mov-3',
    title: 'Oppenheimer',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    genre: 'Biography / Drama',
    language: 'English',
    ticketsSold: 1410,
    bookingsCount: 560,
    revenue: 451200,
    occupancyRate: 89.4,
    avgRating: 8.9,
    status: 'Superhit'
  },
  {
    rank: 4,
    id: 'mov-4',
    title: 'Dune: Part Two',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    genre: 'Sci-Fi / Adventure',
    language: 'English',
    ticketsSold: 1180,
    bookingsCount: 472,
    revenue: 389400,
    occupancyRate: 86.2,
    avgRating: 8.6,
    status: 'Superhit'
  },
  {
    rank: 5,
    id: 'mov-5',
    title: 'John Wick: Chapter 4',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    genre: 'Action / Thriller',
    language: 'English',
    ticketsSold: 980,
    bookingsCount: 395,
    revenue: 303800,
    occupancyRate: 81.5,
    avgRating: 8.0,
    status: 'Hit'
  }
]

export default function Reports() {
  const { user } = useAuth()

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [timeRange, setTimeRange] = useState('30d') // '7d' | '14d' | '30d' | 'all'
  const [selectedTheatreFilter, setSelectedTheatreFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('movies') // 'movies' | 'theatres' | 'transactions' | 'occupancy'
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTableQuery, setSearchTableQuery] = useState('')
  const [activeChartPoint, setActiveChartPoint] = useState(null)
  const [revenueMetricView, setRevenueMetricView] = useState('all') // 'all' | 'imax' | 'dolby' | 'sensory4dx'

  // Load real-time local bookings to dynamically increment aggregate totals
  const [liveBookings, setLiveBookings] = useState(() => bookingService.getAllBookings())
  const [liveHighlightId, setLiveHighlightId] = useState(null)

  // Real-time subscription to bookings (in-tab & cross-tab sync)
  useEffect(() => {
    const unsubscribe = bookingService.subscribe((updated) => {
      setLiveBookings(updated)
      if (updated.length > 0) {
        setLiveHighlightId(updated[0].id)
      }
    })
    return unsubscribe
  }, [])

  // Refresh data trigger
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLiveBookings(bookingService.getAllBookings())
      setIsRefreshing(false)
      toast.success('📊 Reports & Analytics refreshed with real-time data!')
    }, 400)
  }

  // --------------------------------------------------------------------------
  // DYNAMIC AGGREGATIONS COMBINING LOCALSTORAGE & BENCHMARK DATA
  // --------------------------------------------------------------------------
  const analyticsSummary = useMemo(() => {
    // 1. Total Live Bookings count
    const totalLocalBookings = liveBookings.length
    const confirmedCount = liveBookings.filter((b) => b.status === 'Confirmed').length
    const cancelledCount = liveBookings.filter((b) => b.status === 'Cancelled').length

    // Historical baseline (e.g. past months seed)
    const baseBookings = 1240
    const calculatedTotalBookings = baseBookings + totalLocalBookings

    // 2. Total Live Revenue calculation
    const liveRevenue = liveBookings.reduce((sum, b) => {
      if (b.status === 'Cancelled') return sum
      return sum + (Number(b.totalAmount) || Number(b.baseTicketsTotal) || 0)
    }, 0)

    const baseRevenue = 4125000 // ₹41,25,000 baseline
    const calculatedTotalRevenue = baseRevenue + liveRevenue

    // 3. Most Booked Movie calculation
    const movieBookingCounts = {}
    liveBookings.forEach((b) => {
      if (b.movieTitle) {
        movieBookingCounts[b.movieTitle] = (movieBookingCounts[b.movieTitle] || 0) + (b.seats?.length || 2)
      }
    })

    // Find if any live movie exceeds or matches
    let mostBookedMovie = TOP_PERFORMING_MOVIES[0]
    let maxSeats = TOP_PERFORMING_MOVIES[0].ticketsSold

    TOP_PERFORMING_MOVIES.forEach((m) => {
      const liveSeats = movieBookingCounts[m.title] || 0
      const combined = m.ticketsSold + liveSeats
      if (combined > maxSeats) {
        maxSeats = combined
        mostBookedMovie = { ...m, ticketsSold: combined }
      }
    })

    // 4. Most Popular Theatre calculation
    const theatreBookingCounts = {}
    liveBookings.forEach((b) => {
      if (b.theatreId) {
        theatreBookingCounts[b.theatreId] = (theatreBookingCounts[b.theatreId] || 0) + 1
      }
    })

    // Base performance by theatre
    const rankedTheatres = THEATRES_LIST.map((th, idx) => {
      const extra = theatreBookingCounts[th.id] || 0
      const totalBookingsCount = 380 + (idx === 0 ? 140 : idx === 1 ? 95 : 45) + extra * 12
      const capacityRate = Math.min(96.8, 82.5 + (idx === 0 ? 7.2 : idx === 1 ? 5.1 : 2.0) + extra * 0.4)
      const rev = totalBookingsCount * 820
      return {
        ...th,
        totalBookingsCount,
        capacityRate: Number(capacityRate.toFixed(1)),
        revenue: rev
      }
    }).sort((a, b) => b.totalBookingsCount - a.totalBookingsCount)

    const mostPopularTheatre = rankedTheatres[0]

    // 5. Seat Occupancy Rate overall (dynamically adjusts with live reservations)
    const overallOccupancy = Math.min(98.4, Number((84.6 + liveBookings.length * 0.12).toFixed(1)))

    // 6. Average Ticket Price & Order Value
    const totalTicketsEstimated = calculatedTotalBookings * 2.4
    const atp = Math.round(calculatedTotalRevenue / totalTicketsEstimated)
    const aov = Math.round(calculatedTotalRevenue / calculatedTotalBookings)

    return {
      totalBookings: calculatedTotalBookings,
      confirmedCount,
      cancelledCount,
      totalRevenue: calculatedTotalRevenue,
      mostBookedMovie,
      mostPopularTheatre,
      rankedTheatres,
      seatOccupancyRate: overallOccupancy,
      atp,
      aov,
      growthMoM: '+18.4%',
      bookingsGrowth: '+14.2%'
    }
  }, [liveBookings])

  // Filtered Daily Trends augmented with live bookings
  const filteredDailyTrends = useMemo(() => {
    const todayBookings = liveBookings.filter((b) => b.status !== 'Cancelled')
    const todayRev = todayBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)
    const todayTix = todayBookings.reduce((sum, b) => sum + (b.seats?.length || 2), 0)

    const baseData = DAILY_TRENDS_DATA.map((item, idx) => {
      if (idx === DAILY_TRENDS_DATA.length - 1) {
        return {
          ...item,
          bookings: item.bookings + todayBookings.length,
          tickets: item.tickets + todayTix,
          revenue: item.revenue + todayRev,
          occupancy: Math.min(99, Number((item.occupancy + todayBookings.length * 0.3).toFixed(1)))
        }
      }
      return item
    })

    if (timeRange === '7d') return baseData.slice(-7)
    if (timeRange === '14d') return baseData.slice(-14)
    return baseData
  }, [liveBookings, timeRange])

  // Filtered Top Movies Table dynamically incorporating live bookings
  const filteredMoviesTable = useMemo(() => {
    const movieStats = {}
    liveBookings.forEach((b) => {
      if (b.movieTitle && b.status !== 'Cancelled') {
        const title = b.movieTitle
        const seats = b.seats?.length || 2
        const rev = Number(b.totalAmount) || 500
        movieStats[title] = {
          tickets: (movieStats[title]?.tickets || 0) + seats,
          bookings: (movieStats[title]?.bookings || 0) + 1,
          revenue: (movieStats[title]?.revenue || 0) + rev
        }
      }
    })

    let list = TOP_PERFORMING_MOVIES.map((m) => {
      const extra = movieStats[m.title] || { tickets: 0, bookings: 0, revenue: 0 }
      return {
        ...m,
        ticketsSold: m.ticketsSold + extra.tickets,
        bookingsCount: m.bookingsCount + extra.bookings,
        revenue: m.revenue + extra.revenue
      }
    }).sort((a, b) => b.revenue - a.revenue)

    if (searchTableQuery.trim()) {
      const q = searchTableQuery.toLowerCase()
      list = list.filter((m) => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q))
    }
    return list
  }, [liveBookings, searchTableQuery])

  // Monthly Revenue augmented with live bookings
  const monthlyRevenueWithLive = useMemo(() => {
    const liveRevenue = liveBookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)

    return MONTHLY_REVENUE_DATA.map((item, idx) => {
      if (idx === MONTHLY_REVENUE_DATA.length - 1) {
        return {
          ...item,
          total: item.total + liveRevenue,
          imax: item.imax + Math.round(liveRevenue * 0.45),
          dolby: item.dolby + Math.round(liveRevenue * 0.35),
          sensory4dx: item.sensory4dx + Math.round(liveRevenue * 0.15),
          standard: item.standard + Math.round(liveRevenue * 0.05)
        }
      }
      return item
    })
  }, [liveBookings])

  // Format Share augmented with live bookings
  const formatShareWithLive = useMemo(() => {
    const formatStats = {
      'IMAX Laser 3D': 0,
      'Dolby Cinema Atmos': 0,
      '4DX Sensory Experience': 0,
      'Auditorium Standard': 0
    }

    liveBookings.forEach((b) => {
      if (b.status !== 'Cancelled') {
        const rev = Number(b.totalAmount) || 500
        const screen = b.screen || ''
        if (screen.includes('IMAX')) formatStats['IMAX Laser 3D'] += rev
        else if (screen.includes('Dolby')) formatStats['Dolby Cinema Atmos'] += rev
        else if (screen.includes('4DX')) formatStats['4DX Sensory Experience'] += rev
        else formatStats['Auditorium Standard'] += rev
      }
    })

    const updated = FORMAT_SHARE.map((fmt) => ({
      ...fmt,
      revenue: fmt.revenue + (formatStats[fmt.format] || 0)
    }))

    const totalRev = updated.reduce((sum, f) => sum + f.revenue, 0)
    return updated.map((fmt) => ({
      ...fmt,
      percentage: Number(((fmt.revenue / Math.max(1, totalRev)) * 100).toFixed(1))
    }))
  }, [liveBookings])

  // Filtered Theatres Table
  const filteredTheatresTable = useMemo(() => {
    let list = [...analyticsSummary.rankedTheatres]
    if (selectedTheatreFilter !== 'all') {
      list = list.filter((t) => String(t.id) === String(selectedTheatreFilter))
    }
    if (searchTableQuery.trim()) {
      const q = searchTableQuery.toLowerCase()
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q))
    }
    return list
  }, [analyticsSummary.rankedTheatres, selectedTheatreFilter, searchTableQuery])

  // --------------------------------------------------------------------------
  // EXPORT CSV HANDLER
  // --------------------------------------------------------------------------
  const handleExportCSV = () => {
    try {
      const rows = [
        ['VS CINEMAS - EXECUTIVE REPORTS & ANALYTICS'],
        ['Report Generated At', new Date().toLocaleString()],
        [''],
        ['SUMMARY KPIS'],
        ['Metric', 'Value', 'Benchmark Growth'],
        ['Total Bookings', analyticsSummary.totalBookings, analyticsSummary.bookingsGrowth],
        ['Total Revenue (INR)', `₹${analyticsSummary.totalRevenue}`, analyticsSummary.growthMoM],
        ['Most Booked Movie', analyticsSummary.mostBookedMovie.title, `${analyticsSummary.mostBookedMovie.ticketsSold} tickets sold`],
        ['Most Popular Theatre', analyticsSummary.mostPopularTheatre.name, `${analyticsSummary.mostPopularTheatre.capacityRate}% occupancy`],
        ['Seat Occupancy Rate', `${analyticsSummary.seatOccupancyRate}%`, '+5.2% vs target'],
        ['Average Ticket Price', `₹${analyticsSummary.atp}`, ''],
        ['Average Order Value', `₹${analyticsSummary.aov}`, ''],
        [''],
        ['DAILY BOOKING TRENDS'],
        ['Date', 'Day', 'Bookings Count', 'Tickets Sold', 'Revenue (INR)', 'Occupancy %', 'Top Movie'],
        ...DAILY_TRENDS_DATA.map((d) => [d.date, d.day, d.bookings, d.tickets, d.revenue, `${d.occupancy}%`, d.peakMovie]),
        [''],
        ['TOP PERFORMING MOVIES'],
        ['Rank', 'Movie Title', 'Language', 'Genre', 'Tickets Sold', 'Bookings', 'Total Revenue (INR)', 'Occupancy %', 'Rating'],
        ...TOP_PERFORMING_MOVIES.map((m) => [
          m.rank,
          m.title,
          m.language,
          m.genre,
          m.ticketsSold,
          m.bookingsCount,
          m.revenue,
          `${m.occupancyRate}%`,
          m.avgRating
        ]),
        [''],
        ['CINEMA THEATRE PERFORMANCE'],
        ['Theatre Name', 'City', 'Screens', 'Total Bookings', 'Seat Occupancy %', 'Gross Revenue (INR)'],
        ...analyticsSummary.rankedTheatres.map((t) => [
          t.name,
          t.city,
          t.screensCount,
          t.totalBookingsCount,
          `${t.capacityRate}%`,
          t.revenue
        ])
      ]

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `VS_Cinemas_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('📥 Executive CSV Report downloaded successfully!')
    } catch {
      toast.error('Failed to generate CSV export.')
    }
  }

  // Print Executive Summary
  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Analytics Container */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">

        {/* ==================================================================
            1. EXECUTIVE HEADER & CONTROLS
            ================================================================== */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Reports & Executive Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Prepared for <strong className="text-slate-800 font-bold">{user?.name || 'Administrator'}</strong> • Real-time box-office revenue intelligence & venue metrics.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Timeframe Selector */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {[
                { key: '7d', label: '7 Days' },
                { key: '14d', label: '14 Days' },
                { key: '30d', label: '30 Days' },
                { key: 'all', label: 'All Time' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTimeRange(item.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeRange === item.key
                      ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Refresh Analytics Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
              title="Export Full CSV Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Print Report */}
            <button
              type="button"
              onClick={handlePrintReport}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Print Official Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* ==================================================================
            2. TOP 5 KEY PERFORMANCE INDICATORS (REQUIRED CARDS)
            ================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">

          {/* KPI 1: TOTAL BOOKINGS */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Bookings
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {analyticsSummary.totalBookings.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <ArrowUpRight className="w-3 h-3" />
                  {analyticsSummary.bookingsGrowth}
                </span>
                <span className="text-[11px] text-slate-400">vs last month</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Confirmed: <strong className="text-slate-800">96.8%</strong></span>
              <span>Seats: <strong className="text-slate-800">{(analyticsSummary.totalBookings * 2.4).toFixed(0)}</strong></span>
            </div>
          </div>

          {/* KPI 2: TOTAL REVENUE */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <BadgeIndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-emerald-700">
                ₹{(analyticsSummary.totalRevenue / 100000).toFixed(2)}L
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <ArrowUpRight className="w-3 h-3" />
                  {analyticsSummary.growthMoM}
                </span>
                <span className="text-[11px] text-slate-400">gross box office</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>ATP: <strong className="text-slate-800">₹{analyticsSummary.atp}</strong></span>
              <span>AOV: <strong className="text-slate-800">₹{analyticsSummary.aov}</strong></span>
            </div>
          </div>

          {/* KPI 3: MOST BOOKED MOVIE */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Most Booked Movie
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <img
                src={analyticsSummary.mostBookedMovie.poster}
                alt={analyticsSummary.mostBookedMovie.title}
                className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900 truncate leading-tight">
                  {analyticsSummary.mostBookedMovie.title}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {analyticsSummary.mostBookedMovie.genre}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {analyticsSummary.mostBookedMovie.ticketsSold} Sold
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Gross: <strong className="text-slate-800">₹{(analyticsSummary.mostBookedMovie.revenue / 1000).toFixed(0)}k</strong></span>
              <span className="text-emerald-600 font-bold">{analyticsSummary.mostBookedMovie.occupancyRate}% Occ</span>
            </div>
          </div>

          {/* KPI 4: MOST POPULAR THEATRE */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Most Popular Theatre
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm font-black text-slate-900 line-clamp-1 leading-tight" title={analyticsSummary.mostPopularTheatre.name}>
                {analyticsSummary.mostPopularTheatre.name}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>{analyticsSummary.mostPopularTheatre.city}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{analyticsSummary.mostPopularTheatre.screensCount} Screens</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {analyticsSummary.mostPopularTheatre.capacityRate}% Utilization
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Total Shows: <strong className="text-slate-800">{analyticsSummary.mostPopularTheatre.dailyShows} / day</strong></span>
              <span className="text-blue-600 font-bold">{analyticsSummary.mostPopularTheatre.totalBookingsCount} Bookings</span>
            </div>
          </div>

          {/* KPI 5: SEAT OCCUPANCY RATE */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Seat Occupancy Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {analyticsSummary.seatOccupancyRate}%
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Optimal
                </span>
              </div>
              {/* Visual mini progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${analyticsSummary.seatOccupancyRate}%` }}
                />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Prime Shows: <strong className="text-emerald-600">95.8%</strong></span>
              <span>Morning: <strong className="text-slate-700">64.2%</strong></span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            3. DAILY BOOKING TRENDS (INTERACTIVE TIMELINE & CHART)
            ================================================================== */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Daily Booking Trends & Velocity</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {filteredDailyTrends.length} Days Tracking
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Day-by-day ticket sales volume, weekend surges, and daily capacity utilization.
              </p>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-blue-600" />
                Weekday Bookings
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                Weekend Surge (+68%)
              </span>
            </div>
          </div>

          {/* SVG Interactive Trend Bar & Curve Visualizer */}
          <div className="mt-6 w-full">
            <div className="relative w-full overflow-x-auto">
              <div className="min-w-[620px]">
                {/* SVG Visualizer Canvas */}
                <svg
                  viewBox="0 0 680 220"
                  className="w-full h-56 select-none overflow-visible cursor-pointer"
                  onMouseLeave={() => setActiveChartPoint(null)}
                >
                  <defs>
                    <linearGradient id="barGradientNorm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="barGradientWeekend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  {[0, 40, 80, 120, 160].map((val) => {
                    const y = 180 - (val / 160) * 150
                    return (
                      <g key={val}>
                        <line x1="40" y1={y} x2="670" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                        <text x="32" y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                          {val}
                        </text>
                      </g>
                    )
                  })}

                  {/* Bars & Labels */}
                  {filteredDailyTrends.map((item, idx) => {
                    const x = 50 + idx * ((620 - 40) / filteredDailyTrends.length)
                    const barWidth = Math.max(16, Math.min(32, 480 / filteredDailyTrends.length))
                    const barHeight = (item.bookings / 160) * 150
                    const y = 180 - barHeight
                    const isHovered = activeChartPoint?.date === item.date

                    return (
                      <g
                        key={item.date}
                        className="transition-all duration-150"
                        onMouseEnter={() => setActiveChartPoint(item)}
                      >
                        {/* Hover back shadow column */}
                        <rect
                          x={x - 4}
                          y="15"
                          width={barWidth + 8}
                          height="170"
                          fill={isHovered ? 'rgba(59, 130, 246, 0.08)' : 'transparent'}
                          rx="6"
                        />

                        {/* Trend Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill={item.isWeekend ? 'url(#barGradientWeekend)' : 'url(#barGradientNorm)'}
                          rx="4"
                          className={isHovered ? 'filter drop-shadow-md brightness-110' : ''}
                        />

                        {/* Top value badge */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill={isHovered ? '#1e293b' : '#64748b'}
                          fontSize={isHovered ? '11' : '10'}
                          fontWeight={isHovered ? '800' : '600'}
                        >
                          {item.bookings}
                        </text>

                        {/* Date label */}
                        <text
                          x={x + barWidth / 2}
                          y="198"
                          textAnchor="middle"
                          fill={item.isWeekend ? '#059669' : '#475569'}
                          fontSize="10"
                          fontWeight={item.isWeekend ? '700' : '500'}
                        >
                          {item.date}
                        </text>

                        {/* Day label */}
                        <text
                          x={x + barWidth / 2}
                          y="212"
                          textAnchor="middle"
                          fill={item.isWeekend ? '#10b981' : '#94a3b8'}
                          fontSize="9"
                          fontWeight={item.isWeekend ? '700' : '400'}
                        >
                          {item.day}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* Interactive Tooltip Card */}
            {activeChartPoint && (
              <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 flex items-center justify-between gap-4 flex-wrap animate-fade-in text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                    {activeChartPoint.date.split(' ')[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {activeChartPoint.date} ({activeChartPoint.day})
                      {activeChartPoint.isWeekend && <span className="text-emerald-400 ml-1.5 text-xs font-semibold">• Weekend Surge</span>}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Top Feature: <strong className="text-slate-200">{activeChartPoint.peakMovie}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bookings</span>
                    <strong className="text-sm font-black text-white">{activeChartPoint.bookings} Orders</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tickets Sold</span>
                    <strong className="text-sm font-black text-blue-400">{activeChartPoint.tickets} Seats</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Daily Revenue</span>
                    <strong className="text-sm font-black text-emerald-400">₹{activeChartPoint.revenue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Occupancy</span>
                    <strong className="text-sm font-black text-purple-400">{activeChartPoint.occupancy}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            4. REVENUE CHARTS (DUMMY DATA & MULTI-VIEW COMPARISON)
            ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

          {/* Left: Monthly Revenue Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BadgeIndianRupee className="w-5 h-5 text-emerald-600" />
                      <span>Monthly Revenue Charts & Multi-Format Growth</span>
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Jan - Oct 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gross monthly revenue partitioned by premium theatre format and ticket yield.
                  </p>
                </div>

                {/* Format Filter Tabs */}
                <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
                  {[
                    { key: 'all', label: 'All Formats' },
                    { key: 'imax', label: 'IMAX' },
                    { key: 'dolby', label: 'Dolby' },
                    { key: 'sensory4dx', label: '4DX' }
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setRevenueMetricView(btn.key)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                        revenueMetricView === btn.key
                          ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Stacked / Segmented Bar Chart */}
              <div className="mt-5 w-full">
                <div className="relative w-full overflow-x-auto">
                  <div className="min-w-[520px]">
                    <svg viewBox="0 0 560 210" className="w-full h-52 select-none overflow-visible">
                      {/* Grid lines */}
                      {[0, 100, 200, 300, 400, 500].map((k) => {
                        const y = 175 - (k / 500) * 150
                        return (
                          <g key={k}>
                            <line x1="38" y1={y} x2="550" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <text x="32" y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                              ₹{k}k
                            </text>
                          </g>
                        )
                      })}

                      {/* Monthly Bars */}
                      {monthlyRevenueWithLive.map((item, idx) => {
                        const x = 50 + idx * 51
                        const width = 28
                        const totalK = item.total / 1000
                        const barHeight = (totalK / 500) * 150
                        const y = 175 - barHeight

                        // Heights for segments
                        const imaxH = ((item.imax / 1000) / 500) * 150
                        const dolbyH = ((item.dolby / 1000) / 500) * 150
                        const fourDxH = ((item.sensory4dx / 1000) / 500) * 150
                        const stdH = ((item.standard / 1000) / 500) * 150

                        return (
                          <g key={item.month} className="group cursor-pointer">
                            {/* Full Bar or Segmented Bar */}
                            {revenueMetricView === 'all' ? (
                              <>
                                {/* Standard */}
                                <rect x={x} y={175 - stdH} width={width} height={stdH} fill="#10b981" rx="2" />
                                {/* 4DX */}
                                <rect x={x} y={175 - stdH - fourDxH} width={width} height={fourDxH} fill="#f59e0b" />
                                {/* Dolby */}
                                <rect x={x} y={175 - stdH - fourDxH - dolbyH} width={width} height={dolbyH} fill="#818cf8" />
                                {/* IMAX */}
                                <rect x={x} y={y} width={width} height={imaxH} fill="#38bdf8" rx="3" />
                              </>
                            ) : (
                              <rect
                                x={x}
                                y={
                                  175 -
                                  (revenueMetricView === 'imax'
                                    ? imaxH
                                    : revenueMetricView === 'dolby'
                                    ? dolbyH
                                    : fourDxH)
                                }
                                width={width}
                                height={
                                  revenueMetricView === 'imax'
                                    ? imaxH
                                    : revenueMetricView === 'dolby'
                                    ? dolbyH
                                    : fourDxH
                                }
                                fill={
                                  revenueMetricView === 'imax'
                                    ? '#38bdf8'
                                    : revenueMetricView === 'dolby'
                                    ? '#818cf8'
                                    : '#f59e0b'
                                }
                                rx="4"
                              />
                            )}

                            {/* Label */}
                            <text x={x + width / 2} y="193" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">
                              {item.month}
                            </text>
                            {/* Value */}
                            <text x={x + width / 2} y={y - 4} textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="800">
                              ₹{(item.total / 100000).toFixed(1)}L
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Format Legend */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-3 h-3 rounded-full bg-[#38bdf8]" />
                IMAX Laser (39%)
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-3 h-3 rounded-full bg-[#818cf8]" />
                Dolby Cinema (30%)
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                4DX Sensory (20%)
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                Standard (11%)
              </span>
            </div>
          </div>

          {/* Right: Screen Format Share & Revenue Yield (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <span>Format Revenue Yield</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportionate sales contribution by auditorium projection standard.
              </p>

              {/* Format List with visual progress bars */}
              <div className="mt-5 space-y-4">
                {formatShareWithLive.map((fmt) => (
                  <div key={fmt.format} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{fmt.icon}</span>
                        <span>{fmt.format}</span>
                      </span>
                      <span className="font-black text-slate-900">
                        ₹{(fmt.revenue / 100000).toFixed(2)}L
                        <span className="text-slate-400 font-normal ml-1">({fmt.percentage}%)</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${fmt.percentage}%`, backgroundColor: fmt.color }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{fmt.screens} Dedicated Screens</span>
                      <span>Avg Ticket: ₹{fmt.ticketPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Box Office Highlight */}
            <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Yield Leader</span>
                <span className="font-bold text-slate-900">IMAX Laser 3D (₹380 avg)</span>
              </div>
              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-[11px]">
                +32% Yield
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            5. SEAT OCCUPANCY RATE BREAKDOWN & PAYMENT METHODS
            ================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* Card A: Seat Occupancy by Seating Tier */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Seat Occupancy by Tier</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditorium fill rate across Premium, Executive & Standard zones.
            </p>

            <div className="mt-4 space-y-4">
              {OCCUPANCY_TIERS.map((tier) => (
                <div key={tier.tier} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{tier.tier}</span>
                    <span className="font-black text-emerald-700">{tier.occupancy}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${tier.occupancy}%`, backgroundColor: tier.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Seats Sold: {tier.seats}</span>
                    <span className="text-slate-700 font-semibold">₹{tier.avgPrice} / seat</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Occupancy by Showtime Window */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Showtime Window Occupancy</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Capacity distribution throughout daily screening schedules.
            </p>

            <div className="mt-4 space-y-3">
              {OCCUPANCY_TIME_SLOTS.map((slot) => (
                <div key={slot.slot} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">{slot.slot}</span>
                    <span className="text-[11px] text-slate-400">{slot.time}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black block ${slot.rate > 90 ? 'text-emerald-600' : slot.rate > 75 ? 'text-blue-600' : 'text-slate-600'}`}>
                      {slot.rate}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {slot.rate > 90 ? 'Near Capacity' : slot.rate > 75 ? 'High Demand' : 'Moderate'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200/60 text-xs text-blue-800 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Evening shows (5:30 PM & 9:00 PM) drive 68% of prime gross ticket revenue.</span>
            </div>
          </div>

          {/* Card C: Payment Channels & Settlement */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>Payment Methods & Settlement</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transaction breakdown by payment gateway and digital rail.
            </p>

            <div className="mt-4 space-y-3">
              {PAYMENT_CHANNELS.map((ch) => (
                <div key={ch.method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 truncate pr-2">{ch.method}</span>
                    <span className="font-black text-slate-900 shrink-0">{ch.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${ch.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{ch.count} transactions</span>
                    <span className="text-slate-600 font-semibold">{ch.volume}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Instant Settlements</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                100% Reconciled
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            6. DASHBOARD STATISTICS HUB (TABLE VIEWS FOR MOVIES & THEATRES)
            ================================================================== */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Dashboard Statistics Hub & Granular Breakdowns</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit box-office performance records by feature film, cinema multiplex, or live transactions.
              </p>
            </div>

            {/* Navigation Tabs between Statistics Tables */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                {[
                  { key: 'movies', label: 'Top Movies' },
                  { key: 'theatres', label: 'Multiplex Theatres' },
                  { key: 'transactions', label: 'Live Bookings Log' }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === t.key
                        ? 'bg-white text-blue-600 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Theatre filter dropdown */}
              {activeTab === 'theatres' && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedTheatreFilter}
                    onChange={(e) => setSelectedTheatreFilter(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Theatres ({THEATRES_LIST.length})</option>
                    {THEATRES_LIST.map((th) => (
                      <option key={th.id} value={th.id}>{th.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Table search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  placeholder="Filter records..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: TOP MOVIES PERFORMANCE TABLE */}
          {activeTab === 'movies' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-y border-slate-200/80">
                  <tr>
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Movie Title</th>
                    <th className="py-3 px-3">Language & Genre</th>
                    <th className="py-3 px-3 text-right">Tickets Sold</th>
                    <th className="py-3 px-3 text-right">Bookings</th>
                    <th className="py-3 px-3 text-right">Gross Revenue</th>
                    <th className="py-3 px-3 text-right">Occupancy %</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMoviesTable.map((movie) => (
                    <tr key={movie.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-400">
                        #{movie.rank}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-8 h-11 object-cover rounded shadow-xs shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{movie.title}</span>
                            <span className="text-[10px] text-slate-400">Rating: ★ {movie.avgRating} / 10</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">{movie.language}</span>
                        <span className="text-[11px] text-slate-500">{movie.genre}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {movie.ticketsSold.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        {movie.bookingsCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-700">
                        ₹{movie.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {movie.occupancyRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {movie.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: MULTIPLEX THEATRES PERFORMANCE TABLE */}
          {activeTab === 'theatres' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-y border-slate-200/80">
                  <tr>
                    <th className="py-3 px-3">Theatre Venue</th>
                    <th className="py-3 px-3">City & Location</th>
                    <th className="py-3 px-3 text-center">Screens</th>
                    <th className="py-3 px-3 text-center">Daily Shows</th>
                    <th className="py-3 px-3 text-right">Total Bookings</th>
                    <th className="py-3 px-3 text-right">Capacity Utilization</th>
                    <th className="py-3 px-3 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTheatresTable.map((theatre) => (
                    <tr key={theatre.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block leading-tight">{theatre.name}</span>
                        <span className="text-[11px] text-slate-400">{theatre.address}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">{theatre.city}</span>
                        <span className="text-[11px] text-slate-500">{theatre.location}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {theatre.screensCount} Screens
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        {theatre.dailyShows} Shows
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {theatre.totalBookingsCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {theatre.capacityRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-700">
                        ₹{theatre.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: LIVE BOOKINGS LOG TABLE */}
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-y border-slate-200/80">
                  <tr>
                    <th className="py-3 px-3">Booking ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Movie Feature</th>
                    <th className="py-3 px-3">Theatre Venue</th>
                    <th className="py-3 px-3">Seats</th>
                    <th className="py-3 px-3">Showtime</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveBookings.slice(0, 10).map((b) => (
                    <tr
                      key={b.id}
                      className={`transition-all duration-300 ${
                        b.id === liveHighlightId
                          ? 'bg-emerald-50/90 ring-1 ring-emerald-300 shadow-xs'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        <div className="flex items-center gap-1.5">
                          <span>{b.id}</span>
                          {b.id === liveHighlightId && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-600 text-white animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{b.userName || 'Vishnu Ramesh'}</span>
                        <span className="text-[10px] text-slate-400">{b.userEmail || 'Customer'}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {b.movieTitle || 'Movie'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[180px]">
                        {b.theatreName || 'VS Cinemas Central'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {Array.isArray(b.seats) ? b.seats.join(', ') : (b.seats || 'D1, D2')}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600">
                        {b.showtime || '7:45 PM'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-700">
                        ₹{(b.totalAmount || 520).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {b.status || 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
