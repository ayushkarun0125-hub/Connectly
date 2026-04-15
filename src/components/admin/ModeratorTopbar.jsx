import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home, LogOut } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { useAuth } from '@/contexts/useAuth'
import { cn } from '@/lib/utils'

const titles = {
  '/app/moderator': 'Overview',
  '/app/moderator/users': 'Users',
  '/app/moderator/rooms': 'Rooms',
  '/app/moderator/moderation': 'Moderation',
  '/app/moderator/files': 'Files',
}

export function ModeratorTopbar({ environment = 'development' }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const title = titles[pathname] || 'Moderator'

  return (
    <header className="sticky top-0 z-30 flex h-[3.25rem] shrink-0 items-center justify-between gap-3 border-b border-white/[0.1] bg-[#060b14]/88 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Link
          to="/app/moderator"
          className="shrink-0 text-[#38BDF8]/85 transition hover:text-[#38BDF8]"
        >
          Moderator
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
        <span className="truncate font-semibold text-white">{title}</span>
      </div>
      <div className="flex items-center gap-2 md:gap-2.5">
        <Link
          to="/"
          className="hidden items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-[#38BDF8]/25 hover:bg-white/[0.06] hover:text-[#38BDF8] sm:inline-flex"
          title="Back to marketing site"
        >
          <Home className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden md:inline">Home</span>
        </Link>
        <StatusBadge variant={environment === 'production' ? 'danger' : 'info'}>
          {environment}
        </StatusBadge>
        <span className="hidden text-xs text-slate-500 sm:inline">{user?.email}</span>
        <span className="rounded-lg bg-gradient-to-br from-[#38BDF8]/14 to-[#1D4ED8]/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100/95 ring-1 ring-white/[0.1]">
          {user?.role}
        </span>
        <button
          type="button"
          onClick={logout}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-100',
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
