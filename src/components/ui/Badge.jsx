import { cn } from '../../lib/utils'

function Badge({ children, color = 'slate', className }) {
  const map = {
    slate: 'border border-white/[0.08] bg-slate-700/40 text-slate-200',
    blue: 'border border-blue-500/25 bg-blue-600/20 text-blue-200',
    emerald: 'border border-emerald-500/25 bg-emerald-600/20 text-emerald-200',
    rose: 'border border-rose-500/25 bg-rose-600/20 text-rose-200',
  }
  return (
    <span className={cn('rounded-full px-2 py-1 text-xs font-medium', map[color], className)}>
      {children}
    </span>
  )
}

export default Badge
