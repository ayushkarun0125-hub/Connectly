import { Outlet } from 'react-router-dom'

function PublicLayout() {
  return (
    <div className="min-h-dvh bg-transparent text-slate-100">
      <Outlet />
    </div>
  )
}

export default PublicLayout
