import { cn } from '../../lib/utils'

function Button({ className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    ghost: 'bg-transparent border border-slate-700 hover:border-slate-500',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }

  return (
    <button
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export default Button
