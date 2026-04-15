import { useId, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'

export type StatCardProps = {
  title: string
  value: string
  hint?: string
  icon: LucideIcon
  delay?: number
  trendUp?: string
  trendDown?: string
  sparkline?: number[]
  className?: string
}

function smoothSeries(data: number[]): number[] {
  if (data.length < 3) return data
  return data.map((v, i) => {
    const prev = data[i - 1] ?? v
    const next = data[i + 1] ?? v
    return (prev + v + next) / 3
  })
}

function MiniSparkline({
  data,
  positive,
  gradId,
  strokeGradId,
}: {
  data: number[]
  positive: boolean
  gradId: string
  strokeGradId: string
}) {
  if (data.length < 2) return null
  const w = 72
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const pad = max === min ? 1 : max - min
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / pad) * (h - 4) - 2
    return `${x},${y}`
  })
  const d = `M ${pts.join(' L ')}`
  const strokeColor = positive ? 'var(--color-dashboard-success)' : 'rgb(251,113,133)'
  const fillTop = positive ? 'var(--color-dashboard-success)' : 'rgb(251,113,133)'

  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible opacity-95" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} stopOpacity="0.28" />
          <stop offset="100%" stopColor={fillTop} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={strokeGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={positive ? '#38BDF8' : strokeColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor={positive ? '#1D4ED8' : strokeColor} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w},${h} L 0,${h} Z`} fill={`url(#${gradId})`} className="translate-y-0.5" />
      <motion.path
        d={d}
        fill="none"
        strokeWidth={1.65}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={`url(#${strokeGradId})`}
        initial={{ pathLength: 0, opacity: 0.5 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.15, ease: dashboardEase, delay: 0.15 }}
      />
    </svg>
  )
}

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  delay = 0,
  trendUp,
  trendDown,
  sparkline,
  className,
}: StatCardProps) {
  const uid = useId().replace(/:/g, '')
  const sparkGradId = `sg-${uid}`
  const strokeGradId = `sl-${uid}`
  const smoothed = useMemo(() => (sparkline?.length ? smoothSeries(sparkline) : []), [sparkline])
  const last = smoothed.length ? smoothed[smoothed.length - 1] : 0
  const first = smoothed[0] ?? 0
  const positive = Boolean(trendUp || (!trendDown && last >= first))

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: dashboardEase }}
      whileHover={{ y: -3, transition: { duration: 0.22, ease: dashboardEase } }}
      className={cn(
        'group relative flex h-full min-h-[168px] flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#060b14]/75 p-5',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_24px_56px_-28px_rgba(0,0,0,0.78)]',
        'backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-300',
        'hover:border-[#38BDF8]/22 hover:bg-[#070d18]/82',
        'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.1)_inset,0_0_40px_-16px_rgba(56,189,248,0.12)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#38BDF8]/14 via-[#1D4ED8]/10 to-transparent blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
          <span
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.1]',
              'bg-gradient-to-br from-[#38BDF8]/18 via-white/[0.05] to-[#1D4ED8]/14',
              'text-[#38BDF8] shadow-[0_0_22px_-8px_rgba(56,189,248,0.35)] ring-1 ring-white/[0.06]',
              'transition duration-300 group-hover:border-[#38BDF8]/30 group-hover:text-sky-100',
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.65} />
          </span>
        </div>

        <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-white">{value}</p>

        {hint ? <p className="mt-1.5 min-h-[2.5rem] text-xs leading-relaxed text-slate-500">{hint}</p> : <div className="mt-1.5 min-h-[2.5rem]" />}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
            {trendUp ? (
              <>
                <span
                  className={cn(
                    'inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold',
                    'bg-emerald-500/14 text-emerald-50',
                    'ring-1 ring-emerald-400/35 shadow-[0_0_18px_-6px_rgba(34,197,94,0.4)]',
                  )}
                >
                  <TrendingUp className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
                  {trendUp}
                </span>
                <span className="text-[10px] text-slate-600">vs prior</span>
              </>
            ) : null}
            {trendDown ? (
              <>
                <span className="inline-flex h-7 items-center rounded-full bg-rose-500/14 px-2.5 text-xs font-semibold text-rose-100 ring-1 ring-rose-400/30 shadow-[0_0_16px_-6px_rgba(251,113,133,0.3)]">
                  <TrendingDown className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
                  {trendDown}
                </span>
                <span className="text-[10px] text-slate-600">vs prior</span>
              </>
            ) : null}
          </div>
          {smoothed.length > 1 ? (
            <MiniSparkline data={smoothed} positive={positive} gradId={sparkGradId} strokeGradId={strokeGradId} />
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
