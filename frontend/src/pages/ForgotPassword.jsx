import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import api from '../api/client'
import Button from '../components/ui/Button'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=newpassword
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const sendOTP = async (e) => {
    e.preventDefault()
    if (!email) return setError('Please enter your email')
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (e) => {
    e.preventDefault()
    if (!otp) return setError('Please enter the OTP')
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/verify-otp', { email, otp })
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/reset-password', { email, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
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

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {['Email', 'OTP', 'New Password'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-green-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-bold text-slate-900 mb-1">Password reset!</h2>
            <p className="text-slate-500 text-sm">Redirecting to login...</p>
          </div>
        ) : step === 1 ? (
          <>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Forgot password?</h1>
            <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you an OTP.</p>
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)} />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          </>
        ) : step === 2 ? (
          <>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Enter OTP</h1>
            <p className="text-slate-500 text-sm mb-6">We sent a 6-digit OTP to <strong>{email}</strong>. Check your inbox.</p>
            <form onSubmit={verifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">6-digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <button type="button" onClick={() => { setStep(1); setError('') }}
                className="w-full text-sm text-slate-500 hover:text-slate-700">
                ← Back to email
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Set new password</h1>
            <p className="text-slate-500 text-sm mb-6">Choose a strong password for your account.</p>
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input type="password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)} />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}