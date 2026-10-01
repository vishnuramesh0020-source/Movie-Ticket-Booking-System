import { Link } from 'react-router-dom'
import { Star, Clock, Calendar, Globe, Play, Ticket, Info } from 'lucide-react'

export default function MovieCard({
  movie,
  onWatchTrailer,
  onBookTicket
}) {
  if (!movie) return null

  // Format date nicely (e.g., Jul 29, 2026)
  const formattedDate = (() => {
    try {
      const d = new Date(movie.releaseDate)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
    } catch {
      // fallback
    }
    return movie.releaseDate || 'Coming Soon'
  })()

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-blue-400/80 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* 1. POSTER with badges & quick actions */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
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

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* 4. LANGUAGE Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
          <Globe className="w-3 h-3 text-blue-400" />
          <span>{movie.language}</span>
        </div>

        {/* 6. RATING Badge (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/95 backdrop-blur-md text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
          <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
          <span>{movie.rating}</span>
        </div>

        {/* Format Badge (Bottom Left of Poster) */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-600/90 text-white backdrop-blur-xs shadow-xs">
            {movie.screen || 'IMAX Laser 3D'}
          </span>
        </div>

        {/* Price Tag (Bottom Right of Poster) */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-black text-white bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/20">
            ₹{movie.price || 280}
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2">
          {/* 3. GENRE Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
              {movie.genre}
            </span>
          </div>

          {/* 2. MOVIE NAME */}
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
            <Link to={`/movies/${movie.id}`} title={movie.title}>
              {movie.title}
            </Link>
          </h3>

          {/* 5. DURATION & 7. RELEASE DATE Meta row */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1 shrink-0" title={`Duration: ${movie.duration}`}>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{movie.duration}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 shrink-0" title={`Release Date: ${formattedDate}`}>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* 8. DESCRIPTION */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal pt-0.5">
            {movie.overview}
          </p>
        </div>

        {/* 9. TRAILER BUTTON (UI ONLY) & Quick Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          {/* 9. Trailer Button (UI Only) */}
          <button
            type="button"
            onClick={() => onWatchTrailer && onWatchTrailer(movie)}
            className="flex-1 min-w-[75px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold py-2 px-2.5 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Watch Official Theatrical Trailer"
          >
            <Play className="w-3.5 h-3.5 text-red-600 fill-red-600 shrink-0" />
            <span>Trailer</span>
          </button>

          {/* Direct Details Link */}
          <Link
            to={`/movies/${movie.id}`}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="View Full Movie Details"
          >
            <Info className="w-4 h-4" />
          </Link>

          {/* Book Tickets Button */}
          <button
            type="button"
            onClick={() => onBookTicket && onBookTicket(movie)}
            className="bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white text-xs font-bold py-2 px-3 sm:px-3.5 rounded-xl shadow-xs shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Book Seats for this Movie"
          >
            <Ticket className="w-3.5 h-3.5 shrink-0" />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  )
}
