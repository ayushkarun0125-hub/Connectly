import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function StatCard({ title, value, hint, icon: Icon, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-sky-400">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}
