import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'
import type { DashboardActivityItem } from '@/components/ui/dashboard-activity-types'

const typeTone: Record<string, string> = {
  auth: 'border-dashboard-purple/35 bg-dashboard-purple/12 text-violet-100 shadow-[0_0_14px_-4px_var(--dashboard-glow-purple)]',
  admin: 'border-dashboard-cyan/35 bg-dashboard-cyan/10 text-cyan-50 shadow-[0_0_14px_-4px_var(--dashboard-glow-cyan)]',
  moderation: 'border-dashboard-amber/40 bg-dashboard-amber/12 text-amber-50 shadow-[0_0_14px_-4px_var(--dashboard-glow-amber)]',
  files: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  room: 'border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-100',
  message: 'border-slate-500/25 bg-slate-500/10 text-slate-200',
  system: 'border-dashboard-success/30 bg-dashboard-success/10 text-emerald-100 shadow-[0_0_12px_-4px_var(--dashboard-glow-success)]',
}

function normalizeType(raw?: string): string {
  const t = (raw || 'system').toLowerCase()
  if (t.includes('auth')) return 'auth'
  if (t.includes('admin')) return 'admin'
  if (t.includes('mod')) return 'moderation'
  if (t.includes('file')) return 'files'
  if (t.includes('room')) return 'room'
  if (t.includes('message')) return 'message'
  return 'system'
}

function formatBadge(type: string) {
  const u = type.toUpperCase()
  if (u === 'AUTH') return 'AUTH'
  if (u === 'ADMIN') return 'ADMIN'
  if (u === 'MODERATION') return 'MODERATION'
  if (u === 'FILES') return 'FILES'
  if (u === 'ROOM') return 'ROOM'
  if (u === 'MESSAGE') return 'MESSAGE'
  return 'SYSTEM'
}

export type ActivityItemProps = {
  item: DashboardActivityItem
}

export function ActivityItem({ item }: ActivityItemProps) {
  const key = normalizeType(item.type)
  const badgeClass = typeTone[key] || typeTone.system
  const badge = formatBadge(key)

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: -6 },
        show: { opacity: 1, x: 0, transition: { ease: dashboardEase } },
      }}
      whileHover={{ x: 3 }}
      className="relative flex gap-3 pl-1"
    >
      <span className="relative z-10 mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-dashboard-cyan to-dashboard-purple shadow-[0_0_14px_var(--dashboard-glow-cyan)] ring-2 ring-[#0a0e14]/90" />
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3.5 py-3',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]',
          'transition-colors hover:border-dashboard-cyan/20 hover:bg-white/[0.055]',
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              badgeClass,
            )}
          >
            {badge}
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            {item.at ? new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.message}</p>
      </motion.div>
    </motion.li>
  )
}
