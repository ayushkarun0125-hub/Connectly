import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

class FlowParticle {
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} speed
   */
  constructor(width, height, speed) {
    this.boundsW = width
    this.boundsH = height
    this.speed = speed
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.vx = 0
    this.vy = 0
    this.age = 0
    this.life = Math.random() * 200 + 100
  }

  /** @param {{ x: number; y: number }} mouse */
  update(mouse) {
    const width = this.boundsW
    const height = this.boundsH
    const speed = this.speed

    const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI
    this.vx += Math.cos(angle) * 0.2 * speed
    this.vy += Math.sin(angle) * 0.2 * speed

    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const interactionRadius = 150

    if (distance < interactionRadius) {
      const force = (interactionRadius - distance) / interactionRadius
      this.vx -= dx * force * 0.05
      this.vy -= dy * force * 0.05
    }

    this.x += this.vx
    this.y += this.vy
    this.vx *= 0.95
    this.vy *= 0.95

    this.age += 1
    if (this.age > this.life) {
      this.reset()
    }

    if (this.x < 0) this.x = width
    if (this.x > width) this.x = 0
    if (this.y < 0) this.y = height
    if (this.y > height) this.y = 0
  }

  reset() {
    const width = this.boundsW
    const height = this.boundsH
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.vx = 0
    this.vy = 0
    this.age = 0
    this.life = Math.random() * 200 + 100
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {string} color
   */
  draw(context, color) {
    context.fillStyle = color
    const alpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2
    context.globalAlpha = alpha
    context.fillRect(this.x, this.y, 1.5, 1.5)
  }
}

/**
 * Canvas flow-field / particle trail background.
 * @param {{
 *   className?: string
 *   color?: string
 *   trailOpacity?: number
 *   particleCount?: number
 *   speed?: number
 *   trailRgb?: string
 * }} props
 */
export default function FlowFieldBackground({
  className,
  color = '#6366f1',
  trailOpacity = 0.15,
  particleCount = 600,
  speed = 1,
  trailRgb = '3,7,18',
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let width = container.clientWidth
    let height = container.clientHeight
    let mouse = { x: -1000, y: -1000 }
    let animationFrameId = 0
    /** @type {FlowParticle[]} */
    let particles = []

    const init = () => {
      width = container.clientWidth
      height = container.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.globalAlpha = 1
      ctx.fillStyle = `rgb(${trailRgb})`
      ctx.fillRect(0, 0, width, height)

      particles = []
      for (let i = 0; i < particleCount; i += 1) {
        particles.push(new FlowParticle(width, height, speed))
      }
    }

    const animate = () => {
      ctx.globalAlpha = 1
      ctx.fillStyle = `rgba(${trailRgb}, ${trailOpacity})`
      ctx.fillRect(0, 0, width, height)

      particles.forEach((p) => {
        p.update(mouse)
        p.draw(ctx, color)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      init()
    }

    /** @param {MouseEvent} e */
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    init()
    animationFrameId = requestAnimationFrame(animate)

    window.addEventListener('resize', handleResize)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, trailOpacity, particleCount, speed, trailRgb])

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden bg-transparent', className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
