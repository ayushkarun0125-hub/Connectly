function Badge({ children, color = 'slate' }) {
  const map = {
    slate: 'bg-slate-700/50 text-slate-200',
    blue: 'bg-blue-600/20 text-blue-300',
    emerald: 'bg-emerald-600/20 text-emerald-300',
    rose: 'bg-rose-600/20 text-rose-300',
  }
  return <span className={`rounded-full px-2 py-1 text-xs ${map[color]}`}>{children}</span>
}

export default Badge
