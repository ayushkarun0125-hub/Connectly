function AvatarGroup({ users = [], showPresence = false }) {
  return (
    <div className="flex -space-x-2">
      {users.slice(0, 5).map((user) => (
        <div key={user.id} className="relative">
          <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#0d1729] bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-semibold text-white">
            {user.name.slice(0, 1)}
          </div>
          {showPresence ? (
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0d1729] ${
                user.online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-500'
              }`}
              aria-hidden
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default AvatarGroup
