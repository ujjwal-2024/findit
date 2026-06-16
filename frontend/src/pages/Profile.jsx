import { useQuery } from '@tanstack/react-query'
import { User, Mail, Calendar } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getItems } from '../api/items'
import ItemCard from '../components/items/ItemCard'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils/helpers'

export default function Profile() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['my-items', user?.id],
    queryFn: () => getItems({ userId: user?.id, limit: 50 }),
    enabled: !!user,
  })

  // Filter client-side since backend doesn't filter by userId yet
  const myItems = data?.items?.filter(i => i.userId === user?.id) || []

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-400">
        Please log in to view your profile.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
          {user.name?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <Mail className="h-3.5 w-3.5" /> {user.email}
          </p>
          {user.createdAt && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" /> Joined {formatDate(user.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* My items */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">My Posted Items</h2>
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : myItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
          You haven't posted any items yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myItems.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}