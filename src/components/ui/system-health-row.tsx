import { motion } from 'framer-motion'
import { Database, Radio, Server } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'

export type HealthServiceStatus = 'operational' | 'degraded' | 'offline'

export type HealthServiceRow = {
  id: string
  label: string
  description: string
  status: HealthServiceStatus
  icon?: 'api' | 'socket' | 'db'
  pulse?: boolean
}

const iconMap = {
  api: Server,
  socket: Radio,
  db: Database,
}

const statusStyles: Record<HealthServiceStatus, string> = {
  operational:
    'border-dashboard-success/40 bg-dashboard-success/10 text-emerald-100 shadow-[0_0_22px_-6px_var(--dashboard-glow-success)]',
  degraded:
    'border-dashboard-amber/40 bg-dashboard-amber/12 text-amber-100 shadow-[0_0_22px_-8px_var(--dashboard-glow-amber)]',
  offline: 'border-rose-500/35 bg-rose-500/10 text-rose-200 shadow-[0_0_22px_-8px_rgba(251,113,133,0.35)]',
}

export type SystemHealthRowProps = {
  row: HealthServiceRow
  index: number
}

export function SystemHealthRow({ row, index }: SystemHealthRowProps) {
  const Icon = row.icon ? iconMap[row.icon] : Server
  const label =
    row.status === 'operational' ? 'Live' : row.status === 'degraded' ? 'Degraded' : 'Down'

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 * index, ease: dashboardEase }}
      className={cn(
        'group flex items-center justify-between gap-4 px-3 py-4 transition-colors duration-200',
        'border-b border-white/[0.06] last:border-b-0',
        'hover:bg-white/[0.035]',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <motion.span
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-dashboard-cyan/85 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          whileHover={{ scale: 1.02, rotate: 1.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        >
          <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.75} />
        </motion.span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">{row.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{row.description}</p>
        </div>
      </div>
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide',
          statusStyles[row.status],
        )}
      >
        {row.pulse && row.status === 'operational' ? (
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dashboard-success opacity-45"
              style={{ boxShadow: '0 0 10px var(--dashboard-glow-success)' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-dashboard-success shadow-[0_0_12px_var(--dashboard-glow-success)]" />
          </span>
        ) : null}
        <span>{label}</span>
      </span>
    </motion.li>
  )
}
