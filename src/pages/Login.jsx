import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AstroAuthLayout from '../components/AstroAuthLayout'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, rememberedEmail, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/dashboard'
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: rememberedEmail || 'yourmail@gmail.com',
      password: ''
    }
  })

  // Quick fill helper for Demo login
  const handleFillDemo = (e) => {
    e.preventDefault()
    setValue('email', 'yourmail@gmail.com', { shouldValidate: true })
    setValue('password', 'password123', { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password, true)
    if (result.success) {
      const destination = location.state?.from?.pathname || '/dashboard'
      navigate(destination, { replace: true })
    }
  }

  return (
    <AstroAuthLayout title="Log In" subtitle="Best Online Ticketing System In Town">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
        {/* 1-Click Quick Demo Pill */}
        <div className="flex items-center justify-end text-xs">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-xl border border-blue-200 transition-all cursor-pointer shadow-2xs"
          >
            Auto Fill
          </button>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-left">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="name@example.com"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              className={`w-full bg-white text-slate-900 placeholder-slate-400 pl-10 pr-4 py-3 rounded-2xl border border-amber-300/60 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs text-sm font-medium transition-all ${
                errors.email ? 'ring-2 ring-rose-500 border-rose-400' : ''
              }`}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-1 text-xs text-rose-700 font-medium mt-1 drop-shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* Password Field with Show/Hide toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider text-left">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-blue-700 hover:text-blue-900 hover:underline font-semibold"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={`w-full bg-white text-slate-900 placeholder-slate-400 pl-10 pr-10 py-3 rounded-2xl border border-amber-300/60 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs text-sm font-medium transition-all ${
                errors.password ? 'ring-2 ring-rose-500 border-rose-400' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-1 text-xs text-rose-700 font-medium mt-1 drop-shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white font-bold py-3 px-5 rounded-2xl transition-all shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Cinema</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Bottom Helper Footer */}
        <div className="pt-2 text-center text-xs text-slate-900">
          <span>Don&apos;t have an account? </span>
          <Link
            to="/register"
            className="text-blue-700 hover:text-blue-900 font-bold hover:underline ml-1"
          >
            Create New Account
          </Link>
        </div>
      </form>
    </AstroAuthLayout>
  )
}
