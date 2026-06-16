import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { getItems } from '../api/items'
import ItemCard from '../components/items/ItemCard'
import Spinner from '../components/ui/Spinner'
import { CATEGORIES } from '../utils/helpers'

export default function Items() {
  const [filters, setFilters] = useState({ type: '', category: '', search: '' })
  const { data, isLoading } = useQuery({
    queryKey: ['items', filters],
    queryFn: () => getItems({ ...filters }),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5 sm:mb-6">Browse Lost & Found Items</h1>

      {/* Filters - stack on mobile */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 sm:border-0 sm:px-0 sm:py-0">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text" placeholder="Search items..."
            className="flex-1 text-sm outline-none w-full"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 sm:py-1.5 w-full sm:w-auto"
          value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 sm:py-1.5 w-full sm:w-auto"
          value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : data?.items?.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No items found. Try adjusting your filters.</div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{data?.total} items found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {data?.items?.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </>
      )}
    </div>
  )
}
