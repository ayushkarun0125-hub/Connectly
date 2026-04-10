function UserPresencePanel({ users }) {
  return (
    <aside className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="font-semibold mb-3">Online Users</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.userId}
            className="flex items-center justify-between text-sm border border-slate-800 rounded-md px-3 py-2"
          >
            <span>{user.username}</span>
            <span className="text-xs uppercase text-slate-400">{user.role || 'member'}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default UserPresencePanel
