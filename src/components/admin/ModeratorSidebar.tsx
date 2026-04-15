import { NavLink } from 'react-router-dom'
import { FolderOpen, LayoutDashboard, Radio, Shield, Users } from 'lucide-react'
import { cn } from '@/lib/cn'

const items = [
  { to: '/app/moderator', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/moderator/users', label: 'Users', icon: Users },
  { to: '/app/moderator/rooms', label: 'Rooms', icon: Radio },
  { to: '/app/moderator/moderation', label: 'Moderation', icon: Shield },
  { to: '/app/moderator/files', label: 'Files', icon: FolderOpen },
]

export function ModeratorSidebar() {
  return (
    <aside
      className={cn(
        'relative z-[2] flex w-[260px] shrink-0 flex-col border-r border-white/[0.08]',
        'bg-[#05080f]/85 backdrop-blur-xl backdrop-saturate-150',
        'shadow-[4px_0_48px_-28px_rgba(0,0,0,0.65)]',
      )}
    >
      <div className="border-b border-white/[0.07] px-5 py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38BDF8]/90">Connectly</p>
        <p className="mt-1 text-lg font-bold tracking-tight text-white">Moderator</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">Member safety & room oversight</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto connectly-scroll p-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'translate-x-0 bg-gradient-to-r from-[#38BDF8]/18 via-[#1D4ED8]/14 to-transparent text-white shadow-[0_0_32px_-10px_rgba(56,189,248,0.35),inset_0_0_0_1px_rgba(56,189,248,0.18)]'
                  : 'text-slate-400 hover:translate-x-1 hover:bg-white/[0.04] hover:text-slate-100',
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
