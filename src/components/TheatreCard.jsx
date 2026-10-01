import { Link } from 'react-router-dom'
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  ChevronRight,
  Ticket,
  Mail,
  Info
} from 'lucide-react'

export default function TheatreCard({
  theatre,
  onQuickBook
}) {
  if (!theatre) return null

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-blue-400/80 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner Image with City & Rating Badges */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={theatre.image}
          alt={theatre.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />

        {/* City Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
          <MapPin className="w-3 h-3 text-rose-400" />
          <span>{theatre.city}</span>
        </div>

        {/* Rating Badge (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/95 backdrop-blur-md text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
          <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
          <span>{theatre.rating}</span>
          <span className="text-[10px] font-normal text-slate-800">({theatre.reviewsCount})</span>
        </div>

        {/* Screens Count Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-blue-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{theatre.screensCount} Screens</span>
          </span>
          <span className="text-[11px] font-semibold text-white/90 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-xs">
            {theatre.dailyShows} Daily Shows
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* 1. THEATRE NAME */}
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-snug">
              <Link to={`/theatres/${theatre.id}`} title={theatre.name}>
                {theatre.name}
              </Link>
            </h3>

            {/* 2. ADDRESS & 3. CITY */}
            <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{theatre.address}, {theatre.city}</span>
            </div>

            {/* Landmark & Distance notice */}
            {theatre.locationDetails?.landmark && (
              <p className="text-[11px] text-slate-400 pl-5 mt-0.5">
                📍 {theatre.locationDetails.landmark}
              </p>
            )}
          </div>

          {/* Facilities Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(theatre.facilities || []).slice(0, 4).map((fac) => (
              <span
                key={fac}
                className="text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded-md"
              >
                {fac}
              </span>
            ))}
            {(theatre.facilities || []).length > 4 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{theatre.facilities.length - 4} more
              </span>
            )}
          </div>

          {/* 5. AVAILABLE SHOWS SECTION */}
          <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Today's Available Shows</span>
              </span>
              <span className="text-[10.5px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Timings
              </span>
            </div>

            {theatre.availableShows && theatre.availableShows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {theatre.availableShows.slice(0, 4).map((show) => (
                  <button
                    key={show.id}
                    type="button"
                    onClick={() => onQuickBook && onQuickBook(show, theatre)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between gap-1 group/btn cursor-pointer shadow-2xs"
                    title={`Book "${show.movieTitle}" at ${show.time} - ₹${show.price}`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate group-hover/btn:text-blue-600">
                        {show.movieTitle}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {show.time} • {show.screen ? `${show.screen.split('(')[0]?.trim()} • ` : ''}{show.format}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#228653] shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ₹{show.price}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No scheduled shows at this moment.</p>
            )}
          </div>

          {/* 6. CONTACT INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold truncate">{theatre.contact?.phone || '+91 80 4910 2200'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">{theatre.contact?.email || 'support@vscinemas.com'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* View Details Link */}
          <Link
            to={`/theatres/${theatre.id}`}
            className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Inspect Available Screens, Tech Specs & Show Timings"
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Screens & Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Google Maps Directions */}
          {theatre.locationDetails?.mapUrl && (
            <a
              href={theatre.locationDetails.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Get Directions on Google Maps"
            >
              <Navigation className="w-4 h-4 text-emerald-600" />
            </a>
          )}

          {/* Quick Book Button */}
          {theatre.availableShows && theatre.availableShows.length > 0 && (
            <button
              type="button"
              onClick={() => onQuickBook && onQuickBook(theatre.availableShows[0], theatre)}
              className="bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-xs shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Book tickets for today's show"
            >
              <Ticket className="w-3.5 h-3.5 shrink-0" />
              <span>Book Show</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
