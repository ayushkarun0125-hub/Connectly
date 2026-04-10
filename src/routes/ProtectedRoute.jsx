import { useAuth } from '@clerk/react'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ roles }) {
  const { isLoaded, isSignedIn, user } = useAuth()

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  const role = user?.publicMetadata?.role ?? 'user'
  if (roles && !roles.includes(role)) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
