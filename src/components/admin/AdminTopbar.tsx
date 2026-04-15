import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Home, LogOut, Menu, PanelLeft } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { useAuth } from '@/contexts/useAuth'
import { cn } from '@/lib/cn'

const titles: Record<string, string> = {
  '/app/admin': 'Overview',
  '/app/admin/system': 'System Status',
  '/app/admin/users': 'Users',
  '/app/admin/rooms': 'Rooms',
  '/app/admin/moderation': 'Moderation',
  '/app/admin/files': 'Files',
  '/app/admin/analytics': 'Analytics',
  '/app/admin/logs': 'Logs',
  '/app/admin/roles': 'Roles & Permissions',
  '/app/admin/settings': 'Settings',
}

export type AdminTopbarProps = {
  environment?: string
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
  onSidebarExpand?: () => void
}

export function AdminTopbar({
  environment = 'development',
  onMenuClick,
  sidebarCollapsed,
  onSidebarExpand,
}: AdminTopbarProps) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const title = titles[pathname] || 'Admin'

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-2 z-30 mx-3 flex h-[3.25rem] shrink-0 items-center justify-between gap-3 rounded-xl border border-white/[0.1] px-3 shadow-[0_8px_36px_-14px_rgba(0,0,0,0.82)] backdrop-blur-xl md:mx-5 md:gap-4 md:px-4',
        'bg-[#060b14]/82',
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-500/25 hover:bg-white/[0.07] hover:text-white lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        {sidebarCollapsed ? (
          <button
            type="button"
            className="hidden h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-500/25 hover:text-white lg:grid"
            aria-label="Expand sidebar"
            onClick={onSidebarExpand}
          >
            <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        ) : null}
        <Link to="/app/admin" className="hidden text-slate-500 transition hover:text-cyan-300/90 sm:block">
          Admin
        </Link>
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-600 sm:block" />
        <span className="truncate font-semibold text-white">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2.5">
        <Link
          to="/"
          className="hidden items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-[#38BDF8]/25 hover:bg-white/[0.06] hover:text-[#38BDF8] sm:inline-flex"
          title="Back to marketing site"
        >
          <Home className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden md:inline">Home</span>
        </Link>
        <StatusBadge variant={environment === 'production' ? 'danger' : 'info'}>{environment}</StatusBadge>
        <span className="hidden text-xs text-slate-500 md:inline">{user?.email}</span>
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
    </motion.header>
  )
}
