import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

function ProtectedRoute({ roles }) {
  const { loading, isSignedIn, user } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-transparent text-slate-100">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  const role = user?.role ?? 'user'
  if (roles && !roles.includes(role)) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
