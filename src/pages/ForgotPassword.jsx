import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AstroAuthLayout from '../components/AstroAuthLayout'

export default function ForgotPassword() {
  const [submittedEmail, setSubmittedEmail] = useState(null)
  const { forgotPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data) => {
    await forgotPassword(data.email)
    setSubmittedEmail(data.email)
  }

  return (
    <AstroAuthLayout title="Reset Password" subtitle="Best Online Ticketing System In Town">
      {!submittedEmail ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-normal text-black mb-1.5">
              Email :
            </label>
            <input
              type="email"
              placeholder="Enter your registered email"
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

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/login"
              className="text-xs sm:text-sm text-black hover:underline font-normal transition-colors"
            >
              Back to Log In
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#007bff] hover:bg-[#0069d9] active:bg-[#0062cc] text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded transition-colors shadow-xs disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Send Link</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-lg shadow-lg text-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Reset Link Sent!</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We have sent password recovery instructions to <strong>{submittedEmail}</strong>.
          </p>
          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => setSubmittedEmail(null)}
              className="text-slate-500 hover:text-black underline"
            >
              Change email
            </button>
            <Link
              to="/login"
              className="text-white bg-[#007bff] hover:bg-[#0069d9] px-3 py-1 rounded font-medium"
            >
              Return to Log In
            </Link>
          </div>
        </div>
      )}
    </AstroAuthLayout>
  )
}
