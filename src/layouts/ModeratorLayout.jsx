import { Outlet } from 'react-router-dom'
import { ModeratorSidebar } from '@/components/admin/ModeratorSidebar'
import { ModeratorTopbar } from '@/components/admin/ModeratorTopbar'
import { useEffect, useState } from 'react'
import { adminApi } from '@/services/adminApi'
import ShaderBackground from '@/components/ui/shader-background'

export default function ModeratorLayout() {
  const [env, setEnv] = useState('development')

  useEffect(() => {
    adminApi
      .system()
      .then((s) => setEnv(s.environment || 'development'))
      .catch(() => setEnv('development'))
  }, [])

  return (
    <div className="relative isolate flex min-h-dvh bg-[#020617] text-slate-200">
      <ShaderBackground />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[#020617]/78" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.52]"
        style={{
          backgroundImage: `radial-gradient(ellipse 88% 52% at 50% -18%, rgba(56, 189, 248, 0.1), transparent 54%),
            radial-gradient(ellipse 65% 45% at 100% 35%, rgba(29, 78, 216, 0.08), transparent 50%),
            radial-gradient(ellipse 48% 38% at 0% 85%, rgba(15, 40, 90, 0.1), transparent 45%)`,
        }}
        aria-hidden
      />
      <ModeratorSidebar />
      <div className="relative z-[2] flex min-w-0 flex-1 flex-col">
        <ModeratorTopbar environment={env} />
        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-8 md:px-8">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[min(520px,55vh)] w-[min(1100px,90vw)] -translate-x-1/2 opacity-[0.35]"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--dashboard-glow-cyan), transparent 70%)',
            }}
          />
          <div className="relative mx-auto w-full max-w-[1320px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
