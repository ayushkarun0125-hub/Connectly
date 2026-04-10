function SurfaceCard({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl ${className}`}>
      {children}
    </section>
  )
}

export default SurfaceCard
