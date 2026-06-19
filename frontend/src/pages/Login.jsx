import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import { login, register as registerUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const mutation = useMutation({
    mutationFn: isRegister ? registerUser : login,
    onSuccess: (data) => {
      if (data.token && data.user) {
        loginUser(data.token, data.user)
        navigate('/')
      }
    },
    onError: (err) => {
      console.error('Auth error:', err)
    }
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    reset()
    mutation.reset()
  }

  const getErrorMessage = () => {
    const serverMsg = mutation.error?.response?.data?.error
    if (serverMsg) return serverMsg
    if (mutation.error?.message === 'Network Error') return 'Cannot connect to server. Please try again.'
    return 'Something went wrong. Please try again.'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-6">
          <MapPin className="h-6 w-6" /> FindIt
        </Link>

        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {isRegister ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          {isRegister ? 'Start finding lost items' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ujjwal Gupta"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isRegister ? 'Minimum 6 characters' : 'Your password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {!isRegister && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-600 text-sm">{getErrorMessage()}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending
              ? (isRegister ? 'Creating account...' : 'Signing in...')
              : (isRegister ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={switchMode} className="text-blue-600 font-medium hover:underline">
            {isRegister ? 'Sign in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}