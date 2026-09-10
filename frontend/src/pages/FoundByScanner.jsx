import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MapPin, Phone, Mail, CheckCircle } from 'lucide-react'
import api from '../api/client'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

export default function FoundByScanner() {
  const { userId } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ finderName: '', finderContact: '', location: '', message: '' })

  const { data: owner, isLoading } = useQuery({
    queryKey: ['owner', userId],
    queryFn: () => api.get(`/api/auth/public-profile/${userId}`).then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/api/auth/notify-owner/${userId}`, data),
    onSuccess: () => setSubmitted(true),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.finderName || !form.finderContact) return
    mutation.mutate(form)
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      {/* FindIt branding */}
      <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-8">
        <MapPin className="h-6 w-6" /> FindIt
      </Link>

      {submitted ? (
        <div className="text-center py-10">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Message sent!</h2>
          <p className="text-slate-500 text-sm">
            {owner?.name} has been notified that you found their item. They will contact you soon.
          </p>
          <Link to="/" className="inline-block mt-6 text-blue-600 text-sm hover:underline">
            Back to FindIt
          </Link>
        </div>
      ) : (
        <>
          {/* Owner info */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {owner?.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-slate-900">You found {owner?.name}'s item!</h2>
            <p className="text-slate-500 text-sm mt-1">Fill in your details below so they can contact you.</p>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
                value={form.finderName}
                onChange={e => setForm(f => ({ ...f, finderName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Phone or Email *</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="So the owner can reach you"
                value={form.finderContact}
                onChange={e => setForm(f => ({ ...f, finderContact: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Where did you find it?</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Location where you found the item"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message (optional)</label>
              <textarea
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any other details..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>

            {mutation.isError && (
              <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending...' : '📬 Notify Owner'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Powered by <Link to="/" className="text-blue-600 hover:underline">FindIt</Link>
          </p>
        </>
      )}
    </div>
  )
}