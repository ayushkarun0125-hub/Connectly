import { NavLink } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  FileStack,
  FolderOpen,
  LayoutDashboard,
  ScrollText,
  Server,
  Settings,
  Shield,
  Users,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/app/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/admin/system', label: 'System Status', icon: Server },
  { to: '/app/admin/users', label: 'Users', icon: Users },
  { to: '/app/admin/rooms', label: 'Rooms', icon: Radio },
  { to: '/app/admin/moderation', label: 'Moderation', icon: Shield },
  { to: '/app/admin/files', label: 'Files', icon: FolderOpen },
  { to: '/app/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/admin/logs', label: 'Logs', icon: ScrollText },
  { to: '/app/admin/roles', label: 'Roles & Permissions', icon: Activity },
  { to: '/app/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#060910]">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400/90">Connectly</p>
        <p className="mt-1 text-lg font-bold tracking-tight text-white">Control Plane</p>
        <p className="mt-1 text-xs text-slate-500">Internal operations console</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-sky-500/15 text-sky-100 shadow-[0_0_20px_-8px_rgba(56,189,248,0.5)] ring-1 ring-sky-500/25'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <NavLink
          to="/app"
          className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-sm font-medium text-slate-300 hover:bg-white/10"
        >
          Exit to workspace
        </NavLink>
      </div>
    </aside>
  )
}
