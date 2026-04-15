import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, LogOut } from 'lucide-react'
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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-violet-500/10 bg-[#080c14]/90 px-6 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Link to="/app/moderator" className="text-violet-300/80 hover:text-violet-200">
          Moderator
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
        <span className="truncate font-semibold text-white">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge variant={environment === 'production' ? 'danger' : 'info'}>
          {environment}
        </StatusBadge>
        <span className="hidden text-xs text-slate-500 sm:inline">{user?.email}</span>
        <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-[11px] font-semibold uppercase text-violet-300/90">
          {user?.role}
        </span>
        <button
          type="button"
          onClick={logout}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5',
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </header>
  )
}
