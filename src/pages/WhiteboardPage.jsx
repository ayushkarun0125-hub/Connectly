import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SurfaceCard from '../components/ui/SurfaceCard'
import { Tabs } from '../components/ui/Tabs'
import WhiteboardCanvas from '../components/WhiteboardCanvas'
import { connectSocket } from '../services/socket'

function WhiteboardPage() {
  const { roomId = 'room_general' } = useParams()
  const [tab, setTab] = useState('Canvas')
  const [remoteDrawEvent, setRemoteDrawEvent] = useState(null)

  useEffect(() => {
    const socket = connectSocket()
    const handler = (event) => setRemoteDrawEvent(event)
    socket.on('draw-event', handler)
    return () => socket.off('draw-event', handler)
  }, [])

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
          <WhiteboardCanvas onDrawEvent={onDrawEvent} remoteDrawEvent={remoteDrawEvent} />
        ) : (
          <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-400">
            Room notes panel placeholder for sprint annotations and links.
          </div>
        )}
      </SurfaceCard>
    </div>
  )
}

export default WhiteboardPage
