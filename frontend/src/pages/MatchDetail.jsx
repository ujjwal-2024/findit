import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react'
import { getMatch } from '../api/matches'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils/helpers'

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  if (error || !match) return (
    <div className="text-center py-20 px-4">
      <p className="text-slate-400 text-lg">Match not found</p>
      <button onClick={() => navigate('/matches')} className="text-blue-600 mt-4 text-sm">
        ← Back to matches
      </button>
    </div>
  )

  const score = Math.round(match.score)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 sm:mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Match score banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 sm:p-6 mb-5 sm:mb-6 text-center">
        <CheckCircle className="h-9 w-9 sm:h-10 sm:w-10 text-green-500 mx-auto mb-2" />
        <p className="text-2xl sm:text-3xl font-bold text-green-600">{score}% Match</p>
        <p className="text-green-700 text-sm mt-1">
          AI Confidence: {match.score >= 85 ? 'High' : match.score >= 70 ? 'Medium' : 'Low'}
        </p>
      </div>

      {/* AI Reasoning */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
        <h2 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">AI Analysis</h2>
        <p className="text-slate-600 text-sm">{match.aiReasoning}</p>
      </div>

      {/* Side by side items - stacks on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Lost item */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="relative">
            <img src={match.lostItem.imageUrl} alt={match.lostItem.title} className="w-full h-44 sm:h-48 object-cover" />
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">LOST</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 text-sm">{match.lostItem.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{match.lostItem.description}</p>
            <p className="text-xs text-slate-400 mt-2">📍 {match.lostItem.location}</p>
            <p className="text-xs text-slate-400">👤 {match.lostItem.user?.name}</p>
            <a
              href={`mailto:${match.lostItem.user?.email}?subject=${encodeURIComponent('FindIt Match: ' + match.lostItem.title)}`}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
            >
              <Mail className="h-3 w-3" /> Email {match.lostItem.user?.name}
            </a>
          </div>
        </div>

        {/* Found item */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="relative">
            <img src={match.foundItem.imageUrl} alt={match.foundItem.title} className="w-full h-44 sm:h-48 object-cover" />
            <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">FOUND</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 text-sm">{match.foundItem.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{match.foundItem.description}</p>
            <p className="text-xs text-slate-400 mt-2">📍 {match.foundItem.location}</p>
            <p className="text-xs text-slate-400">👤 {match.foundItem.user?.name}</p>
            <a
              href={`mailto:${match.foundItem.user?.email}?subject=${encodeURIComponent('FindIt Match: ' + match.foundItem.title)}`}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
            >
              <Mail className="h-3 w-3" /> Email {match.foundItem.user?.name}
            </a>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6 px-4">
        Match detected on {formatDate(match.createdAt)} — contact the other person to arrange return
      </p>
    </div>
  )
}
