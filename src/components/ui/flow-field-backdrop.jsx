import FlowFieldBackground from '@/components/ui/flow-field-background'

/**
 * Full-viewport flow field behind the app. Pointer events disabled so UI stays clickable.
 */
export default function FlowFieldBackdrop() {
  const trailRgb = '3,7,18'

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 min-h-dvh w-full"
      aria-hidden
    >
      <FlowFieldBackground
        className="min-h-dvh"
        color="#818cf8"
        trailRgb={trailRgb}
        trailOpacity={0.12}
        particleCount={480}
        speed={0.75}
      />
    </div>
  )
}
