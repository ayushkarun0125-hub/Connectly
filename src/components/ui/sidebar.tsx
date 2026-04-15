import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  Radio,
  ScrollText,
  Server,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export type AdminNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
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

export type AdminDashboardSidebarProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  showExitToWorkspace: boolean
}

export function AdminDashboardSidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
  showExitToWorkspace,
}: AdminDashboardSidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 72 : 260,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col border-r border-white/[0.09] bg-[#05080f]/92 backdrop-blur-2xl lg:static',
          'shadow-[4px_0_48px_-20px_rgba(0,0,0,0.85)]',
          !mobileOpen && 'max-lg:hidden',
        )}
      >
        <div
          className={cn(
            'border-b border-white/[0.1] px-4 py-5 transition-all',
            collapsed ? 'px-2.5 py-4' : 'px-4',
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#38BDF8]/90">Connectly</p>
          {!collapsed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5">
              <p className="text-lg font-bold tracking-tight text-white">Control Plane</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Internal operations</p>
            </motion.div>
          ) : (
            <div className="mt-3 flex justify-center">
              <span
                className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#38BDF8]/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                title="Control Plane"
              >
                CP
              </span>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2.5">
          {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => onMobileOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200',
                  'border border-white/[0.06] bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
                  'hover:translate-x-0.5 hover:border-white/[0.12] hover:bg-white/[0.06]',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'border-[#38BDF8]/35 bg-gradient-to-r from-[#38BDF8]/20 via-[#1D4ED8]/12 to-white/[0.02] text-white shadow-[0_0_28px_-12px_rgba(56,189,248,0.4)] ring-1 ring-[#38BDF8]/28'
                    : 'text-slate-400 hover:text-slate-100',
                )
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition group-hover:scale-105',
                      isActive ? 'text-[#38BDF8]' : 'text-slate-500 group-hover:text-slate-300',
                    )}
                    strokeWidth={1.75}
                  />
                  {!collapsed ? <span className="truncate">{label}</span> : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-2.5">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              'mb-2 hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-slate-400 transition hover:border-cyan-500/25 hover:bg-white/[0.07] hover:text-slate-200 lg:flex',
              collapsed ? 'px-2' : 'px-3',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>

          {showExitToWorkspace ? (
            <NavLink
              to="/app"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                'block rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-center text-xs font-medium text-slate-300 transition hover:border-white/18 hover:bg-white/[0.08]',
                collapsed ? 'px-1 text-[10px] leading-tight' : 'text-sm',
              )}
              title={collapsed ? 'Workspace' : undefined}
            >
              {collapsed ? 'WS' : 'Exit to workspace'}
            </NavLink>
          ) : null}
        </div>
      </motion.aside>
    </>
  )
}
