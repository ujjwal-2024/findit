import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import api from '../api/client'
import Button from '../components/ui/Button'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/reset-password', { token, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-slate-500">Invalid reset link.</p>
        <Link to="/login" className="text-blue-600 text-sm mt-2 block hover:underline">Back to login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-6">
          <MapPin className="h-6 w-6" /> FindIt
        </Link>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Password reset!</h2>
            <p className="text-slate-500 text-sm">Redirecting you to login in a moment...</p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Set new password</h1>
            <p className="text-slate-500 text-sm mb-6">Choose a new password for your account.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}