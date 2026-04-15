import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type QuickActionCardProps = {
  label: string
  description?: string
  to: string
  icon: LucideIcon
  index: number
}

export function QuickActionCard({ label, description, to, icon: Icon, index }: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={to}
        className={cn(
          'group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080d14]/90 px-4 py-4',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_16px_40px_-28px_rgba(0,0,0,0.7)]',
          'transition-[border-color,box-shadow,transform] duration-300',
          'hover:-translate-y-0.5 hover:border-dashboard-cyan/35',
          'hover:shadow-[0_0_0_1px_rgba(0,229,255,0.12)_inset,0_28px_56px_-24px_var(--dashboard-glow-cyan),0_0_40px_-12px_var(--dashboard-glow-purple)]',
        )}
      >
        <span
          className={cn(
            'grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10',
            'bg-gradient-to-br from-dashboard-cyan/15 via-white/[0.04] to-dashboard-purple/10',
            'text-dashboard-cyan shadow-[0_0_24px_-8px_var(--dashboard-glow-cyan)]',
            'transition duration-300 group-hover:border-dashboard-cyan/35 group-hover:text-white',
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.65} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100 group-hover:text-white">{label}</p>
          {description ? <p className="mt-1 text-xs leading-relaxed text-slate-500 group-hover:text-slate-400">{description}</p> : null}
        </div>
        <motion.span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500"
          whileHover={{ x: 3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <ChevronRight className="h-4 w-4 transition-colors group-hover:text-dashboard-cyan" strokeWidth={2} />
        </motion.span>
      </Link>
    </motion.div>
  )
}
