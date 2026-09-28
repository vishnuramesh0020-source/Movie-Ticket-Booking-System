import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-sm font-normal text-black mb-1">
            Full Name :
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            {...register('name', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
            className={`w-full bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2 rounded-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm transition-all ${
              errors.name ? 'ring-2 ring-rose-500' : ''
            }`}
          />
          {errors.name && (
            <div className="flex items-center gap-1 text-xs text-rose-700 font-medium mt-1 drop-shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-normal text-black mb-1">
            Email :
          </label>
          <input
            type="email"
            placeholder="Enter email"
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            })}
            className={`w-full bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2 rounded-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm transition-all ${
              errors.email ? 'ring-2 ring-rose-500' : ''
            }`}
          />
          {errors.email && (
            <div className="flex items-center gap-1 text-xs text-rose-700 font-medium mt-1 drop-shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* Password Field with Show/Hide toggle */}
        <div>
          <label className="block text-sm font-normal text-black mb-1">
            Password :
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password (min. 6 characters)"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={`w-full bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2 pr-10 rounded-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm transition-all ${
                errors.password ? 'ring-2 ring-rose-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
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
          <label className="block text-sm font-normal text-black mb-1">
            Confirm Password :
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) =>
                  val === getValues('password') || 'Passwords do not match'
              })}
              className={`w-full bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2 pr-10 rounded-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm transition-all ${
                errors.confirmPassword ? 'ring-2 ring-rose-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
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

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to="/login"
            className="text-xs sm:text-sm text-black hover:underline font-normal transition-colors"
          >
            Already have an account? Log In
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#007bff] hover:bg-[#0069d9] active:bg-[#0062cc] text-white text-xs sm:text-sm font-medium px-5 py-1.5 rounded transition-colors shadow-xs disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>Sign Up</span>
          </button>
        </div>
      </form>
    </AstroAuthLayout>
  )
}
