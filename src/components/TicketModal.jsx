import React, { useMemo, useState } from 'react'
import { X, Printer, Download } from 'lucide-react'
import { toast } from 'react-toastify'

// Authentic Cinema Barcode Stripe Pattern
const BARCODE_STRIPES = [
  { id: 'b1', x: 8, w: 2.5 },
  { id: 'b2', x: 13, w: 1.5 },
  { id: 'b3', x: 17, w: 3.5 },
  { id: 'b4', x: 23, w: 1.5 },
  { id: 'b5', x: 27, w: 4 },
  { id: 'b6', x: 34, w: 1.5 },
  { id: 'b7', x: 38, w: 2.5 },
  { id: 'b8', x: 43, w: 1 },
  { id: 'b9', x: 46, w: 3.5 },
  { id: 'b10', x: 52, w: 1.5 },
  { id: 'b11', x: 56, w: 4 },
  { id: 'b12', x: 63, w: 2.5 },
  { id: 'b13', x: 68, w: 1 },
  { id: 'b14', x: 71, w: 3.5 },
  { id: 'b15', x: 77, w: 1.5 },
  { id: 'b16', x: 81, w: 1.5 },
  { id: 'b17', x: 85, w: 4 },
  { id: 'b18', x: 92, w: 1 },
  { id: 'b19', x: 95, w: 2.5 },
  { id: 'b20', x: 100, w: 3.5 },
  { id: 'b21', x: 106, w: 1.5 },
  { id: 'b22', x: 110, w: 1 },
  { id: 'b23', x: 113, w: 3.5 },
  { id: 'b24', x: 119, w: 2.5 },
  { id: 'b25', x: 124, w: 1.5 },
  { id: 'b26', x: 128, w: 4 },
  { id: 'b27', x: 135, w: 1.5 },
  { id: 'b28', x: 139, w: 2.5 },
  { id: 'b29', x: 144, w: 1 },
  { id: 'b30', x: 147, w: 3.5 },
  { id: 'b31', x: 153, w: 1.5 },
  { id: 'b32', x: 157, w: 4 },
  { id: 'b33', x: 164, w: 1.5 },
  { id: 'b34', x: 168, w: 2.5 },
  { id: 'b35', x: 173, w: 1 },
  { id: 'b36', x: 176, w: 3.5 },
  { id: 'b37', x: 182, w: 1.5 },
  { id: 'b38', x: 186, w: 4 },
  { id: 'b39', x: 193, w: 1 },
  { id: 'b40', x: 196, w: 2.5 },
  { id: 'b41', x: 201, w: 3.5 },
  { id: 'b42', x: 207, w: 1.5 },
  { id: 'b43', x: 211, w: 3.5 }
]

