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
          'group relative flex min-h-[4.75rem] items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070d16]/88 px-4 py-4',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_16px_40px_-28px_rgba(0,0,0,0.72)]',
          'transition-[border-color,box-shadow,transform] duration-300 ease-out',
          'hover:-translate-y-1 hover:border-[#38BDF8]/28',
          'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12)_inset,0_22px_48px_-20px_rgba(56,189,248,0.14),0_18px_40px_-28px_rgba(29,78,216,0.12)]',
          'active:translate-y-0 active:scale-[0.99]',
        )}
      >
        <span
          className={cn(
            'grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-xl border border-white/[0.1]',
            'bg-gradient-to-br from-[#38BDF8]/16 via-white/[0.04] to-[#1D4ED8]/12',
            'text-[#38BDF8] shadow-[0_0_22px_-8px_rgba(56,189,248,0.35)]',
            'transition duration-300 group-hover:border-[#38BDF8]/35 group-hover:text-sky-100',
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.65} />
        </span>
        <div className="min-w-0 flex-1 self-center pr-1">
          <p className="text-sm font-semibold text-slate-100 group-hover:text-white">{label}</p>
          {description ? <p className="mt-1 text-xs leading-relaxed text-slate-500 group-hover:text-slate-400">{description}</p> : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:border-[#38BDF8]/20 group-hover:text-[#38BDF8]">
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </span>
      </Link>
    </motion.div>
  )
}
