import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, AlertCircle, User, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AstroAuthLayout from '../components/AstroAuthLayout'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm()

  const onSubmit = async (data) => {
    const res = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password
    })

    if (res.success) {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <AstroAuthLayout title="Sign Up" subtitle="Best Online Ticketing System In Town">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-left" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-left">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Your full name"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
              className={`w-full bg-white text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-2xl border border-amber-300/60 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs text-sm font-medium transition-all ${
                errors.name ? 'ring-2 ring-rose-500 border-rose-400' : ''
              }`}
            />
          </div>
          {errors.name && (
            <div className="flex items-center gap-1 text-xs text-rose-700 font-medium mt-1 drop-shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name.message}</span>
            </div>
          )}
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
              className={`w-full bg-white text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-2xl border border-amber-300/60 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs text-sm font-medium transition-all ${
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
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-left">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={`w-full bg-white text-slate-900 placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-2xl border border-amber-300/60 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs text-sm font-medium transition-all ${
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

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-left">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) =>
                  val === getValues('password') || 'Passwords do not match'
              })}
              className={`w-full bg-white text-slate-900 placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-2xl border border-amber-300/60 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs text-sm font-medium transition-all ${
                errors.confirmPassword ? 'ring-2 ring-rose-500 border-rose-400' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center gap-1 text-xs text-rose-700 font-medium mt-1 drop-shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.confirmPassword.message}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#007bff] hover:bg-[#0062cc] active:bg-[#0056b3] text-white font-bold py-3 px-5 rounded-2xl transition-all shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Bottom Helper Footer */}
        <div className="pt-2 text-center text-xs text-slate-900">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-blue-700 hover:text-blue-900 font-bold hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      </form>
    </AstroAuthLayout>
  )
}
