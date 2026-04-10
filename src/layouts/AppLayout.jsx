import { Link, NavLink, Outlet } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const nav = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/rooms/room_general', label: 'Chat Room' },
  { to: '/app/rooms/join', label: 'Join room' },
  { to: '/app/files', label: 'Files' },
  { to: '/app/notes', label: 'Notes' },
  { to: '/app/profile', label: 'Profile' },
  { to: '/app/settings', label: 'Settings' },
  { to: '/app/admin', label: 'Admin' },
]

function AppLayout() {
  const { user, isLoaded } = useUser()
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const theme = useAppStore((state) => state.theme)
  const role = user?.publicMetadata?.role ?? 'user'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-800 p-4">
        <Link to="/app" className="mb-6 block text-xl font-bold">Connectly</Link>
        <nav className="space-y-1">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `block rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-slate-900'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur">
          <input className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm" placeholder="Search rooms, users, files..." />
          <Button variant="ghost" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'}</Button>
          {isLoaded && user && (
            <>
              <Badge color={role === 'admin' ? 'rose' : role === 'moderator' ? 'emerald' : 'blue'}>
                {role}
              </Badge>
              <UserButton afterSignOutUrl="/" />
            </>
          )}
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
