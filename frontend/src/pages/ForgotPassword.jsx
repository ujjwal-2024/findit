import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import Button from '../components/ui/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // 'sent' | 'error'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setError('Please enter your email')
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email })
      setStatus('sent')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-6">
          <MapPin className="h-6 w-6" /> FindIt
        </Link>

        {status === 'sent' ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
            <p className="text-slate-500 text-sm mb-6">
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
            </p>
            <Link to="/login" className="text-blue-600 text-sm hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Forgot password?</h1>
            <p className="text-slate-500 text-sm mb-6">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}