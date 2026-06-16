import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMatches } from '../api/matches'
import Spinner from '../components/ui/Spinner'
import { scoreColor, formatDate } from '../utils/helpers'

export default function Matches() {
  const { data: matches, isLoading } = useQuery({ queryKey: ['matches'], queryFn: getMatches })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Matches</h1>
      <p className="text-slate-500 text-sm mb-8">Items the AI has matched against your posts.</p>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : matches?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-400 text-lg">No matches yet</p>
          <p className="text-slate-400 text-sm mt-1">Post an item and the AI will search automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches?.map(match => (
            <Link key={match.id} to={`/matches/${match.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4">
                <img src={match.lostItem.imageUrl} alt="lost" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">LOST</span>
                    <span className="text-sm font-medium text-slate-900 truncate">{match.lostItem.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">FOUND</span>
                    <span className="text-sm text-slate-600 truncate">{match.foundItem.title}</span>
                  </div>
                </div>
                <img src={match.foundItem.imageUrl} alt="found" className="h-16 w-16 rounded-lg object-cover" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">{formatDate(match.createdAt)}</p>
                <span className={`text-lg font-bold ${scoreColor(match.score)}`}>{Math.round(match.score)}% match</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{match.aiReasoning}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
