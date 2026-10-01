import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  CreditCard,
  Wallet,
  Smartphone,
  QrCode,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  ArrowLeft,
  Clock,
  Calendar,
  Building2,
  Ticket,
  ShieldCheck,
  Lock,
  RefreshCw,
  Copy,
  ChevronRight,
  Info,
  Sparkles,
  Percent,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import TicketModal from '../components/TicketModal'
import { useAuth } from '../context/AuthContext'
import { movieService } from '../services/api'

// Available Promo Codes
const PROMO_CODES = [
  { code: 'CINEMA50', discount: 50, label: 'Flat ₹50 OFF on orders above ₹300' },
  { code: 'VSFIRST', discount: 75, label: '₹75 OFF for first-time cinema booking' },
  { code: 'BLOCKBUSTER', discount: 100, label: '₹100 OFF on 2+ seats' }
]

// Supported Digital Wallets
const WALLETS_LIST = [
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    balance: 1450,
    offer: 'Flat ₹25 cashback credited to Amazon balance',
    badge: 'Popular',
    iconColor: 'text-amber-500'
  },
  {
    id: 'paytm',
    name: 'Paytm Wallet',
    balance: 820,
    offer: 'Instant refund on cancellation & 0 gateway fees',
    badge: 'Fastest',
    iconColor: 'text-blue-500'
  },
  {
    id: 'phonepe',
    name: 'PhonePe Wallet',
    balance: 500,
    offer: 'Assured scratch card up to ₹50',
    badge: null,
    iconColor: 'text-purple-600'
  },
  {
    id: 'mobikwik',
    name: 'MobiKwik ZIP',
    balance: 350,
    offer: 'Use 10% SuperCash on tickets',
    badge: null,
    iconColor: 'text-sky-500'
  }
]

// Supported Net Banking Banks
const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', color: 'from-blue-700 to-blue-900' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', color: 'from-orange-600 to-amber-700' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', color: 'from-sky-600 to-blue-800' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', color: 'from-rose-700 to-red-900' },
  { id: 'kotak', name: 'Kotak Bank', code: 'KOTAK', color: 'from-red-600 to-rose-800' }
]

const QR_PIXEL_CELLS = Array.from({ length: 36 }, (_, i) => ({
  id: `qrcell-${i}`,
  isAccent: [0, 1, 4, 5, 6, 7, 10, 11, 24, 25, 30, 31, 14, 15, 20, 21].includes(i),
  isLight: i % 3 === 0
}))

