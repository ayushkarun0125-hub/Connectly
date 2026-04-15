import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'
import type { DashboardActivityItem } from '@/components/ui/dashboard-activity-types'

const typeTone: Record<string, string> = {
  auth: 'border-[#1D4ED8]/35 bg-[#1D4ED8]/12 text-sky-100 shadow-[0_0_14px_-4px_rgba(29,78,216,0.35)]',
  admin: 'border-[#38BDF8]/35 bg-[#38BDF8]/10 text-sky-50 shadow-[0_0_14px_-4px_rgba(56,189,248,0.3)]',
  moderation: 'border-amber-400/35 bg-amber-500/12 text-amber-50 shadow-[0_0_14px_-4px_rgba(245,158,11,0.25)]',
  files: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  room: 'border-[#1D4ED8]/25 bg-[#0A1A3A]/40 text-sky-100',
  message: 'border-slate-500/25 bg-slate-500/10 text-slate-200',
  system: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100 shadow-[0_0_12px_-4px_rgba(34,197,94,0.25)]',
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
      className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-3.5"
    >
      <div className="relative flex justify-center pt-2">
        <span
          className="relative z-10 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] shadow-[0_0_12px_rgba(56,189,248,0.55)] ring-2 ring-[#050a12]"
          aria-hidden
        />
      </div>
      <motion.div
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'min-w-0 rounded-xl border border-white/[0.08] bg-[#060b14]/65 px-3.5 py-3',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]',
          'backdrop-blur-sm transition-colors',
          'hover:border-[#38BDF8]/18 hover:bg-[#070d18]/75',
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
          <span className="font-mono text-[10px] tabular-nums text-slate-500">
            {item.at ? new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.message}</p>
      </motion.div>
    </motion.li>
  )
}