export default function TicketModal({ isOpen, onClose, ticket }) {
  // Theme state: defaults to 'glassy' as requested
  const [ticketTheme, setTicketTheme] = useState('glassy')

  // Extract Screen number
  const screenVal = useMemo(() => {
    if (!ticket) return '02'
    const screenStr = ticket.screen || ticket.screenName || ''
    const match = screenStr.match(/(?:Screen|Auditorium|Audi|Hall)\s*(\d+)/i)
    if (match) return match[1].padStart(2, '0')
    const anyDigit = screenStr.match(/\d+/)
    return anyDigit ? anyDigit[0].padStart(2, '0') : '02'
  }, [ticket])

  // Extract Row and Seat numbers (Row formatted as Alphabet)
  const { rowLabel, seatNumbers } = useMemo(() => {
    if (!ticket) return { rowLabel: 'D', seatNumbers: '13, 14' }

    const rawSeats = Array.isArray(ticket.seats)
      ? ticket.seats
      : (ticket.seats || '13, 14').split(/[\s,]+/).filter(Boolean)

    if (rawSeats.length === 0) return { rowLabel: 'D', seatNumbers: '13, 14' }

    // Check if ticket.row is explicitly defined (letter or number)
    let alphabetRow = ''
    if (ticket.row) {
      const r = String(ticket.row).trim().toUpperCase()
      if (/^[A-Z]$/.test(r)) {
        alphabetRow = r
      } else {
        const num = parseInt(r, 10)
        if (!isNaN(num) && num >= 1 && num <= 26) {
          alphabetRow = String.fromCharCode(64 + num)
        }
      }
    }

    // If seats start with a row letter like "D13", "E4"
    const firstSeat = String(rawSeats[0] || '')
    const rowCharMatch = firstSeat.match(/^[A-Za-z]+/)

    if (rowCharMatch) {
      alphabetRow = alphabetRow || rowCharMatch[0].toUpperCase()

      const numsOnly = rawSeats
        .map((s) => String(s).replace(/^[A-Za-z]+/, '').padStart(2, '0'))
        .filter(Boolean)
        .join(', ')

      return {
        rowLabel: alphabetRow || 'D',
        seatNumbers: numsOnly || rawSeats.join(', ')
      }
    }

    return {
      rowLabel: alphabetRow || 'D',
      seatNumbers: rawSeats.join(', ')
    }
  }, [ticket])

  // Cast / billing line
  const billingCast = useMemo(() => {
    if (!ticket) return 'MICHAEL B. JORDAN • TESSA THOMPSON'
    if (ticket.movieTitle?.toLowerCase().includes('creed')) {
      return 'MICHAEL B. JORDAN • TESSA THOMPSON'
    }
    if (ticket.director) {
      return `DIRECTED BY ${ticket.director.toUpperCase()}`
    }
    if (ticket.genre) {
      return `${(ticket.language || 'ENGLISH').toUpperCase()} • ${ticket.genre.toUpperCase()}`
    }
    return 'VS CINEMAS EXCLUSIVE PRESENTATION'
  }, [ticket])

  if (!isOpen || !ticket) return null

  // Print Ticket
  const handlePrint = () => {
    window.print()
  }

  // Download Standalone Collectible HTML Ticket matching selected theme
  const handleDownloadTicket = () => {
    toast.info('Downloading official cinema pass...')
    setTimeout(() => {
      const ticketRef = ticket.id || `VS-BK-${Math.floor(10000 + Math.random() * 90000)}`
      const movieTitle = ticket.movieTitle || 'Movie Feature'
      const poster =
        ticket.poster ||
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
      const showDate = ticket.date || 'TODAY'
      const showtime = ticket.showtime || '7:45 PM'

      const isGlassy = ticketTheme === 'glassy'
      const bodyBg = isGlassy ? '#f1f5f9' : '#0b0f19'
      const cardBg = isGlassy ? '#ffffff' : '#000000'
      const cardColor = isGlassy ? '#0f172a' : '#ffffff'
      const cardBorder = isGlassy ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)'
      const cardShadow = isGlassy ? '0 20px 50px rgba(0,0,0,0.12)' : '0 25px 60px rgba(0,0,0,0.9)'
      const posterGradient = isGlassy
        ? 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.7) 50%, transparent 100%)'
        : 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.45) 50%, transparent 100%)'
      const castColor = isGlassy ? '#475569' : '#cbd5e1'
      const titleColor = isGlassy ? '#0f172a' : '#ffffff'
      const metaColor = isGlassy ? '#dc2626' : '#ef4444'
      const colDivider = isGlassy ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)'
      const colValColor = isGlassy ? '#0f172a' : '#ffffff'
      const notchBg = isGlassy ? '#e2e8f0' : '#0b0f19'
      const tearBorder = isGlassy ? '1.5px dashed rgba(0,0,0,0.15)' : '1.5px dashed rgba(255,255,255,0.22)'
      const barcodeColor = isGlassy ? '#0f172a' : '#ffffff'

      const ticketHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cinema Pass - ${ticketRef}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bodyBg};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 16px;
    }
    .ticket-card {
      width: 100%;
      max-width: 300px;
      background: ${cardBg};
      color: ${cardColor};
      border-radius: 28px;
      overflow: hidden;
      box-shadow: ${cardShadow};
      position: relative;
      border: ${cardBorder};
    }
    .poster-box {
      position: relative;
      width: 100%;
      height: 240px;
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
      background: ${posterGradient};
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 14px 14px;
      text-align: center;
    }
    .movie-cast {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: ${castColor};
      text-transform: uppercase;
      margin-bottom: 4px;
      line-height: 1.3;
    }
    .movie-title {
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      line-height: 1.15;
      color: ${titleColor};
    }
    .movie-meta {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: ${metaColor};
      text-transform: uppercase;
      margin-top: 4px;
    }
    .seating-box {
      background: ${cardBg};
      padding: 10px 14px 6px;
      display: flex;
      justify-content: space-between;
      text-align: center;
    }
    .seat-col { flex: 1; }
    .seat-col.mid { border-left: ${colDivider}; border-right: ${colDivider}; }
    .col-label {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .col-val {
      font-size: 20px;
      font-weight: 900;
      color: ${colValColor};
      margin-top: 2px;
      letter-spacing: 1px;
    }
    .watermark {
      font-size: 8px;
      font-family: monospace;
      color: #94a3b8;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
      margin: 4px 12px 2px;
    }
    .notch-strip {
      position: relative;
      height: 24px;
      background: ${cardBg};
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .notch-left {
      position: absolute;
      left: -12px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${notchBg};
    }
    .notch-right {
      position: absolute;
      right: -12px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${notchBg};
    }
    .tear-line {
      width: 100%;
      border-bottom: ${tearBorder};
      margin: 0 18px;
    }
    .barcode-box {
      background: ${cardBg};
      padding: 4px 16px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .barcode-svg {
      width: 100%;
      max-width: 200px;
      height: 44px;
      color: ${barcodeColor};
    }
    .barcode-code {
      font-family: monospace;
      font-size: 9px;
      color: #64748b;
      letter-spacing: 3px;
      margin-top: 4px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .ticket-card { box-shadow: none; max-width: 100%; border-radius: 0; border: none; }
      .notch-left, .notch-right { background: #ffffff; }
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="poster-box">
      <img src="${poster}" alt="${movieTitle}" class="poster-img" />
      <div class="poster-gradient">
        <div class="movie-cast">${billingCast}</div>
        <div class="movie-title">${movieTitle}</div>
        <div class="movie-meta">IN CINEMAS • ${showDate} • ${showtime}</div>
      </div>
    </div>

    <div class="seating-box">
      <div class="seat-col">
        <div class="col-label">SCREEN</div>
        <div class="col-val">${screenVal}</div>
      </div>
      <div class="seat-col mid">
        <div class="col-label">ROW</div>
        <div class="col-val">${rowLabel}</div>
      </div>
      <div class="seat-col">
        <div class="col-label">SEATS</div>
        <div class="col-val">${seatNumbers}</div>
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
        ${BARCODE_STRIPES.map((s) => `<rect x="${s.x}" y="0" width="${s.w}" height="50" />`).join('\n        ')}
      </svg>
      <div class="barcode-code">* ${ticketRef} *</div>
    </div>
  </div>
</body>
</html>`

      const blob = new Blob([ticketHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VS-Ticket-${ticketRef}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('🎟️ Cinema Pass downloaded successfully!')
    }, 400)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-colors duration-300 animate-fade-in ${
        ticketTheme === 'glassy'
          ? 'bg-slate-900/30 backdrop-blur-2xl bg-white/60'
          : 'bg-black/90 backdrop-blur-md'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      {/* Centered ticket container that fits 100% within viewport height */}
      <div
        className="relative flex flex-col items-center justify-center max-h-[96vh] my-auto select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Theme Switcher Pill (Glassy White vs Dark Cine) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-sm mb-2 shrink-0">
          <button
            type="button"
            onClick={() => setTicketTheme('glassy')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center gap-1 ${
              ticketTheme === 'glassy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>✨ Glassy White</span>
          </button>
          <button
            type="button"
            onClick={() => setTicketTheme('dark')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center gap-1 ${
              ticketTheme === 'dark'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎬 Dark Cine</span>
          </button>
        </div>

        {/* ========================================================
            THE CINEMA BOARDING PASS (FIT-TO-SCREEN PROPORTIONED)
            ======================================================== */}
        <div
          className={`w-[88vw] max-w-[285px] sm:max-w-[310px] rounded-[26px] sm:rounded-[28px] overflow-hidden flex flex-col relative shrink-0 transition-all duration-300 ${
            ticketTheme === 'glassy'
              ? 'bg-white/95 backdrop-blur-2xl text-slate-900 border border-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.18),0_0_40px_rgba(255,255,255,0.7)] ring-1 ring-slate-900/5'
              : 'bg-black text-white border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95)]'
          }`}
        >
          {/* Integrated Corner Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Ticket"
            className={`absolute top-2.5 right-2.5 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95 ${
              ticketTheme === 'glassy'
                ? 'bg-white/80 hover:bg-white text-slate-800 hover:text-slate-950 border border-slate-200/80 shadow-xs'
                : 'bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/25 shadow-lg'
            }`}
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* 1. TOP POSTER WITH GRADIENT VIGNETTE & MOVIE TITLE */}
          <div
            className={`relative w-full h-[180px] sm:h-[210px] overflow-hidden shrink-0 ${
              ticketTheme === 'glassy' ? 'bg-slate-100' : 'bg-slate-950'
            }`}
          >
            <img
              src={
                ticket.poster ||
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
              }
              alt={ticket.movieTitle || 'Movie Poster'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'
              }}
            />

            {/* Subtle Gradient Blend to Black / White */}
            <div
              className={`absolute inset-0 flex flex-col justify-end p-3 sm:p-4 text-center transition-all ${
                ticketTheme === 'glassy'
                  ? 'bg-gradient-to-t from-white via-white/80 to-transparent'
                  : 'bg-gradient-to-t from-black via-black/45 to-transparent'
              }`}
            >
              {/* Billing Cast / Subhead */}
              <div
                className={`text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.16em] uppercase mb-0.5 leading-tight truncate ${
                  ticketTheme === 'glassy' ? 'text-slate-600' : 'text-slate-300 drop-shadow-sm'
                }`}
              >
                {billingCast}
              </div>

              {/* Movie Title */}
              <h2
                id="ticket-modal-title"
                className={`text-lg sm:text-xl font-black uppercase tracking-tight leading-tight line-clamp-1 ${
                  ticketTheme === 'glassy' ? 'text-slate-950' : 'text-white drop-shadow-lg'
                }`}
              >
                {ticket.movieTitle || 'CREED III'}
              </h2>

              {/* Red Cinematic Banner */}
              <div
                className={`text-[9.5px] sm:text-[10.5px] font-extrabold tracking-[0.16em] uppercase mt-0.5 ${
                  ticketTheme === 'glassy' ? 'text-red-600' : 'text-red-500 drop-shadow-sm'
                }`}
              >
                IN CINEMAS • {ticket.date || 'MARCH'}
              </div>
            </div>
          </div>

          {/* 2. MIDDLE METADATA: SCREEN, ROW, SEATS */}
          <div
            className={`px-4 pt-2.5 pb-1.5 shrink-0 transition-colors ${
              ticketTheme === 'glassy' ? 'bg-white/95 text-slate-900' : 'bg-black text-white'
            }`}
          >
            <div className="flex items-center justify-between text-center">
              {/* SCREEN */}
              <div className="flex-1">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  SCREEN
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black block mt-0.5 tracking-tight ${
                    ticketTheme === 'glassy' ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {screenVal}
                </span>
              </div>

              {/* ROW */}
              <div
                className={`flex-1 border-x px-1 ${
                  ticketTheme === 'glassy' ? 'border-slate-200/90' : 'border-white/10'
                }`}
              >
                <span className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  ROW
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black block mt-0.5 tracking-tight ${
                    ticketTheme === 'glassy' ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {rowLabel}
                </span>
              </div>

              {/* SEATS */}
              <div className="flex-1">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  SEATS
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black block mt-0.5 tracking-tight ${
                    ticketTheme === 'glassy' ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {seatNumbers}
                </span>
              </div>
            </div>

            {/* Subtle Watermark Fine Print */}
            <div
              className={`text-[8px] sm:text-[8.5px] font-mono tracking-[0.15em] uppercase text-center mt-1.5 truncate ${
                ticketTheme === 'glassy' ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {ticket.theatreName || 'VS CINEMAS'} • ADMIT PASS
            </div>
          </div>

          {/* 3. SIGNATURE SIDE CUTOUT NOTCHES & PERFORATION LINE */}
          <div
            className={`relative w-full h-6 flex items-center justify-center overflow-hidden shrink-0 transition-colors ${
              ticketTheme === 'glassy' ? 'bg-white/95' : 'bg-black'
            }`}
          >
            {/* Left Notch Hole Punch */}
            <div
              className={`absolute -left-3 w-6 h-6 rounded-full shadow-inner ${
                ticketTheme === 'glassy'
                  ? 'bg-slate-200/90 border border-slate-300/80'
                  : 'bg-[#0b0f19] border-r border-white/10'
              }`}
            />

            {/* Dashed Perforation Line */}
            <div
              className={`w-full border-b border-dashed mx-4 ${
                ticketTheme === 'glassy' ? 'border-slate-300' : 'border-white/20'
              }`}
            />

            {/* Right Notch Hole Punch */}
            <div
              className={`absolute -right-3 w-6 h-6 rounded-full shadow-inner ${
                ticketTheme === 'glassy'
                  ? 'bg-slate-200/90 border border-slate-300/80'
                  : 'bg-[#0b0f19] border-l border-white/10'
              }`}
            />
          </div>

          {/* 4. BOTTOM BARCODE STUB */}
          <div
            className={`px-4 pb-3.5 pt-0.5 flex flex-col items-center justify-center text-center shrink-0 transition-colors ${
              ticketTheme === 'glassy' ? 'bg-white/95' : 'bg-black'
            }`}
          >
            {/* Crisp Scalable Barcode */}
            <div className="w-full flex justify-center py-0.5">
              <svg
                viewBox="0 0 220 50"
                className={`w-full max-w-[200px] h-9 sm:h-10 ${
                  ticketTheme === 'glassy' ? 'text-slate-950' : 'text-white'
                }`}
                fill="currentColor"
              >
                {BARCODE_STRIPES.map((stripe) => (
                  <rect key={stripe.id} x={stripe.x} y="0" width={stripe.w} height="50" />
                ))}
              </svg>
            </div>

            {/* Barcode Number / Turnstile Booking ID */}
            <div
              className={`font-mono text-[8.5px] sm:text-[9px] tracking-[0.25em] font-bold mt-1 uppercase ${
                ticketTheme === 'glassy' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              * {ticket.id || 'VS-BK-7842'} *
            </div>
          </div>
        </div>

        {/* 5. TICKET ACTION CONTROLS BELOW THE CARD */}
        <div className="flex items-center gap-2 mt-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTicket}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              ticketTheme === 'glassy'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-white text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Pass</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              ticketTheme === 'glassy'
                ? 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90 shadow-2xs backdrop-blur-md'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              ticketTheme === 'glassy'
                ? 'bg-slate-200/70 hover:bg-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
