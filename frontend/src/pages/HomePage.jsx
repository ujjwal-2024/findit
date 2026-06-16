import { Link } from 'react-router-dom'
import { Search, Upload, Bell, ArrowRight, MapPin, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api.js'

function ItemCard({ item }) {
  const typeColor = item.type === 'lost'
    ? 'bg-red-50 text-red-700'
    : 'bg-green-50 text-green-700'

  return (
    <Link to={`/items/${item.id}`} className="card hover:shadow-md transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`badge absolute top-2 left-2 ${typeColor} capitalize font-semibold`}>
          {item.type}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
          <MapPin size={12} /> {item.location}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ['items-recent'],
    queryFn: () => api.get('/api/items?limit=6').then((r) => r.data),
  })

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          ✨ AI-powered matching — find your item faster
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Lost something?<br />
          <span className="text-blue-600">We'll find it.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Upload a photo of what you lost or found. Our AI compares images automatically
          and notifies you the moment a match is detected.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/report" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            <Upload size={18} /> Report an item
          </Link>
          <Link to="/items" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
            <Search size={18} /> Browse all items
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-6 my-12">
        {[
          { icon: Upload, title: 'Upload a photo', desc: 'Take or upload a clear photo of the item — lost or found.' },
          { icon: Search, title: 'AI scans for matches', desc: 'Claude Vision compares your photo against all listings automatically.' },
          { icon: Bell, title: 'Get notified', desc: 'When a match is found, both parties receive an email instantly.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon size={22} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Recent items */}
      {data?.items?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent listings</h2>
            <Link to="/items" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        </div>
      )}
    </div>
  )
}
