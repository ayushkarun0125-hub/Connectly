import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

/**
 * Sends new accounts to profile setup until they complete it.
 */
function RequireProfileComplete() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-transparent text-slate-100">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  if (user && user.profileCompleted === false) {
    return <Navigate to="/setup-profile" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default RequireProfileComplete
