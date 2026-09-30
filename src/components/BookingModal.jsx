import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Clock, Ticket, CreditCard, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  AUDITORIUM_TIERS_CONFIG,
  INITIAL_BOOKED_SEATS,
  MAX_SEAT_LIMIT,
  getSeatTierPrice,
  THEATRES_LIST
} from '../services/api'

export default function BookingModal({
  isOpen,
  onClose,
  movie,
  onConfirmBooking
}) {
  const [selectedShowtime, setSelectedShowtime] = useState(movie?.showtimes?.[0] || '7:45 PM')
  const [selectedSeats, setSelectedSeats] = useState(['D1', 'D2'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prevMovieId, setPrevMovieId] = useState(movie?.id)

  if (movie && movie.id !== prevMovieId) {
    setPrevMovieId(movie.id)
    setSelectedShowtime(movie.showtimes?.[0] || '7:45 PM')
    setSelectedSeats(['D1', 'D2'])
  }

  if (!isOpen || !movie) return null

  const handleToggleSeat = (seatId) => {
    if (INITIAL_BOOKED_SEATS.includes(seatId)) return

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId))
    } else {
      if (selectedSeats.length >= MAX_SEAT_LIMIT) {
        toast.warning(`Maximum ${MAX_SEAT_LIMIT} seats allowed per booking.`)
        return
      }
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  const totalAmount = selectedSeats.reduce(
    (sum, seatId) => sum + getSeatTierPrice(seatId, movie?.price || 280),
    0
  )

  const handleConfirm = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat.')
      return
    }

    setIsSubmitting(true)
    try {
      const avgPrice = Math.round(totalAmount / selectedSeats.length)
      await onConfirmBooking({
        movieId: movie.id,
        movieTitle: movie.title,
        screen: movie.screen || 'IMAX Laser 3D',
        showtime: selectedShowtime,
        date: 'Today',
        theatreId: THEATRES_LIST[0].id,
        theatreName: THEATRES_LIST[0].name,
        seats: selectedSeats,
        pricePerSeat: avgPrice,
        totalAmount,
        poster: movie.poster,
        language: movie.language,
        genre: movie.genre
      })
    } catch (err) {
      toast.error(err.message || 'Booking transaction failed. Please retry.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <span className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Ticket className="w-4 sm:w-5 h-4 sm:h-5" />
            </span>
            <div className="min-w-0">
              <h2 id="booking-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                {movie.title}
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium flex-wrap">
                <span className="text-blue-400 font-semibold">{movie.screen || 'IMAX Laser 3D'}</span>
                <span>•</span>
                <span>{movie.language}</span>
                <span>•</span>
                <span>₹250 - ₹640 / seat</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Booking Modal"
            className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Showtime Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Showtime
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(movie.showtimes || ['1:15 PM', '4:30 PM', '7:45 PM', '10:15 PM']).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedShowtime(st)}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedShowtime === st
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seat Layout Screen Curve */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Your Seats ({selectedSeats.length})
              </span>
              <Link
                to={`/seat-selection/${movie.id}?time=${encodeURIComponent(selectedShowtime)}`}
                onClick={onClose}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Full Seating Matrix</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Cinema Screen Banner (Matching user reference image: "Screen this side") */}
            <div className="pb-3 pt-1 text-center w-full max-w-sm sm:max-w-md mx-auto select-none">
              <div className="relative flex flex-col items-center">
                <svg
                  viewBox="0 0 540 64"
                  className="w-full h-8 sm:h-9.5 drop-shadow-[0_2px_8px_rgba(186,230,253,0.3)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="modalScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Screen Canopy Perspective Polygon with subtle curved edges */}
                  <path
                    d="M 14 12 Q 270 4 526 12 L 480 54 Q 270 45 60 54 Z"
                    fill="url(#modalScreenGrad)"
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

                  {/* Centered "Screen this side" Text */}
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

            {/* Matrix of Seats matching Reference Tiers & Walkway Aisle */}
            <div className="overflow-x-auto w-full py-1">
              <div className="min-w-[420px] max-w-lg mx-auto space-y-2.5">
                {AUDITORIUM_TIERS_CONFIG.map((tierGroup) => (
                  <div key={tierGroup.tierId} className="space-y-1">
                    {/* Tier Heading */}
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 pl-0.5">
                      {tierGroup.name} - ₹ {tierGroup.defaultPrice}
                    </div>

                    {/* Rows */}
                    <div className="space-y-1.5">
                      {tierGroup.rows.map((rowConfig) => {
                        const rowLetter = rowConfig.row

                        return (
                          <div
                            key={rowLetter}
                            className="flex items-center justify-between gap-1.5 sm:gap-2"
                          >
                            {/* Left Row Letter */}
                            <span className="w-3 text-[10px] font-medium text-slate-400 text-center select-none shrink-0">
                              {rowLetter}
                            </span>

                            {/* Center Row with Walkway Aisle */}
                            <div
                              className={`flex-1 flex items-center justify-center gap-3 sm:gap-5 ${rowConfig.indentClass}`}
                            >
                              {/* Left Seat Block */}
                              <div className="flex items-center gap-1">
                                {rowConfig.leftSeats.map((seatNum) => {
                                  const seatId = `${rowLetter}${seatNum}`
                                  const isOccupied = INITIAL_BOOKED_SEATS.includes(seatId)
                                  const isSelected = selectedSeats.includes(seatId)

                                  return (
                                    <button
                                      key={seatId}
                                      type="button"
                                      disabled={isOccupied}
                                      onClick={() => handleToggleSeat(seatId)}
                                      className="group relative cursor-pointer disabled:cursor-not-allowed focus:outline-none transition-transform active:scale-95"
                                      title={`Seat ${seatId} • ${tierGroup.name} - ₹${tierGroup.defaultPrice} ${
                                        isOccupied ? '(Reserved)' : ''
                                      }`}
                                    >
                                      <CinemaSeatGraphic
                                        status={
                                          isOccupied
                                            ? 'booked'
                                            : isSelected
                                            ? 'selected'
                                            : 'available'
                                        }
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                      />
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Right Seat Block */}
                              <div className="flex items-center gap-1">
                                {rowConfig.rightSeats.map((seatNum) => {
                                  const seatId = `${rowLetter}${seatNum}`
                                  const isOccupied = INITIAL_BOOKED_SEATS.includes(seatId)
                                  const isSelected = selectedSeats.includes(seatId)

                                  return (
                                    <button
                                      key={seatId}
                                      type="button"
                                      disabled={isOccupied}
                                      onClick={() => handleToggleSeat(seatId)}
                                      className="group relative cursor-pointer disabled:cursor-not-allowed focus:outline-none transition-transform active:scale-95"
                                      title={`Seat ${seatId} • ${tierGroup.name} - ₹${tierGroup.defaultPrice} ${
                                        isOccupied ? '(Reserved)' : ''
                                      }`}
                                    >
                                      <CinemaSeatGraphic
                                        status={
                                          isOccupied
                                            ? 'booked'
                                            : isSelected
                                            ? 'selected'
                                            : 'available'
                                        }
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                      />
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Right Row Letter */}
                            <span className="w-3 text-[10px] font-medium text-slate-400 text-center select-none shrink-0">
                              {rowLetter}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1.5">
                <CinemaSeatGraphic status="available" className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CinemaSeatGraphic status="selected" className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-blue-600">Selected</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CinemaSeatGraphic status="booked" className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Booked</span>
              </span>
            </div>
          </div>

          {/* Pricing & Booking Breakdown */}
          <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500 font-medium">
                Seats: <span className="font-bold text-slate-800">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedSeats.length > 0
                  ? selectedSeats.map((sId) => `${sId} (₹${getSeatTierPrice(sId, movie?.price || 280)})`).join(' + ')
                  : 'Select seats from the layout'}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500 font-medium">Total Amount:</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full xs:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || selectedSeats.length === 0}
            onClick={handleConfirm}
            className="w-full xs:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function CinemaSeatGraphic({ status = 'available', className = '' }) {
  if (status === 'selected') {
    return (
      <svg
        viewBox="0 0 32 30"
        className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-150 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0px 3px 8px rgba(67, 97, 238, 0.45))'
        }}
      >
        <path
          d="M 4 11 L 4 22 C 4 25.5 6.2 27 9 27 L 23 27 C 25.8 27 28 25.5 28 22 L 28 11"
          stroke="#4361ee"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
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
        className={`w-6 h-6 sm:w-7 sm:h-7 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 4 11 L 4 22 C 4 25.5 6.2 27 9 27 L 23 27 C 25.8 27 28 25.5 28 22 L 28 11"
          stroke="#7e8693"
          strokeWidth="2"
          strokeLinecap="round"
        />
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

  return (
    <svg
      viewBox="0 0 32 30"
      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-150 group-hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 4 11 L 4 22 C 4 25.5 6.2 27 9 27 L 23 27 C 25.8 27 28 25.5 28 22 L 28 11"
        stroke="#cbd5e1"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="group-hover:stroke-blue-400 transition-colors"
      />
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
