import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminDashboardSidebar } from '@/components/ui/sidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { adminApi } from '@/services/adminApi'
import { useAuth } from '@/contexts/useAuth'
import ShaderBackground from '@/components/ui/shader-background'

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
    <div className="relative isolate flex min-h-dvh bg-[#020617] text-slate-200">
      <ShaderBackground />
      {/* Navy scrim + subtle cyan/blue wash — pushes shader back, improves card contrast */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-[#020617]/78"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.55]"
        style={{
          backgroundImage: `radial-gradient(ellipse 90% 55% at 50% -20%, rgba(56, 189, 248, 0.11), transparent 55%),
            radial-gradient(ellipse 55% 45% at 100% 0%, rgba(29, 78, 216, 0.09), transparent 50%),
            radial-gradient(ellipse 50% 42% at 0% 100%, rgba(15, 40, 90, 0.12), transparent 48%)`,
        }}
        aria-hidden
      />
      <AdminDashboardSidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        showExitToWorkspace={user?.role !== 'admin'}
      />
      <div className="relative z-[2] flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopbar
          environment={env}
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
          onSidebarExpand={() => setCollapsed(false)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto pb-12">
          <div className="mx-auto w-full max-w-[1320px] px-5 md:px-7 lg:px-9">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
