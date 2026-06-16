import { Link } from 'react-router-dom'
import { Search, Upload, Bell, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getItems } from '../api/items'
import ItemCard from '../components/items/ItemCard'
import Spinner from '../components/ui/Spinner'

export default function Home() {
  const { data, isLoading } = useQuery({ queryKey: ['items-recent'], queryFn: () => getItems({ limit: 6 }) })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Lost something? Found something?
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-6 sm:mb-8">
            Upload a photo and our AI matches lost & found items automatically — then notifies both parties instantly.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link to="/report/lost" className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base">
              <Upload className="h-5 w-5" /> I Lost Something
            </Link>
            <Link to="/report/found" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base">
              <Upload className="h-5 w-5" /> I Found Something
            </Link>
            <Link to="/items" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-5 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base">
              <Search className="h-5 w-5" /> Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 mb-8 sm:mb-10">How FindIt works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Upload, title: 'Upload a photo', desc: 'Post your lost or found item with a clear photo and description.', color: 'bg-blue-100 text-blue-600' },
              { icon: Search, title: 'AI matches it', desc: 'Our AI compares your image against all items and scores similarity.', color: 'bg-purple-100 text-purple-600' },
              { icon: Bell, title: 'Get notified', desc: 'If a match is found (70%+ score), both parties get an email instantly.', color: 'bg-green-100 text-green-600' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center">
                <div className={`inline-flex p-4 rounded-2xl mb-4 ${color}`}><Icon className="h-7 w-7 sm:h-8 sm:w-8" /></div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent items */}
      <section className="py-12 sm:py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Recent Items</h2>
            <Link to="/items" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {data?.items?.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
