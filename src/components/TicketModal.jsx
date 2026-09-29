import React from 'react'
import { X, Printer, CheckCircle, Ticket, QrCode, Calendar, Clock } from 'lucide-react'

export default function TicketModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm tracking-wide">Booking Confirmed!</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Ticket"
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Movie title & Poster thumbnail */}
          <div className="flex gap-4 items-center">
            {ticket.poster && (
              <img
                src={ticket.poster}
                alt={ticket.movieTitle}
                className="w-16 h-22 object-cover rounded-xl shadow-md border border-slate-200 shrink-0"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80'
                }}
              />
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 inline-block mb-1">
                {ticket.screen || 'IMAX Laser 3D'}
              </span>
              <h3 id="ticket-modal-title" className="text-base font-black text-slate-900 leading-snug line-clamp-2">
                {ticket.movieTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Booking ID: <span className="font-mono font-bold text-slate-800">{ticket.id}</span>
              </p>
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="bg-[#f8fafc] border border-dashed border-slate-300 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Showtime</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {ticket.showtime || '7:45 PM'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Date</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {ticket.date || 'Today'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Seats</span>
              <span className="font-black text-blue-600 flex items-center gap-1 mt-0.5">
                <Ticket className="w-3.5 h-3.5" />
                {Array.isArray(ticket.seats) ? ticket.seats.join(', ') : ticket.seats}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Total Paid</span>
              <span className="font-black text-emerald-600 mt-0.5 block text-sm">
                ₹{ticket.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* QR Code and Barcode simulation */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center mb-2">
              <QrCode className="w-28 h-28 text-slate-800" />
            </div>
            <p className="text-[11px] font-mono text-slate-500 tracking-wider">
              SCAN AT AUDITORIUM TURNSTILE
            </p>
            <div className="mt-2 text-[10px] text-slate-400">
              VS Cinemas • MG Road Galleria • Screen 1
            </div>
          </div>
        </div>

        {/* Ticket Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 sm:px-5 py-2 text-xs font-bold text-white bg-[#007bff] hover:bg-[#0062cc] rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print E-Ticket</span>
          </button>
        </div>
      </div>
    </div>
  )
}
