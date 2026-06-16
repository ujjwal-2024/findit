import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, User, Plus, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api.js'

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications').then((r) => r.data),
    refetchInterval: 60_000,
  })
  const unread = data?.filter((n) => !n.read).length || 0
  return (
    <Link to="/matches" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <Bell size={20} className="text-gray-600" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/items', label: 'Browse Items' },
    { href: '/items?type=lost', label: 'Lost' },
    { href: '/items?type=found', label: 'Found' },
  ]

  const isActive = (href) => location.pathname === href.split('?')[0]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-black">
              Fi
            </div>
            FindIt
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/report"
                  className="hidden sm:flex btn-primary items-center gap-1.5 text-sm"
                >
                  <Plus size={16} /> Report Item
                </Link>
                <NotificationBell />
                <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <User size={20} className="text-gray-600" />
                </Link>
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut size={20} className="text-gray-500" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm hidden sm:block">Sign in</Link>
                <Link to="/login" className="btn-primary text-sm">Get started</Link>
              </>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/report"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-blue-600 font-medium"
              >
                + Report Item
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          FindIt — AI-Powered Lost & Found  ·  Built with React, Node.js & Claude Vision
        </div>
      </footer>
    </div>
  )
}
