import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { ActivityItem } from '@/components/ui/activity-item'
import type { DashboardActivityItem } from '@/components/ui/dashboard-activity-types'

export type { DashboardActivityItem }

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
}

export type ActivityFeedProps = {
  items: DashboardActivityItem[]
  className?: string
  emptyLabel?: string
}

export function ActivityFeed({ items, className, emptyLabel = 'No recent events.' }: ActivityFeedProps) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    )
  }

  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="show"
      className={cn(
        'relative space-y-3.5',
        'before:pointer-events-none before:absolute before:left-[9px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-gradient-to-b before:from-[#38BDF8]/45 before:via-white/12 before:to-[#1D4ED8]/28',
        className,
      )}
    >
      {items.map((item, i) => (
        <ActivityItem key={item.id || `${item.at}-${item.message}-${i}`} item={item} />
      ))}
    </motion.ul>
  )
}
