import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Ticket,
  Search,
  Filter,
  Calendar,
  Clock,
  Building2,
  Tv,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Download,
  Copy,
  Check,
  FileText,
  CreditCard,
  Sparkles,
  X,
  RefreshCw,
  Film
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import TicketModal from '../components/TicketModal'
import { bookingService } from '../services/api'

export default function BookingHistory() {

  // 1. Core Bookings State
  const [bookings, setBookings] = useState(() => {
    return bookingService.getAllBookings()
  })

  // 2. Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'Confirmed' | 'Completed' | 'Cancelled'
  const [selectedMovie, setSelectedMovie] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | 'week' | 'month' | 'past'
  const [customDate, setCustomDate] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'oldest' | 'amount_high'

  // 3. Modals State
  const [viewTicket, setViewTicket] = useState(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  const [detailsTicket, setDetailsTicket] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const [cancelTicket, setCancelTicket] = useState(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('Change of schedule / personal plans')
  const [isCancelling, setIsCancelling] = useState(false)

  // 4. UI Helpers
  const [copiedId, setCopiedId] = useState(null)

  // Refresh bookings list from local storage
  const reloadBookings = () => {
    const list = bookingService.getAllBookings()
    setBookings(list)
  }

  // Handle Copy Booking ID
  const handleCopyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id)
      setCopiedId(id)
      toast.info(`Booking ID ${id} copied to clipboard!`)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Distinct Movie Titles for Movie Filter Dropdown
  const distinctMovies = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => {
      const title = b.movieTitle || 'Untitled Feature'
      map.set(title, (map.get(title) || 0) + 1)
    })
    return Array.from(map.entries()).map(([title, count]) => ({ title, count }))
  }, [bookings])

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = bookings.length
    const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length
    const completedCount = bookings.filter((b) => b.status === 'Completed').length
    const cancelledCount = bookings.filter((b) => b.status === 'Cancelled').length
    const totalSpend = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)

    return {
      totalCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalSpend
    }
  }, [bookings])

  // Master Filter & Search Engine
  const filteredBookings = useMemo(() => {
    let result = [...bookings]

    // 1. Status Filter
    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter)
    }

    // 2. Movie Filter
    if (selectedMovie !== 'all') {
      result = result.filter((b) => b.movieTitle === selectedMovie)
    }

    // 3. Date Filter
    if (customDate) {
      result = result.filter((b) => {
        if (b.createdAt) {
          return b.createdAt.startsWith(customDate)
        }
        return b.date?.toLowerCase().includes(customDate.toLowerCase())
      })
    } else if (dateFilter !== 'all') {
      const now = new Date()
      result = result.filter((b) => {
        const bDate = b.createdAt ? new Date(b.createdAt) : null

        if (dateFilter === 'today') {
          if (b.date?.includes('Today')) return true
          if (bDate) {
            return (
              bDate.getDate() === now.getDate() &&
              bDate.getMonth() === now.getMonth() &&
              bDate.getFullYear() === now.getFullYear()
            )
          }
          return false
        }

        if (dateFilter === 'week') {
          if (b.date?.includes('Today') || b.date?.includes('Yesterday') || b.date?.includes('Tomorrow')) return true
          if (bDate) {
            const diffDays = Math.abs((now - bDate) / (1000 * 60 * 60 * 24))
            return diffDays <= 7
          }
          return false
        }

        if (dateFilter === 'month') {
          if (bDate) {
            return bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear()
          }
          return true
        }

        if (dateFilter === 'past') {
          return b.status === 'Completed' || (!b.date?.includes('Today') && !b.date?.includes('Tomorrow'))
        }

        return true
      })
    }

    // 4. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((b) => {
        const matchTitle = b.movieTitle?.toLowerCase().includes(q)
        const matchId = b.id?.toLowerCase().includes(q)
        const matchTheatre = b.theatreName?.toLowerCase().includes(q)
        const matchScreen = b.screen?.toLowerCase().includes(q)
        const matchLanguage = b.language?.toLowerCase().includes(q)
        const matchSeats = Array.isArray(b.seats)
          ? b.seats.some((s) => s.toLowerCase().includes(q))
          : b.seats?.toLowerCase().includes(q)

        return matchTitle || matchId || matchTheatre || matchScreen || matchLanguage || matchSeats
      })
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'amount_high') {
        return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0)
      }
      if (sortBy === 'oldest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateA - dateB
      }
      // default: newest first
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })

    return result
  }, [bookings, statusFilter, selectedMovie, dateFilter, customDate, searchQuery, sortBy])

  // Handle Cancel Booking Submission
  const handleConfirmCancel = async () => {
    if (!cancelTicket) return
    setIsCancelling(true)

    try {
      const res = await bookingService.cancelBooking(cancelTicket.id, cancelReason)
      if (res.success) {
        toast.success(
          `🎟️ Booking ${cancelTicket.id} cancelled. ₹${res.booking.refundAmount} refund initiated.`
        )
        reloadBookings()
        setIsCancelModalOpen(false)
        setCancelTicket(null)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  // Handle Direct Download
  const handleDownloadTicket = (ticket) => {
    toast.info(`Preparing ticket pass ${ticket.id}...`)
    setTimeout(() => {
      const ticketRef = ticket.id
      const movieTitle = ticket.movieTitle || 'Movie Feature'
      const poster =
        ticket.poster ||
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
      const showtime = ticket.showtime || '7:45 PM'
      const date = ticket.date || 'TODAY'
      const screenName = ticket.screen || 'Screen 02'
      const screenMatch = screenName.match(/(?:Screen|Auditorium|Audi|Hall)\s*(\d+)/i) || screenName.match(/\d+/)
      const screenVal = screenMatch ? (screenMatch[1] || screenMatch[0]).padStart(2, '0') : '02'

      const rawSeats = Array.isArray(ticket.seats)
        ? ticket.seats
        : (ticket.seats || '13, 14').split(/[\s,]+/).filter(Boolean)
      const firstSeat = String(rawSeats[0] || 'D13')
      const rowCharMatch = firstSeat.match(/^[A-Za-z]+/)
      let rowVal = rowCharMatch ? rowCharMatch[0].toUpperCase() : ''
      if (!rowVal && ticket.row) {
        const r = String(ticket.row).trim().toUpperCase()
        if (/^[A-Z]$/.test(r)) {
          rowVal = r
        } else {
          const num = parseInt(r, 10)
          if (!isNaN(num) && num >= 1 && num <= 26) {
            rowVal = String.fromCharCode(64 + num)
          }
        }
      }
      if (!rowVal) rowVal = 'D'

      const seatNums = rawSeats
        .map((s) => String(s).replace(/^[A-Za-z]+/, '').padStart(2, '0'))
        .filter(Boolean)
        .join(', ') || rawSeats.join(', ')

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VS Cinemas Pass - ${ticketRef}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #ffffff; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 16px; }
    .ticket-card { width: 100%; max-width: 300px; background: #000000; color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: none; position: relative; border: none; }
    .poster-box { position: relative; width: 100%; height: 280px; background: #111; }
    .poster-img { width: 100%; height: 100%; object-fit: cover; }
    .poster-gradient { position: absolute; inset: 0; background: linear-gradient(to top, #000000 0%, rgba(0,0,0,0.5) 50%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 14px 14px; text-align: center; }
    .movie-cast { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #cbd5e1; text-transform: uppercase; margin-bottom: 4px; line-height: 1.3; }
    .movie-title { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1.15; color: #ffffff; }
    .movie-meta { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #ef4444; text-transform: uppercase; margin-top: 4px; }
    .seating-box { background: #000000; padding: 10px 14px 6px; display: flex; justify-content: space-between; text-align: center; }
    .seat-col { flex: 1; }
    .seat-col.mid { border-left: 1px solid rgba(255,255,255,0.12); border-right: 1px solid rgba(255,255,255,0.12); }
    .col-label { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; }
    .col-val { font-size: 20px; font-weight: 900; color: #ffffff; margin-top: 2px; letter-spacing: 1px; }
    .watermark { font-size: 8px; font-family: monospace; color: #64748b; letter-spacing: 2px; text-transform: uppercase; text-align: center; margin: 4px 12px 2px; }
    .notch-strip { position: relative; height: 24px; background: #000000; display: flex; align-items: center; overflow: hidden; }
    .notch-left { position: absolute; left: -12px; width: 24px; height: 24px; border-radius: 50%; background: #ffffff; }
    .notch-right { position: absolute; right: -12px; width: 24px; height: 24px; border-radius: 50%; background: #ffffff; }
    .tear-line { width: 100%; border-bottom: 1.5px dashed rgba(255,255,255,0.22); margin: 0 18px; }
    .barcode-box { background: #000000; padding: 4px 16px 16px; text-align: center; display: flex; flex-direction: column; align-items: center; }
    .barcode-svg { width: 100%; max-width: 200px; height: 44px; color: #ffffff; }
    .barcode-code { font-family: monospace; font-size: 9px; color: #94a3b8; letter-spacing: 3px; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="poster-box">
      <img src="${poster}" alt="${movieTitle}" class="poster-img" />
      <div class="poster-gradient">
        <div class="movie-cast">${ticket.director ? 'DIRECTED BY ' + ticket.director.toUpperCase() : 'VS CINEMAS EXCLUSIVE PRESENTATION'}</div>
        <div class="movie-title">${movieTitle}</div>
        <div class="movie-meta">IN CINEMAS • ${date} • ${showtime}</div>
      </div>
    </div>
    <div class="seating-box">
      <div class="seat-col">
        <div class="col-label">SCREEN</div>
        <div class="col-val">${screenVal}</div>
      </div>
      <div class="seat-col mid">
        <div class="col-label">ROW</div>
        <div class="col-val">${rowVal}</div>
      </div>
      <div class="seat-col">
        <div class="col-label">SEATS</div>
        <div class="col-val">${seatNums}</div>
      </div>
    </div>
    <div class="watermark">VS CINEMAS • AUDITORIUM ADMIT PASS</div>
    <div class="notch-strip">
      <div class="notch-left"></div>
      <div class="tear-line"></div>
      <div class="notch-right"></div>
    </div>
    <div class="barcode-box">
      <svg viewBox="0 0 220 50" class="barcode-svg" fill="currentColor">
        <rect x="8" y="0" width="2.5" height="50" /><rect x="13" y="0" width="1.5" height="50" /><rect x="17" y="0" width="3.5" height="50" /><rect x="23" y="0" width="1.5" height="50" /><rect x="27" y="0" width="4" height="50" /><rect x="34" y="0" width="1.5" height="50" /><rect x="38" y="0" width="2.5" height="50" /><rect x="43" y="0" width="1" height="50" /><rect x="46" y="0" width="3.5" height="50" /><rect x="52" y="0" width="1.5" height="50" /><rect x="56" y="0" width="4" height="50" /><rect x="63" y="0" width="2.5" height="50" /><rect x="68" y="0" width="1" height="50" /><rect x="71" y="0" width="3.5" height="50" /><rect x="77" y="0" width="1.5" height="50" /><rect x="81" y="0" width="1.5" height="50" /><rect x="85" y="0" width="4" height="50" /><rect x="92" y="0" width="1" height="50" /><rect x="95" y="0" width="2.5" height="50" /><rect x="100" y="0" width="3.5" height="50" /><rect x="106" y="0" width="1.5" height="50" /><rect x="110" y="0" width="1" height="50" /><rect x="113" y="0" width="3.5" height="50" /><rect x="119" y="0" width="2.5" height="50" /><rect x="124" y="0" width="1.5" height="50" /><rect x="128" y="0" width="4" height="50" /><rect x="135" y="0" width="1.5" height="50" /><rect x="139" y="0" width="2.5" height="50" /><rect x="144" y="0" width="1" height="50" /><rect x="147" y="0" width="3.5" height="50" /><rect x="153" y="0" width="1.5" height="50" /><rect x="157" y="0" width="4" height="50" /><rect x="164" y="0" width="1.5" height="50" /><rect x="168" y="0" width="2.5" height="50" /><rect x="173" y="0" width="1" height="50" /><rect x="176" y="0" width="3.5" height="50" /><rect x="182" y="0" width="1.5" height="50" /><rect x="186" y="0" width="4" height="50" /><rect x="193" y="0" width="1" height="50" /><rect x="196" y="0" width="2.5" height="50" /><rect x="201" y="0" width="3.5" height="50" /><rect x="207" y="0" width="1.5" height="50" /><rect x="211" y="0" width="3.5" height="50" />
      </svg>
      <div class="barcode-code">* ${ticketRef} *</div>
    </div>
  </div>
</body>
</html>`

      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VS-Ticket-${ticketRef}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`🎟️ Cinema Pass ${ticketRef} downloaded!`)
    }, 300)
  }

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSelectedMovie('all')
    setDateFilter('all')
    setCustomDate('')
    setSortBy('newest')
  }

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    selectedMovie !== 'all' ||
    dateFilter !== 'all' ||
    customDate !== '' ||
    sortBy !== 'newest'

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* 1. Global Navigation */}
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search bookings by movie, ID, seats, theatre..." />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ========================================================
            PAGE HEADER & PRIMARY CTA
            ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Ticket className="w-7 h-7 text-blue-600" />
              <span>Booking History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track your confirmed passes, inspect ticket details, view digital barcode e-tickets, and manage reservation cancellations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={reloadBookings}
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Bookings Ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              to="/booking"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book New Movie</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            SUMMARY METRICS STRIP
            ======================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Bookings */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Bookings</span>
              <Ticket className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalCount}</span>
              <span className="text-[11px] text-slate-400 font-medium">Recorded</span>
            </div>
          </div>

          {/* Confirmed Passes */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Confirmed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.confirmedCount}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Valid Passes</span>
            </div>
          </div>

          {/* Completed Screenings */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Completed</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600">{metrics.completedCount}</span>
              <span className="text-[11px] text-slate-400 font-medium">Attended</span>
            </div>
          </div>

          {/* Cancelled / Refunded */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">{metrics.cancelledCount}</span>
              <span className="text-[11px] text-rose-700 font-medium">Refunded</span>
            </div>
          </div>

          {/* Total Spend */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
              <span>Total Spent</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">₹{metrics.totalSpend.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-300 block mt-0.5 font-medium">Net Cinema Admissions</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            SEARCH, FILTER & CONTROL BAR
            ======================================================== */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Top Row: Search Input + Status Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Bookings Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by movie title, booking ID, theatre, or seat..."
                className="w-full bg-[#f8fafc] hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Feature: Booking Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Confirmed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'Confirmed'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Confirmed ({metrics.confirmedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'Completed'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Completed ({metrics.completedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Cancelled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'Cancelled'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Cancelled ({metrics.cancelledCount})</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Filter by Movie + Filter by Date + Sort Order */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Feature: Filter by Movie Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200/90 rounded-xl px-2.5 py-1.5">
                <Film className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-500">Movie:</span>
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Movies ({bookings.length})</option>
                  {distinctMovies.map(({ title, count }) => (
                    <option key={title} value={title}>
                      {title} ({count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Feature: Filter by Booking Date */}
              <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200/90 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-500">Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value)
                    setCustomDate('')
                  }}
                  className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today's Shows</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="past">Past Screenings</option>
                </select>
              </div>

              {/* Custom Specific Date Picker */}
              <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200/90 rounded-xl px-2.5 py-1.5">
                <span className="text-[11px] font-bold text-slate-500">Exact Date:</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value)
                    setDateFilter('all')
                  }}
                  className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer"
                />
                {customDate && (
                  <button
                    type="button"
                    onClick={() => setCustomDate('')}
                    className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                    title="Clear date"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Reset Filters CTA */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] font-semibold text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Bookings First</option>
                <option value="oldest">Oldest Bookings First</option>
                <option value="amount_high">Highest Amount (₹)</option>
              </select>
            </div>
          </div>
        </section>

        {/* ========================================================
            BOOKING HISTORY LIST (FEATURE 1)
            ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredBookings.length}</strong> of{' '}
              <strong className="text-slate-900">{bookings.length}</strong> total bookings
            </span>
            {hasActiveFilters && (
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Filters Active</span>
              </span>
            )}
          </div>

          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const isConfirmed = b.status === 'Confirmed'
                const isCompleted = b.status === 'Completed'
                const isCancelled = b.status === 'Cancelled'

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Status Pill Highlight Bar (Left edge) */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isConfirmed
                          ? 'bg-emerald-500'
                          : isCompleted
                          ? 'bg-indigo-500'
                          : 'bg-rose-500'
                      }`}
                    />

                    {/* Left: Poster + Movie & Theatre Info */}
                    <div className="flex items-start gap-3 sm:gap-4 pl-1 min-w-0">
                      <img
                        src={
                          b.poster ||
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={b.movieTitle || 'Movie'}
                        className="w-18 h-24 sm:w-20 sm:h-28 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src =
                            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                        }}
                      />

                      <div className="min-w-0 space-y-1.5">
                        {/* Top Metadata: Booking Reference + Status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyId(b.id)}
                            className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            title="Click to copy booking ID"
                          >
                            <span>{b.id}</span>
                            {copiedId === b.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>

                          {/* Booking Status Badge (Feature: Booking Status) */}
                          <span
                            className={`text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCompleted
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isConfirmed ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : isCompleted ? (
                              <Calendar className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{b.status || 'Confirmed'}</span>
                          </span>

                          {b.genre && (
                            <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                              {b.genre.split('/')[0]?.trim()}
                            </span>
                          )}
                        </div>

                        {/* Movie Title */}
                        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug truncate">
                          {b.movieTitle || 'Movie Presentation'}
                        </h2>

                        {/* Theatre & Screen Info */}
                        <div className="text-xs text-slate-600 space-y-0.5 font-medium">
                          <p className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{b.theatreName || 'VS Cinemas Galleria'}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-blue-600 font-bold truncate">
                            <Tv className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{b.screen || 'Screen 02 (Dolby Cinema)'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Showtime, Date & Seats Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-3 text-xs md:max-w-md shrink-0">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Date</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>{b.date || 'Today'}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Showtime</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>{b.showtime || '7:45 PM'}</span>
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Seats ({Array.isArray(b.seats) ? b.seats.length : 1})
                        </span>
                        <span className="font-black text-blue-600 flex items-center gap-1 mt-0.5 truncate">
                          <Ticket className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats || 'D13, D14'}
                          </span>
                        </span>
                      </div>

                      {/* Cancellation banner snippet if cancelled */}
                      {isCancelled && (
                        <div className="col-span-2 sm:col-span-3 pt-1.5 border-t border-slate-200/60 text-[11px] text-rose-600 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            Refund of ₹{b.refundAmount || Math.round((Number(b.totalAmount) || 520) * 0.9)} initiated to source method.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Price & Interactive Action CTAs */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          Amount Paid
                        </span>
                        <span
                          className={`text-lg sm:text-xl font-black block leading-tight ${
                            isCancelled ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          ₹{(Number(b.totalAmount) || 520).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Action Buttons Grid */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {/* 1. Feature: View E-Ticket (Boarding Pass) */}
                        <button
                          type="button"
                          onClick={() => {
                            setViewTicket(b)
                            setIsTicketModalOpen(true)
                          }}
                          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                          title="View Digital E-Ticket Pass"
                        >
                          <Ticket className="w-3.5 h-3.5 text-blue-600" />
                          <span>View E-Ticket</span>
                        </button>

                        {/* 2. Feature: Ticket Details Drawer/Modal */}
                        <button
                          type="button"
                          onClick={() => {
                            setDetailsTicket(b)
                            setIsDetailsModalOpen(true)
                          }}
                          className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Inspect Full Ticket & Transaction Details"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        {/* 3. Feature: Cancel Booking (UI Action) */}
                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelTicket(b)
                              setCancelReason('Change of schedule / personal plans')
                              setIsCancelModalOpen(true)
                            }}
                            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Cancel this confirmed ticket"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}

                        {/* 4. Quick Download Offline Pass */}
                        <button
                          type="button"
                          onClick={() => handleDownloadTicket(b)}
                          className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Download Standalone HTML Cinema Pass"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">No Bookings Found</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {hasActiveFilters
                    ? 'No reservations match your active filter and search criteria. Try resetting filters to view all bookings.'
                    : "You haven't reserved any movie tickets yet. Explore current cinema features to book your first seats."}
                </p>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              ) : (
                <Link
                  to="/booking"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Book Movie Tickets</span>
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ========================================================
          FEATURE 2: TICKET DETAILS MODAL
          ======================================================== */}
      {isDetailsModalOpen && detailsTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
          onClick={() => setIsDetailsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-black uppercase tracking-wider">Ticket & Transaction Details</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
              {/* Movie Banner */}
              <div className="flex items-center gap-4 bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4">
                <img
                  src={
                    detailsTicket.poster ||
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                  }
                  alt={detailsTicket.movieTitle}
                  className="w-16 h-22 object-cover rounded-xl border border-slate-200 shadow-2xs shrink-0"
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {detailsTicket.language || 'English'} • {detailsTicket.genre?.split('/')[0] || 'Feature'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{detailsTicket.movieTitle}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {detailsTicket.theatreName || 'VS Cinemas'}
                  </p>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">
                    {detailsTicket.screen || 'Screen 02 (Dolby Cinema)'}
                  </p>
                </div>
              </div>

              {/* Show & Seating Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Booking ID</span>
                  <span className="font-mono font-bold text-slate-900 block mt-0.5 truncate">{detailsTicket.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Show Date</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{detailsTicket.date || 'Today'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Time</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{detailsTicket.showtime || '7:45 PM'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Seats</span>
                  <span className="font-black text-blue-600 block mt-0.5">
                    {Array.isArray(detailsTicket.seats) ? detailsTicket.seats.join(', ') : detailsTicket.seats || 'D13, D14'}
                  </span>
                </div>
              </div>

              {/* Financial Ledger Breakdown */}
              <div className="border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider block">
                  Fare & Tax Invoice Ledger
                </span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Ticket Fare ({Array.isArray(detailsTicket.seats) ? detailsTicket.seats.length : 1} seats):</span>
                    <span className="font-bold text-slate-800">
                      ₹{detailsTicket.baseTicketsTotal || detailsTicket.totalAmount || 520}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee & Online Reservation:</span>
                    <span className="font-bold text-slate-800">₹{detailsTicket.convenienceFee || 45}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Integrated Goods & Services Tax (GST 18%):</span>
                    <span className="font-bold text-slate-800">₹{detailsTicket.gst || 8.1}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Amount Paid:</span>
                    <span className="text-blue-600">₹{(Number(detailsTicket.totalAmount) || 520).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Method: {detailsTicket.paymentMethod || 'Credit Card'}</span>
                  <span>Invoice: INV-2026-{detailsTicket.id.replace(/[^0-9]/g, '') || '91820'}</span>
                </div>
              </div>

              {/* Cancellation info if cancelled */}
              {detailsTicket.status === 'Cancelled' && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-1">
                  <span className="font-black uppercase tracking-wider block flex items-center gap-1.5 text-rose-700">
                    <AlertCircle className="w-4 h-4" />
                    <span>Cancellation Record</span>
                  </span>
                  <p>Reason: {detailsTicket.cancellationReason || 'Customer requested'}</p>
                  <p>Refund Status: {detailsTicket.refundStatus || 'Refund Initiated'}</p>
                  <p className="font-bold">Refund Amount: ₹{detailsTicket.refundAmount || 468}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  setViewTicket(detailsTicket)
                  setIsTicketModalOpen(true)
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Open Digital Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FEATURE 6: CANCEL BOOKING MODAL (UI)
          ======================================================== */}
      {isCancelModalOpen && cancelTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
          onClick={() => !isCancelling && setIsCancelModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Cancel Reservation?</h3>
                <p className="text-xs text-slate-500">Ticket ID: {cancelTicket.id}</p>
              </div>
            </div>

            {/* Ticket Summary */}
            <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 text-xs space-y-1">
              <p className="font-black text-slate-900">{cancelTicket.movieTitle}</p>
              <p className="text-slate-600">
                {cancelTicket.theatreName} • {cancelTicket.screen}
              </p>
              <p className="text-blue-600 font-bold">
                {cancelTicket.date} at {cancelTicket.showtime} • Seats:{' '}
                {Array.isArray(cancelTicket.seats) ? cancelTicket.seats.join(', ') : cancelTicket.seats}
              </p>
            </div>

            {/* Refund calculation preview */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Total Paid:</span>
                <span>₹{cancelTicket.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Cancellation Processing Fee (10%):</span>
                <span>-₹{Math.round(cancelTicket.totalAmount * 0.1)}</span>
              </div>
              <div className="flex justify-between font-black text-emerald-700 pt-1 border-t border-emerald-200">
                <span>Estimated Refund Amount:</span>
                <span>₹{Math.round(cancelTicket.totalAmount * 0.9)}</span>
              </div>
              <p className="text-[10px] text-emerald-600/90 pt-1 block">
                Refund will be credited to {cancelTicket.paymentMethod || 'original payment method'} within 3-5 banking days.
              </p>
            </div>

            {/* Cancellation Reason Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Reason for Cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
              >
                <option value="Change of schedule / personal plans">Change of schedule / personal plans</option>
                <option value="Booked wrong showtime or date">Booked wrong showtime or date</option>
                <option value="Selected incorrect theatre location">Selected incorrect theatre location</option>
                <option value="Duplicate or accidental booking">Duplicate or accidental booking</option>
                <option value="Emergency circumstances">Emergency circumstances</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FEATURE 8: VIEW E-TICKET (GLASSY WHITE BOARDING PASS)
          ======================================================== */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false)
          setViewTicket(null)
        }}
        ticket={viewTicket}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <p>© 2026 VS Cinemas • Digital Cinema Ticketing System. All rights reserved.</p>
      </footer>
    </div>
  )
}
