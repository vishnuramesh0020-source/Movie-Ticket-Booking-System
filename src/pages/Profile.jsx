import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CreditCard,
  ShieldCheck,
  Lock,
  Edit3,
  Camera,
  CheckCircle2,
  Trash2,
  Plus,
  Download,
  Film,
  Award,
  Sparkles,
  Smartphone,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Building2,
  LogOut,
  QrCode,
  ReceiptText,
  FileText,
  Search,
  ArrowUpRight,
  Copy,
  Check
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import TicketModal from '../components/TicketModal'
import { useAuth } from '../context/AuthContext'
import { THEATRES_LIST, bookingService } from '../services/api'

// Preset Avatar choices
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80'
]

// Preset Indian Cities
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Kochi']

export default function Profile() {
  const { user, updateProfile, updatePassword, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Active Profile Section Tab
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'personal') // 'personal' | 'bookings' | 'history' | 'payments' | 'security'

  // Booking History Filter
  const [bookingFilter, setBookingFilter] = useState('all') // 'all' | 'upcoming' | 'completed'

  // Payment History Filter & Search State
  const [paymentFilter, setPaymentFilter] = useState('all') // 'all' | 'successful' | 'refunded'
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('')
  const [copiedTxnId, setCopiedTxnId] = useState(null)

  // Personal Info Form State
  const [name, setName] = useState(user?.name || 'Vishnu Ramesh')
  const [email] = useState(user?.email || 'yourmail@gmail.com')
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210')
  const [city, setCity] = useState(user?.city || 'Bengaluru')
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English')
  const [preferredTheatre, setPreferredTheatre] = useState(
    user?.preferredTheatre || THEATRES_LIST[0]?.name || 'VS Cinemas Orion Mall'
  )
  const [isEditingInfo, setIsEditingInfo] = useState(false)

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [customAvatarUrl, setCustomAvatarUrl] = useState('')

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Saved Payment Methods State
  const [savedCards, setSavedCards] = useState([
    {
      id: 'card-1',
      brand: 'Visa',
      last4: '4242',
      holder: user?.name ? user.name.toUpperCase() : 'VISHNU RAMESH',
      expiry: '08/28',
      type: 'Credit Card',
      bank: 'HDFC Bank'
    },
    {
      id: 'card-2',
      brand: 'Mastercard',
      last4: '8891',
      holder: user?.name ? user.name.toUpperCase() : 'VISHNU RAMESH',
      expiry: '11/27',
      type: 'Debit Card',
      bank: 'ICICI Bank'
    }
  ])

  const [savedUpis, setSavedUpis] = useState([
    { id: 'upi-1', vpa: 'vishnu@okhdfcbank', app: 'Google Pay', isDefault: true },
    { id: 'upi-2', vpa: '9876543210@ybl', app: 'PhonePe', isDefault: false }
  ])

  // Preferences Toggles
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [promoAlerts, setPromoAlerts] = useState(false)

  // E-Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  // Bookings list from service
  const allBookings = useMemo(() => {
    return bookingService.getAllBookings()
  }, [])

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'upcoming') {
      return allBookings.filter((b) => b.status === 'Confirmed' || b.date?.includes('Today'))
    }
    if (bookingFilter === 'completed') {
      return allBookings.filter((b) => b.status !== 'Confirmed' && !b.date?.includes('Today'))
    }
    return allBookings
  }, [allBookings, bookingFilter])

  // Payment Transactions derived from allBookings
  const paymentTransactions = useMemo(() => {
    return allBookings.map((b, index) => {
      // Deterministic transaction ID if not explicitly stored
      const txnId =
        b.transactionId ||
        `TXN-${b.id?.replace(/[^0-9]/g, '') || String(98421000 + index)}`

      const method =
        b.paymentMethod ||
        (index % 3 === 0
          ? 'HDFC Bank Credit Card (•••• 4242)'
          : index % 3 === 1
          ? 'UPI (Google Pay - vishnu@okhdfcbank)'
          : 'Paytm Wallet')

      const dateStr = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : b.date || 'Today, 02:30 PM'

      const total = Number(b.totalAmount) || 520
      const gst = Math.round(((total * 0.18) / 1.18) * 10) / 10
      const convenience = Math.min(45, Math.round(total * 0.08))
      const baseFare = total - convenience
      const status = b.paymentStatus || 'Successful'
      const seatList = Array.isArray(b.seats) ? b.seats : [b.seats || 'E4']

      return {
        id: txnId,
        bookingId: b.id || `VS-BK-${91820 + index}`,
        booking: b,
        movieTitle: b.movieTitle || 'Movie Ticket',
        poster:
          b.poster ||
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80',
        theatre: b.theatreName || b.screen || 'VS Cinemas Orion Mall',
        seats: seatList,
        date: dateStr,
        totalAmount: total,
        baseFare,
        convenience,
        gst,
        paymentMethod: method,
        status,
        invoiceNumber: `INV-2026-${txnId.replace(/[^0-9]/g, '') || String(10000 + index)}`
      }
    })
  }, [allBookings])

  // Filtered Payment Transactions based on search and status pills
  const filteredTransactions = useMemo(() => {
    return paymentTransactions.filter((txn) => {
      // 1. Status Filter
      if (paymentFilter === 'successful') {
        const isSuccess = txn.status === 'Paid' || txn.status === 'Successful'
        if (!isSuccess) return false
      } else if (paymentFilter === 'refunded') {
        const isRefunded = txn.status === 'Refunded' || txn.status === 'Cancelled'
        if (!isRefunded) return false
      }

      // 2. Search Query Filter
      if (paymentSearchQuery.trim()) {
        const q = paymentSearchQuery.toLowerCase().trim()
        const matchId = txn.id?.toLowerCase().includes(q)
        const matchBooking = txn.bookingId?.toLowerCase().includes(q)
        const matchMovie = txn.movieTitle?.toLowerCase().includes(q)
        const matchMethod = txn.paymentMethod?.toLowerCase().includes(q)
        const matchSeats = txn.seats?.some((s) => s.toLowerCase().includes(q))
        return matchId || matchBooking || matchMovie || matchMethod || matchSeats
      }

      return true
    })
  }, [paymentTransactions, paymentFilter, paymentSearchQuery])

  // Profile Analytics
  const stats = useMemo(() => {
    const totalBookingsCount = allBookings.length
    const totalTicketsCount = allBookings.reduce(
      (sum, b) => sum + (Array.isArray(b.seats) ? b.seats.length : 1),
      0
    )
    const totalMoneySpent = allBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)
    const rewardPoints = user?.rewardPoints || Math.round(totalMoneySpent * 0.1) || 550

    return {
      totalBookingsCount,
      totalTicketsCount,
      totalMoneySpent,
      rewardPoints
    }
  }, [allBookings, user])

  // Save Personal Info
  const handleSaveProfile = (e) => {
    e?.preventDefault()
    if (!name.trim()) {
      toast.warning('Name cannot be empty.')
      return
    }

    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      city,
      preferredLanguage,
      preferredTheatre
    })
    setIsEditingInfo(false)
  }

  // Update Avatar
  const handleSelectAvatar = (url) => {
    updateProfile({ avatar: url })
    setIsAvatarModalOpen(false)
    toast.success('Profile avatar updated!')
  }

  const handleCustomAvatarSubmit = (e) => {
    e.preventDefault()
    if (!customAvatarUrl.trim()) return
    updateProfile({ avatar: customAvatarUrl.trim() })
    setCustomAvatarUrl('')
    setIsAvatarModalOpen(false)
    toast.success('Custom avatar applied!')
  }

  // Handle Password Update
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.warning('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }

    const res = updatePassword(currentPassword, newPassword)
    if (res.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  // Delete Saved Card
  const handleDeleteCard = (cardId) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId))
    toast.info('Card removed from saved payment methods.')
  }

  // Delete Saved UPI
  const handleDeleteUpi = (upiId) => {
    setSavedUpis((prev) => prev.filter((u) => u.id !== upiId))
    toast.info('UPI ID removed.')
  }

  // Download Ticket simulation
  const handleDownloadTicket = (ticket) => {
    toast.info(`Preparing ticket ${ticket.id}...`)
    setTimeout(() => {
      const ticketRef = ticket.id
      const movieTitle = ticket.movieTitle
      const poster =
        ticket.poster ||
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
      const showtime = ticket.showtime || '7:45 PM'
      const date = ticket.date || 'TODAY'
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
      a.download = `VS-Ticket-${ticketRef}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`🎟️ Cinema Pass ${ticketRef} downloaded!`)
    }, 600)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Copy Transaction ID to clipboard
  const handleCopyTxnId = (id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id)
      setCopiedTxnId(id)
      toast.info(`Transaction ID ${id} copied to clipboard!`)
      setTimeout(() => {
        setCopiedTxnId(null)
      }, 2500)
    }
  }

  // Download Official GST Tax Invoice HTML
  const handleDownloadInvoice = (txn) => {
    toast.info(`Preparing official tax invoice for ${txn.id}...`)
    setTimeout(() => {
      const invoiceNum = txn.invoiceNumber
      const bookingId = txn.bookingId
      const txnId = txn.id
      const customerName = user?.name || 'Vishnu Ramesh'
      const customerEmail = user?.email || 'yourmail@gmail.com'
      const customerPhone = user?.phone || '+91 98765 43210'
      const dateStr = txn.date
      const movieTitle = txn.movieTitle
      const seatCount = txn.seats.length
      const seatsStr = txn.seats.join(', ')
      const theatre = txn.theatre
      const paymentMethod = txn.paymentMethod
      const baseFare = txn.baseFare
      const convenience = txn.convenience
      const cgst = (txn.gst / 2).toFixed(2)
      const sgst = (txn.gst / 2).toFixed(2)
      const totalAmount = txn.totalAmount

      const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${invoiceNum} | VS Cinemas</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #1e293b; padding: 40px 20px; display: flex; justify-content: center; }
    .invoice-card { background: #ffffff; width: 100%; max-width: 680px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 32px; border-bottom: 4px solid #3b82f6; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #38bdf8; }
    .brand-sub { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px; font-weight: 700; }
    .invoice-title-block { text-align: right; }
    .invoice-title { font-size: 18px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
    .invoice-num { font-family: monospace; font-size: 13px; color: #38bdf8; font-weight: 700; margin-top: 4px; }
    .body { padding: 32px; font-size: 13px; color: #334155; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
    .meta-box h4 { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 8px; font-weight: 800; }
    .meta-box p { font-size: 13px; color: #0f172a; line-height: 1.5; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: #dcfce7; color: #15803d; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table th { background: #f8fafc; text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 2px solid #e2e8f0; }
    .table td { padding: 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; }
    .table .num { text-align: right; }
    .totals-area { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .totals-card { width: 280px; background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #64748b; font-weight: 600; }
    .total-row.grand { margin-top: 10px; padding-top: 10px; border-top: 2px solid #cbd5e1; font-size: 16px; font-weight: 900; color: #0f172a; }
    .legal-notice { font-size: 11px; color: #64748b; line-height: 1.6; background: #f8fafc; border-radius: 12px; padding: 16px; border-left: 4px solid #3b82f6; }
    .footer { text-align: center; padding: 20px 32px; background: #f1f5f9; font-size: 11px; color: #64748b; font-weight: 600; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-card { box-shadow: none; max-width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div class="header-top">
        <div>
          <div class="brand">VS CINEMAS</div>
          <div class="brand-sub">Multiplex Entertainment Network</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px;">GSTIN: 29AABCV1234F1Z5 • CIN: U92100KA2024PTC189421</div>
        </div>
        <div class="invoice-title-block">
          <div class="invoice-title">Tax Invoice</div>
          <div class="invoice-num">${invoiceNum}</div>
          <div style="margin-top: 6px;"><span class="badge">PAID IN FULL</span></div>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="meta-grid">
        <div class="meta-box">
          <h4>Billed To (Customer)</h4>
          <p>${customerName}</p>
          <p style="font-size: 12px; color: #64748b;">${customerEmail}</p>
          <p style="font-size: 12px; color: #64748b;">${customerPhone}</p>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Place of Supply: Karnataka (State Code 29)</p>
        </div>
        <div class="meta-box">
          <h4>Transaction Details</h4>
          <p>Txn Ref: <strong style="font-family: monospace;">${txnId}</strong></p>
          <p>Booking ID: <strong style="font-family: monospace;">${bookingId}</strong></p>
          <p>Date & Time: ${dateStr}</p>
          <p>Payment: ${paymentMethod}</p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Description & SAC Code</th>
            <th>Qty</th>
            <th class="num">Rate</th>
            <th class="num">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div><strong>Admission to Cinema Exhibition</strong></div>
              <div style="font-size: 11px; color: #64748b;">${movieTitle} • Seats: ${seatsStr}</div>
              <div style="font-size: 10px; color: #94a3b8;">${theatre} • SAC: 9996</div>
            </td>
            <td>${seatCount}</td>
            <td class="num">₹${(baseFare / seatCount).toFixed(2)}</td>
            <td class="num">₹${baseFare.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <div><strong>Online Convenience & Technology Fee</strong></div>
              <div style="font-size: 11px; color: #64748b;">Digital Ticket Servicing & Booking Portal SAC: 9996</div>
            </td>
            <td>1</td>
            <td class="num">₹${convenience.toFixed(2)}</td>
            <td class="num">₹${convenience.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals-area">
        <div class="totals-card">
          <div class="total-row">
            <span>Taxable Value:</span>
            <span>₹${(baseFare + convenience - Number(cgst) - Number(sgst)).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>CGST (9.0%):</span>
            <span>₹${cgst}</span>
          </div>
          <div class="total-row">
            <span>SGST (9.0%):</span>
            <span>₹${sgst}</span>
          </div>
          <div class="total-row grand">
            <span>Total Paid:</span>
            <span style="color: #16a34a;">₹${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="legal-notice">
        <strong>Digital Tax Compliance Notice:</strong> This is a computer-generated tax invoice under Rule 46 of the CGST Rules, 2017. Admission to the multiplex auditorium is governed by the Cinematograph Act, 1952. No physical signature is required.
      </div>
    </div>

    <div class="footer">
      Thank you for choosing VS Cinemas! For ticketing inquiries or corporate bookings, contact support@vscinemas.com
    </div>
  </div>
</body>
</html>`

      const blob = new Blob([invoiceHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VS-Invoice-${txnId}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`🧾 Official Tax Invoice ${invoiceNum} downloaded!`)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ========================================================
            1. HERO PROFILE CARD BANNER
            ======================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          {/* Subtle glow and geometric background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Left: Avatar & Basic Identity */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={user?.name || 'Vishnu Ramesh'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white/20 shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Vishnu Ramesh')}`
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-transform active:scale-95 cursor-pointer border-2 border-slate-900"
                  title="Change Profile Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name || 'Vishnu Ramesh'}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{user?.membershipTier || 'VS Elite Cinephile'}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>{user?.email || 'yourmail@gmail.com'}</span>
                  <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified
                  </span>
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 pt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{user?.phone || '+91 98765 43210'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{user?.city || 'Bengaluru'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Member since Jan 2026</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('personal')
                  setIsEditingInfo(true)
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Account Metrics Counter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 sm:p-4 border border-white/10 text-center sm:text-left">
              <span className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>Movies Watched</span>
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {stats.totalBookingsCount}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 sm:p-4 border border-white/10 text-center sm:text-left">
              <span className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tickets Booked</span>
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {stats.totalTicketsCount}
              </span>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('history')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveTab('history')
              }}
              className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 sm:p-4 border border-white/10 text-center sm:text-left hover:bg-white/10 transition-colors cursor-pointer group"
              title="Click to view Payment History"
            >
              <span className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Money Spent</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-400/70 group-hover:text-emerald-300 ml-0.5" />
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                ₹{stats.totalMoneySpent.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 sm:p-4 border border-white/10 text-center sm:text-left">
              <span className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>VS Reward Coins</span>
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                {stats.rewardPoints} <span className="text-xs font-bold text-slate-300">(₹{Math.round(stats.rewardPoints / 10)})</span>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. SECTION NAVIGATION TABS
            ======================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('personal')
              setIsEditingInfo(false)
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Bookings & Tickets ({allBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Payment History ({paymentTransactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Saved Cards & Wallets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Settings</span>
          </button>
        </div>

        {/* ========================================================
            3. TAB 1: PERSONAL INFORMATION
            ======================================================== */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-fade-in space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Personal Details</h2>
                <p className="text-xs text-slate-500">Manage your profile information and cinema preferences.</p>
              </div>
              {!isEditingInfo && (
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingInfo}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f8fafc] disabled:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:text-slate-600"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <span className="text-[10.5px] font-bold text-emerald-600">Verified</span>
                  </div>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditingInfo}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f8fafc] disabled:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:text-slate-600"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City / Preferred Region
                  </label>
                  <select
                    disabled={!isEditingInfo}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#f8fafc] disabled:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:text-slate-600 cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Movie Language
                  </label>
                  <select
                    disabled={!isEditingInfo}
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-[#f8fafc] disabled:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:text-slate-600 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Kannada">Kannada</option>
                  </select>
                </div>

                {/* Preferred Cinema Venue */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Cinema Venue
                  </label>
                  <select
                    disabled={!isEditingInfo}
                    value={preferredTheatre}
                    onChange={(e) => setPreferredTheatre(e.target.value)}
                    className="w-full bg-[#f8fafc] disabled:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:text-slate-600 cursor-pointer"
                  >
                    {THEATRES_LIST.map((th) => (
                      <option key={th.id} value={th.name}>
                        {th.name} ({th.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Edit Action Save / Cancel */}
              {isEditingInfo && (
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName(user?.name || 'Vishnu Ramesh')
                      setPhone(user?.phone || '+91 98765 43210')
                      setCity(user?.city || 'Bengaluru')
                      setIsEditingInfo(false)
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ========================================================
            4. TAB 2: MY BOOKINGS & TICKETS
            ======================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter bar */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBookingFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Bookings ({allBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingFilter === 'upcoming'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Upcoming Shows
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingFilter === 'completed'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Past Bookings
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/booking-history"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer pr-1"
                >
                  <span>Full History Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/booking"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer pr-1"
                >
                  <span>Book New</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bookings List Cards */}
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Left: Poster + Movie Details */}
                    <div className="flex gap-4 items-center">
                      <img
                        src={booking.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'}
                        alt={booking.movieTitle}
                        className="w-18 h-24 object-cover rounded-xl shadow-xs border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                        }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                            {booking.screen || 'IMAX Laser 3D'}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            ID: {booking.id}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-1">
                          {booking.movieTitle}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{booking.theatreName || 'VS Cinemas Orion Mall'}</span>
                        </p>

                        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold pt-0.5">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {booking.date || 'Today'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {booking.showtime || '7:45 PM'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Seats & Total */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">Seats Booked</span>
                        <span className="text-xs font-black text-blue-600 flex items-center md:justify-end gap-1 mt-0.5">
                          <Ticket className="w-3.5 h-3.5" />
                          {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
                        </span>
                      </div>

                      <div className="text-right mt-2">
                        <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">Amount Paid</span>
                        <span className="text-base font-black text-emerald-600 block">
                          ₹{booking.totalAmount?.toLocaleString('en-IN') || 520}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(booking)
                          setIsTicketModalOpen(true)
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View E-Ticket</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadTicket(booking)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Download Ticket"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Ticket className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Bookings Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You don't have any bookings matching this filter. Explore latest now-playing blockbusters!
                </p>
                <Link
                  to="/movies"
                  className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Explore Movies
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            3. TAB 3: PAYMENT HISTORY
            ======================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Metrics & Overview Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Paid</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{stats.totalMoneySpent.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% Verified Settled</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Transactions</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ReceiptText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {paymentTransactions.length}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  All digital bookings
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Avg. Booking Value</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{paymentTransactions.length > 0 ? Math.round(stats.totalMoneySpent / paymentTransactions.length) : 0}
                </div>
                <div className="text-[11px] text-indigo-600 font-bold mt-1">
                  Includes taxes & GST
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">GST Compliance</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-base font-black text-slate-900 truncate">
                  SAC 9996 Invoiced
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  Download official tax bills
                </div>
              </div>
            </div>

            {/* 2. Filter & Search Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    paymentFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({paymentTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentFilter('successful')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    paymentFilter === 'successful'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Successful ({paymentTransactions.filter((t) => t.status === 'Paid' || t.status === 'Successful').length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentFilter('refunded')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    paymentFilter === 'refunded'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Refunds & Void (0)
                </button>
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px] sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                  placeholder="Search by Txn ID, movie, card..."
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {paymentSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPaymentSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 3. Transaction Item Cards */}
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    {/* Header Bar: Txn ID, Date, Amount, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                          <span>{txn.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTxnId(txn.id)}
                            className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer p-0.5"
                            title="Copy Transaction ID"
                          >
                            {copiedTxnId === txn.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span className="text-[11px] font-mono text-slate-500 font-semibold">
                          Ref: {txn.bookingId}
                        </span>

                        <span className="text-slate-300">•</span>

                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{txn.date}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900 block leading-tight">
                            ₹{txn.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">All taxes incl.</span>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid & Confirmed</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Left: Movie & Venue Info (7 cols) */}
                      <div className="md:col-span-7 flex items-center gap-4">
                        <img
                          src={txn.poster}
                          alt={txn.movieTitle}
                          className="w-16 h-22 object-cover rounded-xl shadow-xs border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                          }}
                        />

                        <div className="space-y-1 min-w-0">
                          <h4 className="text-base font-black text-slate-900 leading-snug line-clamp-1">
                            {txn.movieTitle}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 line-clamp-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{txn.theatre}</span>
                          </p>
                          <div className="flex items-center gap-2 pt-0.5 text-xs flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                              Seats: {txn.seats.join(', ')} ({txn.seats.length} {txn.seats.length === 1 ? 'Seat' : 'Seats'})
                            </span>
                            <span className="text-slate-500 font-medium text-[11px]">
                              Method: <strong className="text-slate-700 font-bold">{txn.paymentMethod}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price Breakdown & Actions (5 cols) */}
                      <div className="md:col-span-5 bg-[#f8fafc] rounded-2xl p-3 border border-slate-200/80 flex flex-col justify-between gap-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tickets</span>
                            <span className="font-bold text-slate-700">₹{txn.baseFare}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Fee</span>
                            <span className="font-bold text-slate-700">₹{txn.convenience}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">GST (18%)</span>
                            <span className="font-bold text-slate-700">₹{txn.gst}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(txn)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            title="Download GST Tax Invoice HTML"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(txn.booking)
                              setIsTicketModalOpen(true)
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs backdrop-blur-xs"
                            title="View E-Ticket"
                          >
                            <Ticket className="w-3.5 h-3.5 text-blue-600" />
                            <span>View Ticket</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <ReceiptText className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Payment Records Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {paymentSearchQuery
                    ? `No transactions match your search "${paymentSearchQuery}". Try clearing search filters.`
                    : "You haven't made any transactions yet. Book movie tickets to see your billing statements and tax invoices."}
                </p>
                {paymentSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentSearchQuery('')
                      setPaymentFilter('all')
                    }}
                    className="inline-block px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/movies"
                    className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                  >
                    Explore Now Playing Movies
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            4. TAB 4: SAVED CARDS & WALLETS
            ======================================================== */}
        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Left: Saved Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Saved Cards</h3>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('To save a new card, check "Save card" on the payment checkout page.')}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              </div>

              <div className="space-y-3">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-3 bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded bg-slate-900 text-white font-black text-[9px] flex items-center justify-center italic tracking-wider shrink-0">
                        {card.brand.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          •••• •••• •••• {card.last4}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {card.bank} • Expires {card.expiry}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Saved UPI IDs */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Linked UPI IDs</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Instant 1-Click</span>
              </div>

              <div className="space-y-3">
                {savedUpis.map((upi) => (
                  <div
                    key={upi.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between gap-3 bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{upi.vpa}</span>
                          {upi.isDefault && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-slate-500 font-medium block">{upi.app}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteUpi(upi.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove UPI ID"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            6. TAB 4: SECURITY & SETTINGS
            ======================================================== */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Change Password Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Change Password</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ensure your account uses a strong 6+ character password.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Notification & Communication Preferences */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span>Notification Preferences</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Control how VS Cinemas delivers your ticket updates.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 bg-[#f8fafc] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Email E-Ticket Confirmation</span>
                    <span className="text-[11px] text-slate-500 block">Receive instant PDF tickets & VAT receipts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 bg-[#f8fafc] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">WhatsApp Show Reminders</span>
                    <span className="text-[11px] text-slate-500 block">Get turnstile barcode sent 2 hours before show</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 bg-[#f8fafc] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Blockbuster Early Access Alerts</span>
                    <span className="text-[11px] text-slate-500 block">Advance booking notifications for tentpole IMAX movies</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={promoAlerts}
                    onChange={(e) => setPromoAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          7. AVATAR SELECTOR MODAL
          ======================================================== */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Choose Profile Avatar</h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => handleSelectAvatar(url)}
                  className="group relative rounded-2xl overflow-hidden aspect-square border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer shadow-xs"
                >
                  <img src={url} alt={`Avatar preset ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleCustomAvatarSubmit} className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Modal for Viewing full Ticket */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={selectedTicket}
      />
    </div>
  )
}
