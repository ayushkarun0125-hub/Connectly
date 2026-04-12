import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { useEffect, useState } from 'react'
import { adminApi } from '@/services/adminApi'

export default function AdminLayout() {
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
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(99, 102, 241, 0.08), transparent)`,
        }}
      />
      <AdminSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <AdminTopbar environment={env} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
