import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import SurfaceCard from '../components/ui/SurfaceCard'
import { Tabs } from '../components/ui/Tabs'
import WhiteboardCanvas from '../components/WhiteboardCanvas'
import RoomNotesPanel from '../components/connectly/RoomNotesPanel'
import { connectSocket } from '../services/socket'
import { useAuth } from '../contexts/useAuth'

function WhiteboardPage() {
  const { roomId = 'room_design' } = useParams()
  const { user } = useAuth()
  const username = user?.displayName || user?.email || 'User'
  const presenceShellRoomIds = useMemo(() => {
    const ids = new Set(['room_design'])
    if (user?.personalRoomId) ids.add(user.personalRoomId)
    return ids
  }, [user?.personalRoomId])
  const [tab, setTab] = useState('Canvas')
  const [remoteDrawEvent, setRemoteDrawEvent] = useState(null)
  const [serverSnapshot, setServerSnapshot] = useState(null)

  const handleDrawEvent = useCallback((event) => {
    setRemoteDrawEvent(event)
  }, [])

  useEffect(() => {
    const socket = connectSocket()

    const join = () => {
      socket.emit('join-room', { roomId, username })
    }

    const onWhiteboardState = (payload) => {
      const strokes = Array.isArray(payload?.strokes) ? payload.strokes : []
      setServerSnapshot({ key: Date.now(), strokes })
    }

    socket.on('connect', join)
    socket.on('whiteboard-state', onWhiteboardState)
    socket.on('draw-event', handleDrawEvent)

    if (socket.connected) {
      join()
    }

    return () => {
      if (!presenceShellRoomIds.has(roomId)) {
        socket.emit('leave-room', { roomId })
      }
      socket.off('connect', join)
      socket.off('whiteboard-state', onWhiteboardState)
      socket.off('draw-event', handleDrawEvent)
    }
  }, [roomId, username, handleDrawEvent, presenceShellRoomIds])

  function onDrawEvent(stroke) {
    const socket = connectSocket()
    socket.emit('draw-event', { roomId, ...stroke })
  }

  return (
    <div className="space-y-4">
      <SurfaceCard>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h1 className="mr-auto text-lg font-semibold">Whiteboard · {roomId}</h1>
          <Tabs tabs={['Canvas', 'Notes']} active={tab} onChange={setTab} />
        </div>
        {tab === 'Canvas' ? (
          <WhiteboardCanvas
            onDrawEvent={onDrawEvent}
            remoteDrawEvent={remoteDrawEvent}
            serverSnapshot={serverSnapshot}
          />
        ) : (
          <RoomNotesPanel roomId={roomId} />
        )}
      </SurfaceCard>
    </div>
  )
}

export default WhiteboardPage
