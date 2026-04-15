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
        'relative space-y-3 pl-1',
        'before:absolute before:left-[13px] before:top-3 before:h-[calc(100%-20px)] before:w-px',
        'before:bg-gradient-to-b before:from-dashboard-cyan/35 before:via-white/12 before:to-dashboard-purple/20',
        className,
      )}
    >
      {items.map((item, i) => (
        <ActivityItem key={item.id || `${item.at}-${item.message}-${i}`} item={item} />
      ))}
    </motion.ul>
  )
}
