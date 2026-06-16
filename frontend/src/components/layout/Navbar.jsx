import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Bell, User, LogOut, Search, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); setOpen(false); navigate('/') }
  const close = () => setOpen(false)

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600" onClick={close}>
          <MapPin className="h-6 w-6" />
          FindIt
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/items" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100">
            <Search className="h-4 w-4" /> Browse
          </Link>
          {user ? (
            <>
              <Link to="/report/lost" className="bg-red-50 text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-100">
                Lost Item
              </Link>
              <Link to="/report/found" className="bg-green-50 text-green-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-100">
                Found Item
              </Link>
              <Link to="/matches" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                <Bell className="h-5 w-5" />
              </Link>
              <Link to="/profile" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 space-y-1 bg-white">
          <Link to="/items" onClick={close} className="flex items-center gap-2 text-sm text-slate-700 px-3 py-2.5 rounded-lg hover:bg-slate-100">
            <Search className="h-4 w-4" /> Browse Items
          </Link>
          {user ? (
            <>
              <Link to="/report/lost" onClick={close} className="flex items-center gap-2 text-sm text-red-700 px-3 py-2.5 rounded-lg hover:bg-red-50">
                Report Lost Item
              </Link>
              <Link to="/report/found" onClick={close} className="flex items-center gap-2 text-sm text-green-700 px-3 py-2.5 rounded-lg hover:bg-green-50">
                Report Found Item
              </Link>
              <Link to="/matches" onClick={close} className="flex items-center gap-2 text-sm text-slate-700 px-3 py-2.5 rounded-lg hover:bg-slate-100">
                <Bell className="h-4 w-4" /> My Matches
              </Link>
              <Link to="/profile" onClick={close} className="flex items-center gap-2 text-sm text-slate-700 px-3 py-2.5 rounded-lg hover:bg-slate-100">
                <User className="h-4 w-4" /> Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-50 w-full text-left">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={close} className="block bg-blue-600 text-white text-sm font-medium px-3 py-2.5 rounded-lg text-center">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
