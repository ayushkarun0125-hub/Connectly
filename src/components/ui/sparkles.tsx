import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type SparklesBackgroundProps = {
  className?: string
  /** @deprecated Kept for API compatibility; particles are CSS/motion-only for runtime stability. */
  id?: string
}

const SPARKLE_POSITIONS = [
  { left: '8%', top: '12%', delay: 0, duration: 4.2 },
  { left: '22%', top: '78%', delay: 0.4, duration: 5.1 },
  { left: '45%', top: '8%', delay: 0.2, duration: 3.8 },
  { left: '72%', top: '22%', delay: 0.9, duration: 4.6 },
  { left: '88%', top: '55%', delay: 0.1, duration: 5.4 },
  { left: '55%', top: '88%', delay: 0.6, duration: 4.0 },
  { left: '15%', top: '48%', delay: 1.1, duration: 4.9 },
  { left: '92%', top: '12%', delay: 0.3, duration: 3.5 },
]

/**
 * Lightweight “sparkle” field (no tsParticles) — avoids engine init / Strict Mode issues that can blank the app.
 */
export function SparklesBackground({ className }: SparklesBackgroundProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(96,165,250,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 20%, rgba(129,140,248,0.18) 0%, transparent 42%), radial-gradient(circle at 50% 90%, rgba(56,189,248,0.12) 0%, transparent 40%)',
        }}
      />
      {SPARKLE_POSITIONS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-blue-300/70 shadow-[0_0_12px_rgba(96,165,250,0.8)]"
          style={{ left: s.left, top: s.top }}
          animate={{ opacity: [0.2, 0.95, 0.2], scale: [0.85, 1.35, 0.85] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}
    </div>
  )
}
