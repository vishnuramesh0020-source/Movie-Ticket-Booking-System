import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Bell, Search, LayoutDashboard, Film, Building2, Ticket, History, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar({ searchQuery = '', onSearchChange, searchPlaceholder }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isDashboard = location.pathname === '/dashboard'
  const isMovies = location.pathname.startsWith('/movies')
  const isTheatres = location.pathname.startsWith('/theatres')
  const isSeats =
    location.pathname.startsWith('/seat-selection') ||
    location.pathname.startsWith('/seats') ||
    location.pathname.startsWith('/booking') ||
    location.pathname.startsWith('/book') ||
    location.pathname.startsWith('/payment') ||
    location.pathname.startsWith('/checkout')
  const isBookings =
    location.pathname.startsWith('/booking-history') ||
    location.pathname.startsWith('/bookings') ||
    location.pathname.startsWith('/my-bookings')
  const isReports =
    location.pathname.startsWith('/reports') ||
    location.pathname.startsWith('/analytics')
  const isProfile = location.pathname.startsWith('/profile')

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (!isMovies && !isTheatres) {
        navigate('/movies')
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-6">
        {/* Left: Brand & Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Logo className="h-5 sm:h-6 w-auto" />
          </Link>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden sm:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isDashboard
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/movies"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isMovies
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </Link>

            <Link
              to="/theatres"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isTheatres
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Theatres</span>
            </Link>

            <Link
              to="/booking"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSeats
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </Link>

            <Link
              to="/booking-history"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isBookings
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Bookings</span>
            </Link>

            <Link
              to="/reports"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isReports
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reports</span>
            </Link>
          </nav>
        </div>

        {/* Center: Search pill with min-w-0 for flex shrinking */}
        <div className="flex-1 min-w-0 max-w-md mx-1 sm:mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder={searchPlaceholder || (isTheatres ? 'Search theatres, cities, specs...' : 'Search movies...')}
              className="w-full bg-[#f8fafc] hover:bg-slate-100/60 focus:bg-white border border-slate-200/90 rounded-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Notifications & User profile pill */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Mobile Quick Switcher */}
          <div className="sm:hidden flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/70">
            <Link
              to="/dashboard"
              className={`p-1.5 rounded-md ${isDashboard ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/movies"
              className={`p-1.5 rounded-md ${isMovies ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Movies"
            >
              <Film className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/theatres"
              className={`p-1.5 rounded-md ${isTheatres ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Theatres"
            >
              <Building2 className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/booking"
              className={`p-1.5 rounded-md ${isSeats ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Book Tickets"
            >
              <Ticket className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/booking-history"
              className={`p-1.5 rounded-md ${isBookings ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Booking History"
            >
              <History className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/reports"
              className={`p-1.5 rounded-md ${isReports ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Reports & Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Notification Bell (Hidden on small mobile screens to prevent cramming) */}
          <button
            type="button"
            className="hidden sm:flex w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <Link
            to="/profile"
            className={`flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-2xl border transition-all cursor-pointer ${
              isProfile
                ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                : 'border-transparent hover:bg-slate-100 hover:border-slate-200'
            }`}
            title="View My Profile"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt={user?.name || "Vishnu Ramesh"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs shrink-0"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Vishnu Ramesh')}`
              }}
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Vishnu Ramesh'}
              </p>
              <p className="text-[10px] text-blue-600 font-bold">
                {user?.membershipTier || 'VS Elite Member'}
              </p>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
