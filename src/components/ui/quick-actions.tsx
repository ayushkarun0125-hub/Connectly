import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dashboardEase } from '@/lib/dashboard-motion'
import { QuickActionCard } from '@/components/ui/quick-action-card'

export type QuickActionItem = {
  label: string
  description?: string
  to: string
  icon: LucideIcon
}

export type QuickActionsProps = {
  title?: string
  subtitle?: string
  actions: QuickActionItem[]
  className?: string
}

export function QuickActions({
  title = 'Quick actions',
  subtitle = 'Jump to common operational tasks',
  actions,
  className,
}: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: dashboardEase }}
      className={cn(
        'rounded-2xl border border-sky-500/10 bg-[#060b14]/72 p-6 backdrop-blur-xl',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_28px_64px_-36px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3.5">
        {actions.map((a, i) => (
          <QuickActionCard
            key={a.to + a.label}
            label={a.label}
            description={a.description}
            to={a.to}
            icon={a.icon}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  )
}
