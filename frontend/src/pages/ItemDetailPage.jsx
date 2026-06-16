// ItemDetailPage.jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Calendar, User, ArrowLeft } from 'lucide-react'
import api from '../lib/api.js'

export default function ItemDetailPage() {
  const { id } = useParams()
  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => api.get(`/api/items/${id}`).then((r) => r.data),
  })

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-gray-200 rounded-xl"/><div className="h-6 bg-gray-200 rounded w-1/2"/></div>
  if (!item) return <div className="text-center py-16 text-gray-500">Item not found</div>

  const typeColor = item.type === 'lost' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
  const allMatches = [...(item.lostMatches || []), ...(item.foundMatches || [])]

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/items" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={14} /> Back to items
      </Link>

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <img src={item.imageUrl} alt={item.title} className="w-full rounded-xl object-cover aspect-square" />
        </div>
        <div>
          <span className={`badge ${typeColor} capitalize font-semibold mb-3 inline-block`}>{item.type}</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
          <p className="text-gray-600 mb-4">{item.description}</p>

          <div className="space-y-2 text-sm text-gray-500">
            <p className="flex items-center gap-2"><MapPin size={14} /> {item.location}</p>
            <p className="flex items-center gap-2"><Calendar size={14} /> {new Date(item.dateOccurred).toLocaleDateString()}</p>
            <p className="flex items-center gap-2"><User size={14} /> Posted by {item.user?.name}</p>
          </div>

          <div className="mt-4">
            <span className={`badge capitalize ${
              item.status === 'active' ? 'bg-blue-50 text-blue-700' :
              item.status === 'returned' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>{item.status}</span>
          </div>
        </div>
      </div>

      {allMatches.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">AI Matches ({allMatches.length})</h2>
          <div className="space-y-4">
            {allMatches.map((match) => {
              const other = match.foundItem || match.lostItem
              const score = Math.round((match.score || 0) * 100)
              return (
                <div key={match.id} className="card p-4 flex gap-4">
                  <img src={other?.imageUrl} alt={other?.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 truncate">{other?.title}</span>
                      <span className={`badge shrink-0 ${score >= 80 ? 'bg-green-50 text-green-700' : score >= 60 ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {score}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{match.aiReasoning}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
