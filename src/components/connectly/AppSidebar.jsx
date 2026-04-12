import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  LayoutGrid,
  FolderOpen,
  StickyNote,
  Users,
  Settings,
  Shield,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { isChatShellActive } from './navUtils'

const navSections = [
  {
    label: 'Workspace',
    items: [
      { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true, match: null },
      { to: '/app/rooms/room_design', label: 'Chats', icon: MessageSquare, end: false, match: 'chats' },
      { to: '/app/room-directory', label: 'Rooms', icon: LayoutGrid, end: true, match: null },
      { to: '/app/files', label: 'Files', icon: FolderOpen, end: true, match: null },
      { to: '/app/notes', label: 'Notes', icon: StickyNote, end: true, match: null },
    ],
  },
  {
    label: 'People',
    items: [{ to: '/app/team', label: 'Team', icon: Users, end: true, match: null }],
  },
  {
    label: 'Preferences',
    items: [{ to: '/app/settings', label: 'Settings', icon: Settings, end: true, match: null }],
  },
]

const base =
  'group flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200'
const active = `${base} bg-blue-500/15 text-blue-700 shadow-[0_0_24px_-6px_rgba(59,130,246,0.45)] ring-1 ring-blue-400/30 dark:text-blue-100 dark:shadow-[0_0_24px_-6px_rgba(59,130,246,0.55)] dark:ring-blue-400/25`
const idle = `${base} text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-200`

function AppSidebar({ adminRole = false }) {
  const { pathname } = useLocation()

  function linkClass(item) {
    if (item.match === 'chats') {
      const on = isChatShellActive(pathname)
      return cn(on ? active : idle)
    }
    return ({ isActive }) => cn(isActive ? active : idle)
  }

  return (
    <aside className="sticky top-0 flex max-h-screen w-[228px] shrink-0 flex-col self-start overflow-y-auto connectly-scroll border-r border-slate-200/80 bg-white dark:border-white/[0.08] dark:bg-transparent px-3 py-5">
      <Link
        to="/app"
        className="mb-8 shrink-0 px-2 text-lg font-bold tracking-tight text-slate-900 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-100"
      >
        Connectly
      </Link>
      <nav className="flex flex-1 flex-col gap-7">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    {item.match === 'chats' ? (
                      <NavLink to={item.to} className={linkClass(item)}>
                        <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </NavLink>
                    ) : (
                      <NavLink to={item.to} end={item.end} className={linkClass(item)}>
                        <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </NavLink>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        {adminRole ? (
          <div>
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
              Admin
            </p>
            <NavLink to="/app/admin" className={({ isActive }) => cn(isActive ? active : idle)}>
              <Shield className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
              <span>Admin</span>
            </NavLink>
          </div>
        ) : null}
      </nav>
    </aside>
  )
}

export default AppSidebar
