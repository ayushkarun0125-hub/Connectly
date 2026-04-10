import { cn } from '../../lib/utils'

/** Shared Connectly / app shell design tokens (Tailwind class bundles). */
export const panel = cn(
  'rounded-[20px] border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5',
  'dark:border-white/[0.08] dark:bg-[#0d1729] dark:shadow-black/25',
)
export const panelPadding = 'p-5 md:p-6'
export const shellBg = cn(
  'min-h-screen bg-transparent text-slate-900',
  'dark:bg-transparent dark:text-slate-100',
)
export const scrollClass = 'connectly-scroll overflow-y-auto'
export const inputGlass = cn(
  'w-full rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition',
  'focus:border-blue-500/50 focus:bg-white',
  'dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500/40 dark:focus:bg-white/[0.07]',
)
export const iconButton = cn(
  'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200/90 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900',
  'dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white',
)

export function panelClass(extra) {
  return cn(panel, panelPadding, extra)
}
