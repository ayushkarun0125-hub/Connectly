import { useState } from 'react'

export default function ContactSalesPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    workEmail: '',
    company: '',
    teamSize: '',
    message: '',
  })

  function onSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="pb-20 pt-4 md:pb-28">
      <section className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Contact Sales</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">Enterprise collaboration, tailored</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">
          Tell us about your organization and we’ll help you design the right Connectly rollout.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/85 p-6">
          <h2 className="text-xl font-semibold text-white">What to expect</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">Architecture and security review</li>
            <li className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">Plan recommendations for your team size</li>
            <li className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">Migration and onboarding guidance</li>
            <li className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">Dedicated deployment support</li>
          </ul>
        </aside>

        <form onSubmit={onSubmit} className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/88 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Full name</span>
              <input required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Work email</span>
              <input type="email" required value={form.workEmail} onChange={(e) => setForm((p) => ({ ...p, workEmail: e.target.value }))} className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50" />
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Company</span>
              <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Team size</span>
              <input value={form.teamSize} onChange={(e) => setForm((p) => ({ ...p, teamSize: e.target.value }))} placeholder="e.g. 80" className="w-full rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50" />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">How can we help?</span>
            <textarea rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="w-full resize-none rounded-xl border border-white/[0.1] bg-[#0a1529] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50" />
          </label>
          {submitted ? <p className="mt-3 text-sm text-emerald-300">Thanks! Sales will reach out shortly.</p> : null}
          <button type="submit" className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            Submit inquiry
          </button>
        </form>
      </section>
    </div>
  )
}

