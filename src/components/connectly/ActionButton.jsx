import { cn } from '../../lib/utils'
import { SoundButton } from '@/ui-sounds'

const variants = {
  primary:
    'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-500/30',
  secondary:
    'border border-white/[0.12] bg-white/[0.05] text-slate-100 hover:bg-white/[0.09] hover:border-white/[0.16]',
  ghost: 'border border-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
}

function ActionButton({ variant = 'secondary', className, size = 'md', children, ...props }) {
  const sizes = {
    sm: 'rounded-xl px-3 py-2 text-xs font-medium',
    md: 'rounded-xl px-4 py-2.5 text-sm font-semibold',
    lg: 'rounded-2xl px-5 py-3 text-sm font-semibold',
  }
  return (
    <SoundButton
      className={cn(
        'inline-flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </SoundButton>
  )
}

export default ActionButton
