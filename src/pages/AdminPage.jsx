import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import { mockUsers } from '../mock/data'

function AdminPage() {
  const columns = [
    { key: 'name', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = mockUsers.map((user) => ({
    ...user,
    actions: (
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="px-2 py-1 text-xs" disabled title="Not implemented">Kick</Button>
        <Button type="button" variant="danger" className="px-2 py-1 text-xs" disabled title="Not implemented">Ban</Button>
      </div>
    ),
  }))

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <strong className="font-semibold">Demo prototype:</strong>
        {' '}
        Kick/ban and moderation APIs are not wired to the server yet. Use this screen to discuss future work only.
      </div>
      <Card>
        <h1 className="text-lg font-semibold">Moderation Panel</h1>
        <p className="mt-1 text-sm text-slate-400">Manage users, rooms, and reported content.</p>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">User Management</h2>
        <Table columns={columns} rows={rows} />
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold">Room Moderation</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
            <li>Freeze room chat</li>
            <li>Clear whiteboard history</li>
            <li>Restrict file uploads</li>
          </ul>
        </Card>
        <Card>
          <h3 className="font-semibold">Reported Content</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-400">
            <li className="rounded-lg border border-slate-800 p-2">Message flagged for spam</li>
            <li className="rounded-lg border border-slate-800 p-2">Inappropriate file upload report</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default AdminPage