export default function Payment() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // 1. Resolve Booking Data from location state, sessionStorage, or fallback
  const bookingData = useMemo(() => {
    if (location.state?.bookingPayload) {
      return location.state.bookingPayload
    }
    try {
      const stored = sessionStorage.getItem('vscinemas_pending_booking')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // fallback
    }

    // Default Fallback Booking for direct URL access
    return {
      movieId: 569094,
      movieTitle: 'Spider-Man: Beyond the Spider-Verse',
      screen: 'VS Cinemas Orion Mall • Screen 1 (IMAX Laser 3D)',
      showtime: '7:45 PM',
      date: 'Today',
      seats: ['E4', 'E5'],
      seatDetails: [
        { id: 'E4', tier: 'executive', price: 250, tierName: 'Executive' },
        { id: 'E5', tier: 'executive', price: 250, tierName: 'Executive' }
      ],
      pricePerSeat: 250,
      baseTicketsTotal: 500,
      convenienceFee: 45,
      gst: 8.1,
      totalAmount: 553,
      poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
      language: 'English',
      genre: 'Action / Animation / Sci-Fi',
      theatreId: 'theatre-1',
      theatreName: 'VS Cinemas Orion Mall',
      userEmail: user?.email || 'guest@vscinemas.com',
      userName: user?.name || 'Valued Guest'
    }
  }, [location.state, user])

  // Payment UI States
  // 'methods': checkout form | 'processing': loader | 'success': confirmation screen | 'failure': error screen
  const [screenState, setScreenState] = useState('methods')
  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' | 'upi' | 'wallet' | 'netbanking'

  // Card Form State
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState(user?.name ? user.name.toUpperCase() : 'VISHNU RAMESH')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [showCvv, setShowCvv] = useState(false)
  const [saveCard, setSaveCard] = useState(true)

  // UPI State
  const [upiMode, setUpiMode] = useState('qr') // 'qr' | 'vpa'
  const [upiId, setUpiId] = useState('')
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay') // 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'bhim'

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('amazonpay')

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('hdfc')

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)

  // Test Simulation Mode: allows toggling outcome for testing
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [failureRefId] = useState(() => `FAIL-${Math.floor(100000 + Math.random() * 900000)}`)

  // Confirmed Ticket & Modal
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  // Download Ticket button state
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  // Seats Lock Countdown Timer (10 minutes countdown)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(599)

  // Processing Step simulation
  const [processingStep, setProcessingStep] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    if (screenState === 'success' || screenState === 'failure') return

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [screenState])

  const formattedTimeLeft = useMemo(() => {
    const mins = Math.floor(timeLeftSeconds / 60)
    const secs = timeLeftSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [timeLeftSeconds])

  // Detect Card Brand from card number
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s+/g, '')
    if (/^4/.test(clean)) return { name: 'Visa', color: 'from-blue-600 to-indigo-900', badge: 'VISA' }
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: 'from-red-600 to-amber-700', badge: 'MASTERCARD' }
    if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', color: 'from-emerald-600 to-teal-800', badge: 'RUPAY' }
    if (/^3[47]/.test(clean)) return { name: 'Amex', color: 'from-cyan-700 to-blue-900', badge: 'AMEX' }
    return { name: 'Debit / Credit Card', color: 'from-slate-800 via-slate-900 to-black', badge: 'CARD' }
  }, [cardNumber])

  // Card Number Formatter (add space every 4 digits)
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
  }

  // Card Expiry Formatter (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    setCardExpiry(val)
  }

  // Card CVV Formatter (3 or 4 digits)
  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCardCvv(val)
  }

  // Apply Promo Code
  const handleApplyPromo = (codeToApply) => {
    const code = (codeToApply || promoCodeInput).trim().toUpperCase()
    const match = PROMO_CODES.find((p) => p.code === code)
    if (!match) {
      toast.error('Invalid or expired promo code. Try "CINEMA50".')
      return
    }
    setAppliedPromo(match)
    setPromoCodeInput('')
    toast.success(`🎉 Promo code "${match.code}" applied! You saved ₹${match.discount}.`)
  }

  // Remove Promo Code
  const handleRemovePromo = () => {
    setAppliedPromo(null)
    toast.info('Promo code removed.')
  }

  // Pricing calculations
  const discountAmount = appliedPromo ? appliedPromo.discount : 0
  const grandTotal = Math.max(0, (bookingData.totalAmount || 553) - discountAmount)

  // Handle Payment Submission
  const handleProcessPayment = async () => {
    // Basic Form validation
    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '')
      if (cleanNum.length < 15) {
        toast.warning('Please enter a valid 16-digit card number.')
        return
      }
      if (!cardHolder.trim()) {
        toast.warning('Please enter the cardholder name.')
        return
      }
      if (cardExpiry.length < 5) {
        toast.warning('Please enter valid expiry date (MM/YY).')
        return
      }
      if (cardCvv.length < 3) {
        toast.warning('Please enter a valid 3 or 4 digit CVV.')
        return
      }
    } else if (paymentMethod === 'upi' && upiMode === 'vpa') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.warning('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).')
        return
      }
    }

    // Move to Processing state
    setScreenState('processing')
    setProcessingStep(1)

    // Simulate 3-stage banking gateway progression
    setTimeout(() => setProcessingStep(2), 600)
    setTimeout(() => setProcessingStep(3), 1200)

    setTimeout(async () => {
      if (simulateFailure) {
        setScreenState('failure')
        toast.error('Transaction declined by issuing bank.')
        return
      }

      try {
        const payloadToBook = {
          ...bookingData,
          totalAmount: grandTotal,
          paymentMethod:
            paymentMethod === 'card'
              ? `${cardBrand.name} ending in ${cardNumber.slice(-4) || '4242'}`
              : paymentMethod === 'upi'
              ? `UPI (${upiMode === 'qr' ? 'QR Code' : upiId})`
              : paymentMethod === 'wallet'
              ? `${WALLETS_LIST.find((w) => w.id === selectedWallet)?.name || 'Wallet'}`
              : `${POPULAR_BANKS.find((b) => b.id === selectedBank)?.name || 'Net Banking'}`,
          paymentStatus: 'Paid',
          transactionId: `TXN-${Date.now().toString().slice(-8)}`
        }

        const res = await movieService.bookTickets(payloadToBook)
        if (res.success) {
          setConfirmedBooking(res.booking)
          setScreenState('success')
          toast.success('🎉 Payment successful! Tickets confirmed.')
        } else {
          setScreenState('failure')
        }
      } catch (err) {
        console.error('Payment booking recording error:', err)
        setScreenState('failure')
        toast.error(err.message || 'Payment processing failed.')
      }
    }, 1800)
  }

  // Handle Download Ticket (UI Only simulation with realistic local file delivery)
  const handleDownloadTicket = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      setIsDownloaded(true)

      const ticketRef = confirmedBooking?.id || `VS-BK-${Math.floor(10000 + Math.random() * 90000)}`
      const movieTitle = bookingData.movieTitle
      const poster =
        bookingData.poster ||
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
      const showtime = bookingData.showtime || '7:45 PM'
      const date = bookingData.date || 'TODAY'
      const screenName = bookingData.screen || 'Screen 02'
      const screenMatch = screenName.match(/(?:Screen|Auditorium|Audi|Hall)\s*(\d+)/i) || screenName.match(/\d+/)
      const screenVal = screenMatch ? (screenMatch[1] || screenMatch[0]).padStart(2, '0') : '02'

      const rawSeats = Array.isArray(bookingData.seats)
        ? bookingData.seats
        : (bookingData.seats || '13, 14').split(/[\s,]+/).filter(Boolean)
      const firstSeat = String(rawSeats[0] || 'D13')
      const rowCharMatch = firstSeat.match(/^[A-Za-z]+/)
      let rowVal = rowCharMatch ? rowCharMatch[0].toUpperCase() : ''
      if (!rowVal && bookingData.row) {
        const r = String(bookingData.row).trim().toUpperCase()
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

      // Generate a standalone printable cinema ticket file matching reference
      const ticketHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VS Cinemas Pass - ${ticketRef}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f172a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 30px 16px;
    }
    .ticket-card {
      width: 100%;
      max-width: 340px;
      background: #000000;
      color: #ffffff;
      border-radius: 32px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.85);
      position: relative;
    }
    .poster-box {
      position: relative;
      width: 100%;
      height: 380px;
      background: #111;
    }
    .poster-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .poster-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #000000 0%, rgba(0,0,0,0.45) 50%, transparent 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 20px 16px;
      text-align: center;
    }
    .movie-cast {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #cbd5e1;
      text-transform: uppercase;
      margin-bottom: 6px;
      line-height: 1.4;
    }
    .movie-title {
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      line-height: 1.15;
      color: #ffffff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.8);
    }
    .movie-meta {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ef4444;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .seating-box {
      background: #000000;
      padding: 16px 20px 8px;
      display: flex;
      justify-content: space-between;
      text-align: center;
    }
    .seat-col { flex: 1; }
    .seat-col.mid { border-left: 1px solid rgba(255,255,255,0.12); border-right: 1px solid rgba(255,255,255,0.12); }
    .col-label {
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 2.5px;
      text-transform: uppercase;
    }
    .col-val {
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      margin-top: 4px;
      letter-spacing: 1px;
    }
    .watermark {
      font-size: 9px;
      font-family: monospace;
      color: #475569;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
      margin: 6px 16px 2px;
    }
    .notch-strip {
      position: relative;
      height: 32px;
      background: #000000;
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .notch-left {
      position: absolute;
      left: -16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #0f172a;
    }
    .notch-right {
      position: absolute;
      right: -16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #0f172a;
    }
    .tear-line {
      width: 100%;
      border-bottom: 2px dashed rgba(255,255,255,0.25);
      margin: 0 24px;
    }
    .barcode-box {
      background: #000000;
      padding: 6px 24px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .barcode-svg {
      width: 100%;
      max-width: 240px;
      height: 56px;
      color: #ffffff;
    }
    .barcode-code {
      font-family: monospace;
      font-size: 10px;
      color: #94a3b8;
      letter-spacing: 4px;
      margin-top: 6px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .ticket-card { box-shadow: none; max-width: 100%; border-radius: 0; }
      .notch-left, .notch-right { background: #ffffff; }
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="poster-box">
      <img src="${poster}" alt="${movieTitle}" class="poster-img" />
      <div class="poster-gradient">
        <div class="movie-cast">${bookingData.genre || 'CINEMA EXCLUSIVE'} • ${bookingData.language || 'ENGLISH'}</div>
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

    <div class="watermark">VS CINEMAS • AUDITORIUM ADMISSION PASS</div>

    <div class="notch-strip">
      <div class="notch-left"></div>
      <div class="tear-line"></div>
      <div class="notch-right"></div>
    </div>

    <div class="barcode-box">
      <svg viewBox="0 0 240 64" class="barcode-svg" fill="currentColor">
        <rect x="10" y="0" width="3" height="64" /><rect x="15" y="0" width="2" height="64" /><rect x="19" y="0" width="4" height="64" /><rect x="26" y="0" width="2" height="64" /><rect x="30" y="0" width="5" height="64" /><rect x="37" y="0" width="2" height="64" /><rect x="41" y="0" width="3" height="64" /><rect x="46" y="0" width="1" height="64" /><rect x="49" y="0" width="4" height="64" /><rect x="55" y="0" width="2" height="64" /><rect x="59" y="0" width="5" height="64" /><rect x="66" y="0" width="3" height="64" /><rect x="71" y="0" width="1" height="64" /><rect x="74" y="0" width="4" height="64" /><rect x="80" y="0" width="2" height="64" /><rect x="84" y="0" width="2" height="64" /><rect x="88" y="0" width="5" height="64" /><rect x="95" y="0" width="1" height="64" /><rect x="98" y="0" width="3" height="64" /><rect x="103" y="0" width="4" height="64" /><rect x="109" y="0" width="2" height="64" /><rect x="113" y="0" width="1" height="64" /><rect x="116" y="0" width="4" height="64" /><rect x="122" y="0" width="3" height="64" /><rect x="127" y="0" width="2" height="64" /><rect x="131" y="0" width="5" height="64" /><rect x="138" y="0" width="2" height="64" /><rect x="142" y="0" width="3" height="64" /><rect x="147" y="0" width="1" height="64" /><rect x="150" y="0" width="4" height="64" /><rect x="156" y="0" width="2" height="64" /><rect x="160" y="0" width="5" height="64" /><rect x="167" y="0" width="2" height="64" /><rect x="171" y="0" width="3" height="64" /><rect x="176" y="0" width="1" height="64" /><rect x="179" y="0" width="4" height="64" /><rect x="185" y="0" width="2" height="64" /><rect x="189" y="0" width="5" height="64" /><rect x="196" y="0" width="1" height="64" /><rect x="199" y="0" width="3" height="64" /><rect x="204" y="0" width="4" height="64" /><rect x="210" y="0" width="2" height="64" /><rect x="214" y="0" width="4" height="64" /><rect x="220" y="0" width="2" height="64" /><rect x="224" y="0" width="5" height="64" />
      </svg>
      <div class="barcode-code">* ${ticketRef} *</div>
    </div>
  </div>
</body>
</html>`

      const blob = new Blob([ticketHtmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VS-Cinemas-Ticket-${ticketRef}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`🎟️ Cinema Pass ${ticketRef} downloaded!`)
    }, 900)
  }

  // Handle Print Ticket
  const handlePrintTicket = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Breadcrumb & Lock Timer Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Link
              to={`/seat-selection/${bookingData.movieId || ''}`}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
              title="Return to Seat Layout"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Link to="/movies" className="hover:text-blue-600 transition-colors">Movies</Link>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <Link to={`/seat-selection/${bookingData.movieId || ''}`} className="hover:text-blue-600 transition-colors">Seats</Link>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-blue-600 font-bold">Payment</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
                <span>Secure Checkout</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-Bit SSL
                </span>
              </h1>
            </div>
          </div>

          {/* Seat Hold Timer */}
          {screenState === 'methods' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl shadow-2xs self-start sm:self-auto">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <div className="text-xs text-amber-900 font-semibold">
                Seats reserved for: <span className="font-mono font-black text-amber-700">{formattedTimeLeft}</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            SCREEN STATE 1: PAYMENT PROCESSING SCREEN (SPINNER)
            ======================================================== */}
        {screenState === 'processing' && (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Processing Your Payment</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              Please do not close this window or hit refresh. We are communicating with your bank to reserve your seats.
            </p>

            {/* Stepper Progress Indicator */}
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-xs">
              <div className={`flex items-center gap-3 text-xs font-semibold ${processingStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${processingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
                <span>Connecting to payment gateway...</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${processingStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${processingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                <span>Authorizing transaction with bank...</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${processingStep >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${processingStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                <span>Confirming seats with auditorium...</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN STATE 2: PAYMENT SUCCESS SCREEN
            ======================================================== */}
        {screenState === 'success' && (
          <div className="py-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Top Confetti / Celebration Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-400/20">
                  Transaction Approved
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Payment Successful!</h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md">
                  Your tickets have been confirmed and sent to <span className="font-bold underline">{bookingData.userEmail}</span>.
                </p>

                {/* Key Reference Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs">
                  <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
                    <span className="text-emerald-200">Booking ID:</span>
                    <span className="font-mono font-black tracking-wide text-white">{confirmedBooking?.id || 'VS-BK-78921'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(confirmedBooking?.id || 'VS-BK-78921')
                        toast.success('Booking ID copied to clipboard!')
                      }}
                      className="hover:text-emerald-200 transition-colors"
                      title="Copy Booking ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
                    <span className="text-emerald-200">Amount Paid:</span>
                    <span className="font-black text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmed E-Ticket Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex gap-4 items-center">
                  <img
                    src={bookingData.poster}
                    alt={bookingData.movieTitle}
                    className="w-18 h-24 object-cover rounded-xl shadow-md border border-slate-200 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                    }}
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 inline-block mb-1">
                      {bookingData.language || 'English'} • {bookingData.genre?.split('/')[0] || 'Action'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-snug">{bookingData.movieTitle}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bookingData.theatreName}</span>
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Auditorium Screen</span>
                  <span className="text-xs font-black text-blue-600 block mt-0.5">
                    {bookingData.screen?.split('•')[1]?.trim() || 'Screen 1 (IMAX)'}
                  </span>
                </div>
              </div>

              {/* Show Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] border border-dashed border-slate-200 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Date</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {bookingData.date || 'Today'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Showtime</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {bookingData.showtime || '7:45 PM'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Seats ({bookingData.seats?.length || 0})</span>
                  <span className="font-black text-blue-600 flex items-center gap-1 mt-0.5">
                    <Ticket className="w-3.5 h-3.5" />
                    {(bookingData.seats || []).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Payment Method</span>
                  <span className="font-bold text-slate-800 block truncate mt-0.5">
                    {paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* QR Code Entry Pass */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Digital Entry Barcode</h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                      Scan this barcode directly at the cinema turnstiles or show it to the usher at the screen door.
                    </p>
                    <span className="text-[10px] font-mono text-blue-600 font-bold block mt-1">
                      PASS: {confirmedBooking?.id || 'VS-BK-78921'}-AUDI
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 text-xs font-bold transition-all shadow-2xs backdrop-blur-xs shrink-0 cursor-pointer"
                >
                  View Full E-Ticket
                </button>
              </div>

              {/* Action Buttons: Feature - Download Ticket Button (UI Only) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors text-center cursor-pointer"
                >
                  Return to Dashboard
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintTicket}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Print Ticket"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">Print</span>
                  </button>

                  {/* Feature Requirement: Download Ticket Button (UI Only) */}
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={handleDownloadTicket}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isDownloading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : isDownloaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Downloaded ✓</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN STATE 3: PAYMENT FAILURE SCREEN
            ======================================================== */}
        {screenState === 'failure' && (
          <div className="py-8 max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 text-center shadow-xl space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 mx-auto flex items-center justify-center shadow-inner">
                <XCircle className="w-10 h-10 text-rose-600 animate-pulse" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider inline-block mb-2">
                  Transaction Declined
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Failed</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  We could not complete your transaction. No money was deducted from your account. If debited, your bank will automatically reverse the amount within 24-48 hours.
                </p>
              </div>

              {/* Error Reason Details */}
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-rose-900">Failure Reason:</span>
                  <span className="font-bold text-rose-700">Bank Gateway Timeout (ERR_BANK_901)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Attempted Amount:</span>
                  <span className="font-bold text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Reference ID:</span>
                  <span className="font-mono text-slate-700">{failureRefId}</span>
                </div>
              </div>

              {/* Seats Still Held Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 text-left">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Seats are still locked for you!</span> Your selected seats (
                  <span className="font-mono font-bold">{(bookingData.seats || []).join(', ')}</span>) will remain reserved for the next{' '}
                  <span className="font-black text-amber-800">{formattedTimeLeft}</span>.
                </div>
              </div>

              {/* Action Buttons: Retry, Try Another Method, or Cancel */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimulateFailure(false)
                    setScreenState('methods')
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSimulateFailure(false)
                    setPaymentMethod('upi')
                    setScreenState('methods')
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  Try UPI or Wallet
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/seat-selection/${bookingData.movieId || ''}`)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN STATE 4: PRIMARY PAYMENT METHODS & CHECKOUT FORM
            ======================================================== */}
        {screenState === 'methods' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6">
            {/* Left 7 Columns: Payment Method Chooser & Specific Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Methods Selection Tabs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
                  {/* 1. Credit / Debit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[78px] ${
                      paymentMethod === 'card'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                        Popular
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">Card</span>
                      <span className="text-[10.5px] text-slate-500 font-medium block">Visa, Master</span>
                    </div>
                  </button>

                  {/* 2. UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[78px] ${
                      paymentMethod === 'upi'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Smartphone className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Instant
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">UPI Apps</span>
                      <span className="text-[10.5px] text-slate-500 font-medium block">GPay, PhonePe</span>
                    </div>
                  </button>

                  {/* 3. Wallets */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[78px] ${
                      paymentMethod === 'wallet'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                        Offers
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">Wallets</span>
                      <span className="text-[10.5px] text-slate-500 font-medium block">Amazon, Paytm</span>
                    </div>
                  </button>

                  {/* 4. Net Banking */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[78px] ${
                      paymentMethod === 'netbanking'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building2 className={`w-5 h-5 ${paymentMethod === 'netbanking' ? 'text-blue-600' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">Net Banking</span>
                      <span className="text-[10.5px] text-slate-500 font-medium block">All Major Banks</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ========================================================
                  CARD PAYMENT FORM (FEATURE 3)
                  ======================================================== */}
              {paymentMethod === 'card' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
                  {/* Interactive Virtual Card Preview */}
                  <div
                    className={`w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl p-5 text-white shadow-xl bg-gradient-to-tr ${cardBrand.color} relative overflow-hidden transition-all duration-300 flex flex-col justify-between select-none`}
                  >
                    {/* Background glow highlights */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/25 rounded-full blur-xl pointer-events-none" />

                    {/* Card Top Row */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        {/* EMV Chip */}
                        <div className="w-9 h-7 rounded-md bg-amber-300/90 border border-amber-400 flex items-center justify-center shadow-xs">
                          <div className="w-5 h-4 border border-amber-600/40 rounded-xs" />
                        </div>
                        {/* Contactless symbol */}
                        <span className="text-xs text-white/80 font-mono tracking-tighter">))))</span>
                      </div>
                      <span className="text-sm font-black tracking-widest uppercase italic text-white/95 drop-shadow-xs">
                        {cardBrand.badge}
                      </span>
                    </div>

                    {/* Card Middle: 16 Digit Display */}
                    <div className="relative z-10 py-1">
                      <div className="font-mono text-base sm:text-lg tracking-widest font-black text-white/95 drop-shadow-xs">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    {/* Card Bottom: Holder Name & Expiry */}
                    <div className="flex items-center justify-between text-xs relative z-10">
                      <div className="max-w-[180px] truncate">
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block font-semibold">Cardholder</span>
                        <span className="font-bold tracking-wide uppercase text-white truncate block">
                          {cardHolder || 'YOUR NAME'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block font-semibold">Expires</span>
                        <span className="font-mono font-bold text-white tracking-wider block">
                          {cardExpiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-4 pt-2">
                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 •••• •••• 8920"
                          maxLength={19}
                          className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                          {cardBrand.name}
                        </span>
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NAME AS PRINTED ON CARD"
                        className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs uppercase"
                      />
                    </div>

                    {/* Expiry & CVV Row */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Valid Thru
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM / YY"
                          maxLength={5}
                          className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs text-center"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            CVV / CVC
                          </label>
                          <span className="text-[10px] text-slate-400" title="3 digits on back of card">
                            3-4 Digits
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type={showCvv ? 'text' : 'password'}
                            inputMode="numeric"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs text-center"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            title={showCvv ? 'Hide CVV' : 'Show CVV'}
                          >
                            {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Save Card Checkbox */}
                    <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Securely save this card for faster future bookings (RBI tokenized)</span>
                    </label>

                    {/* Pay Button */}
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white text-sm sm:text-base font-black shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 hover:-translate-y-0.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{grandTotal.toLocaleString('en-IN')} Securely</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  UPI PAYMENT UI (FEATURE 4)
                  ======================================================== */}
              {paymentMethod === 'upi' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
                  {/* UPI Mode Selector */}
                  <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUpiMode('qr')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        upiMode === 'qr' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan UPI QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode('vpa')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        upiMode === 'vpa' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Enter UPI ID / VPA</span>
                    </button>
                  </div>

                  {/* Mode A: QR Code */}
                  {upiMode === 'qr' ? (
                    <div className="text-center space-y-4 py-2">
                      <div className="relative inline-block bg-white p-4 rounded-2xl border-2 border-dashed border-blue-300 shadow-md">
                        {/* High-res Simulated QR Code */}
                        <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-between text-white relative">
                          <div className="grid grid-cols-6 gap-1 w-full flex-1 p-1">
                            {QR_PIXEL_CELLS.map((cell) => (
                              <div
                                key={cell.id}
                                className={`rounded-xs ${
                                  cell.isAccent
                                    ? 'bg-blue-400'
                                    : cell.isLight
                                    ? 'bg-white'
                                    : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                          {/* Center Brand Badge */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-10 h-10 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">
                              VS
                            </span>
                          </div>
                        </div>

                        {/* Scan with text */}
                        <p className="text-[11px] font-bold text-slate-500 mt-2 font-mono">
                          SCAN TO PAY ₹{grandTotal}
                        </p>
                      </div>

                      <div className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                        Scan this QR code using <span className="font-bold text-slate-900">Google Pay, PhonePe, Paytm, BHIM, Cred</span>, or any UPI banking app.
                      </div>

                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-black shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>I Have Completed the QR Payment</span>
                      </button>
                    </div>
                  ) : (
                    /* Mode B: Enter UPI ID */
                    <div className="space-y-4 py-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Enter UPI ID / VPA
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. yourname@okhdfcbank"
                            className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Quick handle pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400">Popular handles:</span>
                        {['@okhdfcbank', '@okicici', '@okaxis', '@ybl', '@paytm'].map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => {
                              const base = upiId.split('@')[0] || 'yourname'
                              setUpiId(`${base}${handle}`)
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors cursor-pointer"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>

                      {/* Supported App tiles */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Or select your preferred UPI App
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'gpay', label: 'Google Pay', suffix: '@okaxis' },
                            { id: 'phonepe', label: 'PhonePe', suffix: '@ybl' },
                            { id: 'paytm', label: 'Paytm UPI', suffix: '@paytm' },
                            { id: 'cred', label: 'CRED UPI', suffix: '@axis' },
                            { id: 'bhim', label: 'BHIM UPI', suffix: '@upi' }
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => {
                                setSelectedUpiApp(app.id)
                                const base = upiId.split('@')[0] || (user?.email?.split('@')[0] || 'alex')
                                setUpiId(`${base}${app.suffix}`)
                              }}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                selectedUpiApp === app.id
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-xs font-bold block">{app.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pay via UPI Button */}
                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  WALLET PAYMENT UI (FEATURE 5)
                  ======================================================== */}
              {paymentMethod === 'wallet' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="space-y-3">
                    {WALLETS_LIST.map((wallet) => (
                      <label
                        key={wallet.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          selectedWallet === wallet.id
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="wallet_option"
                            value={wallet.id}
                            checked={selectedWallet === wallet.id}
                            onChange={() => setSelectedWallet(wallet.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">{wallet.name}</span>
                              {wallet.badge && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                                  {wallet.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                              {wallet.offer}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-medium">Available Balance</span>
                          <span className="text-xs font-black text-emerald-600 block mt-0.5">
                            ₹{wallet.balance.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Selected wallet has sufficient balance for this booking. Instant 1-click checkout.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Pay ₹{grandTotal.toLocaleString('en-IN')} via Wallet</span>
                  </button>
                </div>
              )}

              {/* ========================================================
                  NET BANKING UI
                  ======================================================== */}
              {paymentMethod === 'netbanking' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Popular Banks
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {POPULAR_BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            selectedBank === bank.id
                              ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-bold truncate">{bank.name}</span>
                          <span className="text-[10px] font-black text-slate-400 font-mono">{bank.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Or Select from All Indian Banks
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="canara">Canara Bank</option>
                      <option value="indusind">IndusInd Bank</option>
                      <option value="yes">YES Bank</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Proceed to Net Banking Portal</span>
                  </button>
                </div>
              )}

              {/* Developer / Tester Sandbox: Simulate Outcome Toggle */}
              <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-bold text-slate-700">Tester Gateway Sandbox:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulateFailure(false)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      !simulateFailure
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    ✓ Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulateFailure(true)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      simulateFailure
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    ✗ Simulate Failure Screen
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Booking Summary Card (Feature 1) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm sticky top-24 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-600" />
                    <span>Booking Summary</span>
                  </h2>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    {bookingData.seats?.length || 0} Tickets
                  </span>
                </div>

                {/* Movie Mini-Banner */}
                <div className="flex gap-3.5 items-center">
                  <img
                    src={bookingData.poster}
                    alt={bookingData.movieTitle}
                    className="w-14 h-20 object-cover rounded-xl shadow-xs border border-slate-200 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                    }}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 inline-block mb-1">
                      {bookingData.screen?.split('•')[1]?.trim() || 'IMAX 3D'}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                      {bookingData.movieTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {bookingData.theatreName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-1">
                      <span>{bookingData.date || 'Today'}</span>
                      <span>•</span>
                      <span>{bookingData.showtime || '7:45 PM'}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Seats Badges */}
                <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Selected Seats:</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {(bookingData.seats || []).map((seatId) => (
                        <span
                          key={seatId}
                          className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shadow-2xs"
                        >
                          {seatId}
                        </span>
                      ))}
                    </div>
                  </div>

                  {bookingData.seatDetails && bookingData.seatDetails.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 space-y-0.5">
                      {bookingData.seatDetails.map((seat) => (
                        <div key={seat.id} className="flex justify-between">
                          <span>Seat {seat.id} ({seat.tierName || 'Standard'})</span>
                          <span className="font-semibold text-slate-800">₹{seat.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Promo Code Input / Application */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Promo Code / Offer
                  </span>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-900">{appliedPromo.code}</span>
                          <span className="text-[11px] text-emerald-700 block">₹{appliedPromo.discount} Discount Applied</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. CINEMA50"
                        className="flex-1 bg-[#f8fafc] border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Promo quick suggestion chip */}
                  {!appliedPromo && (
                    <button
                      type="button"
                      onClick={() => handleApplyPromo('CINEMA50')}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Use code <strong>CINEMA50</strong> for ₹50 off!</span>
                    </button>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Base Ticket Price ({bookingData.seats?.length || 0} seats)</span>
                    <span className="font-bold text-slate-800">
                      ₹{(bookingData.baseTicketsTotal || 500).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Convenience Fee</span>
                      <Info className="w-3 h-3 text-slate-400" title="Includes auditorium sanitization & booking fee" />
                    </span>
                    <span className="font-medium text-slate-800">
                      ₹{(bookingData.convenienceFee || 45).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Integrated GST (18%)</span>
                    <span className="font-medium text-slate-800">
                      ₹{(bookingData.gst || 8.1).toFixed(2)}
                    </span>
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Promo Discount ({appliedPromo.code})</span>
                      <span>-₹{appliedPromo.discount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">Total Payable</span>
                      <span className="text-[10px] text-slate-400">All taxes included</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight text-blue-600">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Free Cancellation Guarantee */}
                <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>100% money back guarantee on cancellation up to 2 hours before showtime.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmed E-Ticket Modal Component */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={confirmedBooking}
      />
    </div>
  )
}
