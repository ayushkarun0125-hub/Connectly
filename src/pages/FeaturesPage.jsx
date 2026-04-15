import { Link } from 'react-router-dom'
import { Database, FolderUp, MessageSquareText, PenTool, Shield, Sparkles, Users } from 'lucide-react'

const featureSections = [
  {
    title: 'Realtime communication',
    subtitle: 'High-velocity chat rooms for product teams',
    icon: MessageSquareText,
    points: [
      'Room-based chat with live updates and unread tracking.',
      'Typing indicators, delivery states, and message continuity.',
      'Pinned highlights keep context visible for everyone.',
    ],
  },
  {
    title: 'Collaborative whiteboard',
    subtitle: 'Visual thinking without leaving the workspace',
    icon: PenTool,
    points: [
      'Live co-editing with low-latency draw events.',
      'Room-tied boards for design reviews and planning.',
      'Instant handoff from whiteboard discussion to room messages.',
    ],
  },
  {
    title: 'Presence and activity',
    subtitle: 'Awareness that keeps execution in sync',
    icon: Users,
    points: [
      'See who is active in each room at a glance.',
      'Real-time participant and join/leave events.',
      'Faster standups and async follow-ups with live visibility.',
    ],
  },
  {
    title: 'Files and shared assets',
    subtitle: 'Contextual files where work actually happens',
    icon: FolderUp,
    points: [
      'Upload and share assets directly in conversation threads.',
      'Pinned files surface critical docs instantly.',
      'Recent file activity keeps projects searchable and actionable.',
    ],
  },
  {
    title: 'Persistent team memory',
    subtitle: 'Searchable history with operational reliability',
    icon: Database,
    points: [
      'Room history persists across sessions and devices.',
      'Message retention supports onboarding and audit trails.',
      'Recover key decisions without searching across tools.',
    ],
  },
  {
    title: 'Security and moderation',
    subtitle: 'Collaboration controls built for production',
    icon: Shield,
    points: [
      'Role-aware access and room enforcement flows.',
      'Moderation reports and admin oversight for trust.',
      'Private-first onboarding model for secure defaults.',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="pb-20 pt-4 md:pb-28">
      <section className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Features</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">One platform, full team execution</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400">
          Connectly blends messaging, whiteboarding, presence, and file collaboration into a single premium workspace built for shipping teams.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {featureSections.map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/80 p-7 transition hover:-translate-y-0.5 hover:border-white/[0.12]">
            <feature.icon className="h-6 w-6 text-blue-300" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-300/90">{feature.subtitle}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{feature.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400">
              {feature.points.map((point) => (
                <li key={point} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-14 rounded-2xl border border-white/[0.1] bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-cyan-500/20 p-8 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-blue-300" />
        <h3 className="mt-4 text-2xl font-semibold text-white">Want to see this in action?</h3>
        <p className="mt-2 text-slate-300">Explore the product surface in our interactive live demo preview.</p>
        <Link to="/demo" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
          Open live demo page
        </Link>
      </section>
    </div>
  )
}

