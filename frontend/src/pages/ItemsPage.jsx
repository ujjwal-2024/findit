import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Clock, Filter } from 'lucide-react'
import api from '../lib/api.js'

const CATEGORIES = ['all', 'electronics', 'clothing', 'documents', 'pets', 'jewellery', 'bags', 'keys', 'other']

function ItemCard({ item }) {
  const typeColor = item.type === 'lost' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
  return (
    <Link to={`/items/${item.id}`} className="card hover:shadow-md transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`badge absolute top-2 left-2 ${typeColor} capitalize font-semibold`}>{item.type}</span>
        <span className="badge absolute top-2 right-2 bg-white/90 text-gray-600 capitalize">{item.category}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={11} />{item.location}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}

export default function ItemsPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['items', type, category, search, page],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 12 })
      if (type !== 'all') params.set('type', type)
      if (category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      return api.get(`/api/items?${params}`).then((r) => r.data)
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse items</h1>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, description, or location..."
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'lost', 'found'].map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? 'All types' : t}
            </button>
          ))}
          <span className="w-px bg-gray-200 mx-1" />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${
                category === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c === 'all' ? 'All categories' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.items?.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">{data.total} items found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${
                    page === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500">No items found. Try adjusting your filters.</p>
          <Link to="/report" className="btn-primary inline-flex mt-4">Report an item</Link>
        </div>
      )}
    </div>
  )
}
