import React, { useState } from 'react'
import { X, Clock, Ticket, CreditCard } from 'lucide-react'
import { toast } from 'react-toastify'

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E']
const SEATS_PER_ROW = 8
const DEFAULT_OCCUPIED_SEATS = ['A3', 'A4', 'B5', 'C2', 'D1', 'E8']

export default function BookingModal({
  isOpen,
  onClose,
  movie,
  onConfirmBooking
}) {
  const [selectedShowtime, setSelectedShowtime] = useState(movie?.showtimes?.[0] || '7:45 PM')
  const [selectedSeats, setSelectedSeats] = useState(['D3', 'D4'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prevMovieId, setPrevMovieId] = useState(movie?.id)

  if (movie && movie.id !== prevMovieId) {
    setPrevMovieId(movie.id)
    setSelectedShowtime(movie.showtimes?.[0] || '7:45 PM')
    setSelectedSeats(['D3', 'D4'])
  }

  if (!isOpen || !movie) return null

  const handleToggleSeat = (seatId) => {
    if (DEFAULT_OCCUPIED_SEATS.includes(seatId)) return

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId))
    } else {
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  const handleConfirm = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat.')
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirmBooking({
        movieId: movie.id,
        movieTitle: movie.title,
        screen: movie.screen || 'IMAX Laser 3D',
        showtime: selectedShowtime,
        seats: selectedSeats,
        pricePerSeat: movie.price || 280,
        totalAmount: (movie.price || 280) * selectedSeats.length,
        poster: movie.poster,
        language: movie.language,
        genre: movie.genre
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const pricePerSeat = movie.price || 280
  const totalAmount = pricePerSeat * selectedSeats.length

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
                <span>₹{pricePerSeat} / seat</span>
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
                Select Your Seats
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {selectedSeats.length} seat(s) selected
              </span>
            </div>

            {/* Simulated Cinema Screen Projection */}
            <div className="relative mb-4 pt-1">
              <div className="h-1.5 w-3/4 mx-auto rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 shadow-sm shadow-blue-500/50" />
              <p className="text-[10px] text-center font-bold tracking-widest text-slate-400 uppercase mt-1">
                Auditorium Screen
              </p>
            </div>

            {/* Matrix of Seats wrapped in overflow-x-auto for small mobile resilience */}
            <div className="overflow-x-auto w-full py-1">
              <div className="min-w-[260px] space-y-2 max-w-md mx-auto">
                {SEAT_ROWS.map((row) => (
                  <div key={row} className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <span className="w-4 text-[11px] font-bold text-slate-400 text-center">
                      {row}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {Array.from({ length: SEATS_PER_ROW }).map((_, idx) => {
                        const seatNum = idx + 1
                        const seatId = `${row}${seatNum}`
                        const isOccupied = DEFAULT_OCCUPIED_SEATS.includes(seatId)
                        const isSelected = selectedSeats.includes(seatId)

                        let seatClasses = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-400 cursor-pointer'
                        if (isOccupied) {
                          seatClasses = 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-50'
                        } else if (isSelected) {
                          seatClasses = 'bg-[#007bff] text-white border-[#007bff] shadow-xs scale-105 cursor-pointer font-bold'
                        }

                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => handleToggleSeat(seatId)}
                            className={`w-6.5 sm:w-8 h-6.5 sm:h-8 rounded-lg border text-[10px] sm:text-[11px] font-medium flex items-center justify-center transition-all ${seatClasses}`}
                            title={`Seat ${seatId} ${isOccupied ? '(Reserved)' : ''}`}
                          >
                            {seatNum}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Legend */}
            <div className="flex items-center justify-center gap-4 sm:gap-5 mt-3 text-[11px] font-medium text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#007bff] border border-[#007bff]" />
                Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 opacity-60" />
                Occupied
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
                Calculation: {selectedSeats.length} × ₹{pricePerSeat}
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
