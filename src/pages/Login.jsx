import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-sm font-normal text-black mb-1.5">
            Email :
          </label>
          <div className="relative">
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
          <label className="block text-sm font-normal text-black mb-1.5">
            Password :
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
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

        {/* Bottom Actions Row: Create New Account | Fill Demo | Log In button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="text-xs sm:text-sm text-black hover:underline font-normal transition-colors"
            >
              Create New Account
            </Link>

            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs sm:text-sm text-[#007bff] hover:underline font-medium transition-colors cursor-pointer"
              title="Click to auto-fill demo credentials"
            >
              Fill Demo
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#007bff] hover:bg-[#0069d9] active:bg-[#0062cc] text-white text-xs sm:text-sm font-medium px-5 py-1.5 rounded transition-colors shadow-xs disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>Log In</span>
          </button>
        </div>
      </form>
    </AstroAuthLayout>
  )
}
