import { useEffect, useRef, useState } from 'react'

function drawLine(ctx, stroke) {
  if (stroke.type === 'clear') {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    return
  }

  if (stroke.type !== 'draw') return

  ctx.strokeStyle = stroke.color || '#4f9cf9'
  ctx.lineWidth = stroke.size || 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(stroke.prevX, stroke.prevY)
  ctx.lineTo(stroke.x, stroke.y)
  ctx.stroke()
}

function WhiteboardCanvas({ onDrawEvent, remoteDrawEvent, serverSnapshot }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef({ x: 0, y: 0 })
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#4f9cf9')
  const [mode, setMode] = useState('pen')
  const historyRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  /** Full state from server when joining the room (Socket `whiteboard-state`). */
  useEffect(() => {
    if (serverSnapshot == null) return
    const strokes = Array.isArray(serverSnapshot.strokes) ? serverSnapshot.strokes : []
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    historyRef.current = []
    for (const stroke of strokes) {
      drawLine(ctx, stroke)
      if (stroke.type === 'draw') historyRef.current.push(stroke)
    }
  }, [serverSnapshot])

  useEffect(() => {
    if (!remoteDrawEvent) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    drawLine(ctx, remoteDrawEvent)
  }, [remoteDrawEvent])

  function toPoint(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  function handleMove(event) {
    if (!drawingRef.current) return
    const point = toPoint(event)
    const previous = lastPointRef.current
    const stroke = {
      type: 'draw',
      x: point.x,
      y: point.y,
      prevX: previous.x,
      prevY: previous.y,
      size,
      color: mode === 'eraser' ? '#020617' : color,
    }

    const ctx = canvasRef.current.getContext('2d')
    drawLine(ctx, stroke)
    historyRef.current.push(stroke)
    onDrawEvent(stroke)
    lastPointRef.current = point
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onDrawEvent({ type: 'clear' })
    historyRef.current = []
  }

  function undoLast() {
    historyRef.current.pop()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    historyRef.current.forEach((stroke) => drawLine(ctx, stroke))
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-semibold mr-auto">Whiteboard</h2>
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-8 w-10 rounded bg-transparent"
        />
        <input
          type="range"
          min="1"
          max="12"
          value={size}
          onChange={(event) => setSize(Number(event.target.value))}
        />
        <button type="button" className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:border-slate-500" onClick={() => setMode('pen')}>
          Pen
        </button>
        <button type="button" className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:border-slate-500" onClick={() => setMode('eraser')}>
          Eraser
        </button>
        <button type="button" className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:border-slate-500" onClick={undoLast}>
          Undo
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:border-slate-500"
          onClick={clearCanvas}
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={900}
        height={320}
        className="w-full rounded-md border border-slate-800 bg-slate-950"
        onMouseDown={(event) => {
          drawingRef.current = true
          lastPointRef.current = toPoint(event)
        }}
        onMouseMove={handleMove}
        onMouseUp={() => {
          drawingRef.current = false
        }}
        onMouseLeave={() => {
          drawingRef.current = false
        }}
      />
    </section>
  )
}

export default WhiteboardCanvas
