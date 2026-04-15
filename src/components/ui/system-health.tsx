import { motion } from 'framer-motion'
import { Server } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'
import { SystemHealthRow, type HealthServiceRow, type HealthServiceStatus } from '@/components/ui/system-health-row'

export type { HealthServiceRow, HealthServiceStatus }

export type SystemHealthProps = {
  services: HealthServiceRow[]
  className?: string
}

export function SystemHealth({ services, className }: SystemHealthProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: dashboardEase }}
      className={cn(
        'rounded-2xl border border-sky-500/10 bg-[#060b14]/72 p-6 backdrop-blur-xl',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_28px_64px_-36px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white">System health</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Realtime collaboration stack</p>
        </div>
        <Server className="h-4 w-4 text-[#38BDF8]/85" strokeWidth={1.75} />
      </div>
      <ul className="space-y-0 rounded-xl border border-white/[0.06] bg-[#030712]/75 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        {services.map((row, i) => (
          <SystemHealthRow key={row.id} row={row} index={i} />
        ))}
      </ul>
    </motion.div>
  )
}
