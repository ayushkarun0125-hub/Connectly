import { Link } from 'react-router-dom'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import Badge from '../components/ui/Badge'
import { useAuth } from '../contexts/useAuth'

function ProfilePage() {
  const { user, loading } = useAuth()
  const role = user?.role ?? 'user'
  const name = user?.displayName || user?.email || 'User'
  const email = user?.email || ''
  const bio = user?.bio || ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Your account details and workspace role."
        action={(
          <Link
            to="/app/team"
            className="text-sm font-medium text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View team directory →
          </Link>
        )}
      />

      <ConnectlyPanel className="max-w-3xl">
        {loading || !user ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile…</p>
        ) : (
          <>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-lg shadow-blue-600/25">
                {name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{name}</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{email}</p>
                <div className="mt-3">
                  <Badge color="blue" className="!uppercase !tracking-wide">
                    {role}
                  </Badge>
                </div>
              </div>
            </div>
            {bio ? (
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Bio</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {bio}
                </p>
              </div>
            ) : null}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-500">
                  You are signed in with Connectly&apos;s secure session. Password changes live under Settings →
                  Security. Edit your name and bio from profile setup or ask an admin.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Role access</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-500">
                  Admins use the Admin portal; moderators use the Moderator portal from the sidebar. Everyone else gets
                  the collaboration experience only.
                </p>
              </div>
            </div>
          </>
        )}
      </ConnectlyPanel>
    </div>
  )
}

export default ProfilePage
