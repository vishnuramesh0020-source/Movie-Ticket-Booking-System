import React from 'react'
import { X, Film, Star, Clock, Globe, Ticket, Volume2 } from 'lucide-react'

export default function TrailerModal({ isOpen, onClose, movie, onBook }) {
  if (!isOpen || !movie) return null

  const trailerKey = movie.trailerKey || 'FB-pD2gDH2Q'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2
                id="trailer-modal-title"
                className="text-sm sm:text-base font-bold text-white truncate"
              >
                {movie.title} - Official Theatrical Trailer
              </h2>
              <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-medium">
                <span className="text-amber-400 flex items-center gap-1 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {movie.rating}
                </span>
                <span>•</span>
                <span>{movie.genre}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {movie.duration}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-400 font-semibold">
                  <Globe className="w-3 h-3" />
                  {movie.language}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trailer Modal"
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Section */}
        <div className="relative w-full bg-black aspect-video overflow-hidden">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Footer info & Actions */}
        <div className="px-4 sm:px-6 py-4 bg-slate-950/95 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-300 border border-blue-700/50 font-semibold text-[11px]">
              {movie.screen || 'IMAX Laser 3D'}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              Dolby Atmos Sound
            </span>
            <span className="text-slate-400 hidden md:inline">
              • Released {movie.releaseDate}
            </span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            {onBook && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onBook(movie)
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#007bff] hover:bg-[#0062cc] rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Book Tickets</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
