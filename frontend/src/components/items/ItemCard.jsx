import { Link } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'
import Badge from '../ui/Badge'
import { STATUS_COLORS, formatDate } from '../../utils/helpers'

export default function ItemCard({ item }) {
  const isLost = item.type === 'LOST'
  return (
    <Link to={`/items/${item.id}`} className="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all">
      <div className="relative aspect-video bg-slate-100">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-md ${isLost ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {isLost ? 'LOST' : 'FOUND'}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h3>
          <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(item.dateOccurred)}</span>
        </div>
      </div>
    </Link>
  )
}
