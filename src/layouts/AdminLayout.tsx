import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminDashboardSidebar } from '@/components/ui/sidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { adminApi } from '@/services/adminApi'
import { useAuth } from '@/contexts/useAuth'

export default function AdminLayout() {
  const { user } = useAuth()
  const [env, setEnv] = useState('development')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    adminApi
      .system()
      .then((s) => setEnv(s.environment || 'development'))
      .catch(() => setEnv('development'))
  }, [])

  return (
    <div className="flex min-h-dvh bg-[#03060b] text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(ellipse 85% 55% at 50% -25%, rgba(34, 211, 238, 0.14), transparent),
            radial-gradient(ellipse 55% 45% at 100% 0%, rgba(139, 92, 246, 0.12), transparent),
            radial-gradient(ellipse 50% 40% at 0% 100%, rgba(59, 130, 246, 0.08), transparent)`,
        }}
      />
      <AdminDashboardSidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        showExitToWorkspace={user?.role !== 'admin'}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopbar
          environment={env}
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
          onSidebarExpand={() => setCollapsed(false)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto pb-12">
          <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
