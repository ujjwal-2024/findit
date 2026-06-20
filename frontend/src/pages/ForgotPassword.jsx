import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import Button from '../components/ui/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [resetUrl, setResetUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setError('Please enter your email')
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/forgot-password', { email })
      setResetUrl(res.data.resetUrl)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
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

        {resetUrl ? (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Reset your password</h2>
            <p className="text-slate-500 text-sm mb-4">
              Click the link below to reset your password. This link expires in 1 hour.
            </p>
            
             <a href={resetUrl}
              className="block w-full bg-blue-600 text-white text-center font-medium px-4 py-3 rounded-lg hover:bg-blue-700 text-sm"
            >
              Reset My Password →
            </a>
            <p className="text-center text-xs text-slate-400 mt-4">
              Copy this link if the button doesn't work:<br />
              <span className="break-all text-blue-600">{resetUrl}</span>
            </p>
            <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-900 mt-6">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Forgot password?</h1>
            <p className="text-slate-500 text-sm mb-6">
              Enter your email and we'll generate a reset link for you.
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
                {loading ? 'Generating link...' : 'Get Reset Link'}
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