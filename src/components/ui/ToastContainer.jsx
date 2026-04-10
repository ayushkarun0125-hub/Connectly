import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'

function ToastContainer() {
  const toasts = useAppStore((state) => state.toasts)
  const dismissToast = useAppStore((state) => state.dismissToast)

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => dismissToast(toast.id), 2500),
    )
    return () => timers.forEach(clearTimeout)
  }, [dismissToast, toasts])

  return (
    <div className="fixed right-4 top-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm shadow-xl">
          <p className="font-medium">{toast.title}</p>
          {toast.description && <p className="text-slate-400">{toast.description}</p>}
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
