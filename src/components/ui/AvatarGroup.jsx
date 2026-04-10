function AvatarGroup({ users = [] }) {
  return (
    <div className="flex -space-x-2">
      {users.slice(0, 5).map((user) => (
        <div key={user.id} className="grid h-8 w-8 place-items-center rounded-full border border-slate-700 bg-slate-800 text-xs">
          {user.name.slice(0, 1)}
        </div>
      ))}
    </div>
  )
}

export default AvatarGroup
