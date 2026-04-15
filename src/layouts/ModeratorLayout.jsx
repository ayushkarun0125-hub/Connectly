import { Outlet } from 'react-router-dom'
import { ModeratorSidebar } from '@/components/admin/ModeratorSidebar'
import { ModeratorTopbar } from '@/components/admin/ModeratorTopbar'
import { useEffect, useState } from 'react'
import { adminApi } from '@/services/adminApi'

export default function ModeratorLayout() {
  const [env, setEnv] = useState('development')

  useEffect(() => {
    adminApi
      .system()
      .then((s) => setEnv(s.environment || 'development'))
      .catch(() => setEnv('development'))
  }, [])

  return (
    <div className="flex min-h-dvh bg-[#03060b] text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.38]"
        style={{
          backgroundImage: `radial-gradient(ellipse 90% 55% at 50% -18%, rgba(0, 229, 255, 0.07), transparent 55%),
            radial-gradient(ellipse 70% 45% at 100% 40%, rgba(124, 58, 237, 0.09), transparent 50%),
            radial-gradient(ellipse 50% 35% at 0% 80%, rgba(124, 58, 237, 0.05), transparent 45%)`,
        }}
      />
      <ModeratorSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <ModeratorTopbar environment={env} />
        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-8 md:px-8">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[min(520px,55vh)] w-[min(1100px,90vw)] -translate-x-1/2 opacity-[0.35]"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--dashboard-glow-cyan), transparent 70%)',
            }}
          />
          <div className="relative mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
