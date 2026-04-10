import { useUser } from '@clerk/react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

function ProfilePage() {
  const { user, isLoaded } = useUser()
  const role = user?.publicMetadata?.role ?? 'user'
  const name = user?.fullName || user?.firstName || user?.username || 'User'
  const email = user?.primaryEmailAddress?.emailAddress || ''

  return (
    <Card className="max-w-2xl">
      {!isLoaded || !user ? (
        <p className="text-sm text-slate-400">Loading profile…</p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-blue-600/30 text-2xl font-bold">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                name.slice(0, 1)
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{name}</h1>
              <p className="text-slate-400">{email}</p>
              <div className="mt-2"><Badge color="blue">{role}</Badge></div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 p-4">
              <h2 className="font-medium">Account</h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage email, password, and sessions from the user menu in the header.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 p-4">
              <h2 className="font-medium">Role access</h2>
              <p className="mt-1 text-sm text-slate-400">
                Roles come from Clerk public metadata (e.g. admin, moderator).
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

export default ProfilePage
