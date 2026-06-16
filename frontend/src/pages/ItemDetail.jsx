import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Calendar, User, Trash2, ArrowLeft } from 'lucide-react'
import { getItem, updateItemStatus, deleteItem } from '../api/items'
import { useAuth } from '../hooks/useAuth'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { STATUS_COLORS, CATEGORIES, formatDate } from '../utils/helpers'

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => getItem(id)
  })

  const statusMutation = useMutation({
    mutationFn: (status) => updateItemStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => navigate('/items'),
  })

  if (isLoading) return (
    <div className="flex justify-center py-20"><Spinner /></div>
  )

  if (error || !item) return (
    <div className="text-center py-20 px-4">
      <p className="text-slate-400 text-lg">Item not found</p>
      <button onClick={() => navigate('/items')} className="text-blue-600 mt-4 text-sm">
        ← Back to items
      </button>
    </div>
  )

  const isOwner = user?.id === item.userId
  const isLost = item.type === 'LOST'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 sm:mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="relative">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-56 sm:h-72 md:max-h-96 object-cover"
            onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image' }}
          />
          <span className={`absolute top-3 sm:top-4 left-3 sm:left-4 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isLost ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {isLost ? 'LOST' : 'FOUND'}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{item.title}</h1>
            <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>
          </div>

          <p className="text-slate-600 mt-3 text-sm sm:text-base">{item.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-5 sm:mt-6 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4 shrink-0" />{item.location}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4 shrink-0" />{formatDate(item.dateOccurred)}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <User className="h-4 w-4 shrink-0" />{item.user?.name || 'Unknown'}
            </div>
            <div className="text-slate-500">
              Category: {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
            </div>
          </div>

          {isOwner && (
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100 flex flex-wrap gap-2 sm:gap-3">
              <span className="text-sm font-medium text-slate-600 self-center w-full sm:w-auto">Update status:</span>
              {['ACTIVE', 'RETURNED', 'CLOSED'].map(s => (
                <Button key={s} size="sm"
                  variant={item.status === s ? 'primary' : 'secondary'}
                  onClick={() => statusMutation.mutate(s)}>
                  {s}
                </Button>
              ))}
              <Button size="sm" variant="danger" className="sm:ml-auto"
                onClick={() => { if (confirm('Delete this item?')) deleteMutation.mutate() }}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
