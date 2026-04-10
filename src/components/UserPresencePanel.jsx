import SectionHeader from './connectly/SectionHeader'
import ConnectlyPanel from './connectly/ConnectlyPanel'
import UserListItem from './connectly/UserListItem'
import EmptyState from './connectly/EmptyState'
import { Users } from 'lucide-react'

function UserPresencePanel({ users }) {
  return (
    <ConnectlyPanel className="flex flex-col" noPadding>
      <div className={users.length ? 'p-5 pb-2' : 'p-5'}>
        <SectionHeader title="Online users" description="Active in this room" />
      </div>
      {users.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState
            icon={Users}
            title="No one else here yet"
            description="When teammates join this room, they will show up here."
            className="py-8"
          />
        </div>
      ) : (
        <ul className="connectly-scroll max-h-[280px] space-y-2 overflow-y-auto px-5 pb-5">
          {users.map((user) => (
            <UserListItem
              key={user.userId}
              name={user.username || 'Guest'}
              role={user.role || 'member'}
              online
            />
          ))}
        </ul>
      )}
    </ConnectlyPanel>
  )
}

export default UserPresencePanel
