import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Bell, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar({ searchQuery = '', onSearchChange }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand & Dashboard title */}
        <div className="flex items-center gap-5 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3">
            <Logo className="h-6 w-auto" />
          </Link>
          <span className="hidden sm:inline text-xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </span>
        </div>

        {/* Center: Search pill matching the reference image */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search...."
              className="w-full bg-[#f8fafc] hover:bg-slate-100/60 focus:bg-white border border-slate-200/90 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Notifications & User profile pill */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Notification Bell matching image */}
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile matching Alex Ragnarsson / Admin Store */}
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt={user?.name || "Alex Ragnarsson"}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Alex Ragnarsson')}`
              }}
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Alex Ragnarsson'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Admin Store
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
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
