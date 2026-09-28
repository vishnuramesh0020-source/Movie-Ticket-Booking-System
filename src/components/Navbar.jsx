import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Film, Ticket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#023e73] backdrop-blur-md border-b border-blue-900 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <Logo className="h-5 w-auto" />
        </Link>

        {/* Center: Quick navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-white hover:text-white transition-colors"
          >
            <Film className="w-4 h-4 text-[#5e3bf2]" />
            <span>Now Showing</span>
          </Link>
          <a
            href="#my-bookings"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span>Bookings</span>
          </a>
        </nav>

        {/* Right: User profile pill & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 rounded-full py-1 px-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#5e3bf2]"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                }}
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
