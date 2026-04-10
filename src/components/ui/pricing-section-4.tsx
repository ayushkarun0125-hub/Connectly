import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SparklesBackground } from '@/components/ui/sparkles'
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal'
import { cn } from '@/lib/utils'

type Plan = {
  name: string
  description: string
  priceValue: number | null
  priceLabel?: string
  suffix: string
  features: string[]
  cta: string
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    name: 'Starter',
    description: 'For small teams adopting real-time rooms, chat, and shared files in one workspace.',
    priceValue: 29,
    suffix: '/seat/mo',
    features: [
      'Up to 10 seats and 5 concurrent rooms',
      'Real-time chat with typing and presence',
      'File sharing with in-room previews (up to 100 MB per file)',
      '7-day searchable message history',
      'Standard email support',
    ],
    cta: 'Start with Starter',
  },
  {
    name: 'Pro',
    description:
      'For product and engineering teams that live in chat, whiteboard sessions, and pinned context.',
    priceValue: 79,
    suffix: '/seat/mo',
    highlighted: true,
    features: [
      'Up to 50 seats and unlimited rooms',
      'Collaborative whiteboard with live strokes',
      'Pinned files and deep links tied to message threads',
      '90-day history, exports, and room insights',
      'Priority support with same-day response targets',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Enterprise',
    description:
      'For organizations that need scale, security reviews, and dedicated rollout for Connectly.',
    priceValue: null,
    priceLabel: 'Custom',
    suffix: 'billing',
    features: [
      'Unlimited seats, regions, and retention policies',
      'SSO, SCIM, and advanced admin & audit controls',
      '99.9% uptime SLA and named Customer Success',
      'Data residency and compliance packaging available',
      'Professional services for migration and training',
    ],
    cta: 'Contact sales',
  },
]

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function PricingSection4() {
  const reduce = useReducedMotion()

  const listInitial = reduce ? 'visible' : 'hidden'

  return (
    <section id="pricing" className="relative scroll-mt-28 pb-16 pt-2 md:scroll-mt-32 md:pb-24 md:pt-4 lg:pb-28">
      <div className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-gradient-to-b from-[#0c1220]/92 to-[#070b14]/95 p-8 shadow-[0_32px_120px_-48px_rgba(37,99,235,0.35)] sm:p-10 md:p-14 lg:p-16">
        <div
          className="pointer-events-none absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-blue-600/18 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl"
          aria-hidden
        />

        <SparklesBackground id="pricing-sparkles" className="opacity-90" />

        <div className="relative z-10 mx-auto max-w-4xl text-center md:max-w-none">
          <VerticalCutReveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Pricing</p>
          </VerticalCutReveal>
          <VerticalCutReveal delay={0.06} className="mt-4">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.08]">
              Plans that scale with your collaboration
            </h2>
          </VerticalCutReveal>
          <VerticalCutReveal delay={0.12} className="mt-5">
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-400 md:text-xl">
              Choose the right tier for real-time rooms, whiteboard working sessions, presence, and secure file
              sharing—all in one Connectly workspace.
            </p>
          </VerticalCutReveal>
        </div>

        <motion.div
          className="relative z-10 mt-12 grid gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-5 xl:gap-6"
          variants={container}
          initial={listInitial}
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              className={cn(
                'flex h-full',
                plan.highlighted && 'lg:-mt-2 lg:mb-2 lg:scale-[1.02]',
              )}
            >
              <Card
                className={cn(
                  'relative flex h-full w-full flex-col overflow-hidden backdrop-blur-sm transition-shadow duration-300',
                  plan.highlighted
                    ? 'border-blue-500/45 bg-[#0a101c]/95 shadow-[0_0_48px_-12px_rgba(59,130,246,0.45)] ring-1 ring-blue-500/30'
                    : 'border-white/[0.08] bg-[#0a0f1a]/88',
                )}
              >
                {plan.highlighted ? (
                  <div className="absolute right-4 top-4 rounded-full border border-blue-400/35 bg-blue-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200">
                    Recommended
                  </div>
                ) : null}

                <CardHeader className={plan.highlighted ? 'pt-8 md:pt-10' : undefined}>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-2 min-h-[4.5rem] md:min-h-[5rem]">{plan.description}</CardDescription>
                  <div className="mt-6 flex flex-wrap items-baseline gap-1">
                    {plan.priceValue != null ? (
                      <>
                        <span className="text-3xl font-bold tabular-nums text-white md:text-4xl">
                          <span className="text-xl font-semibold text-slate-400 md:text-2xl">$</span>
                          {plan.priceValue}
                        </span>
                        <span className="text-sm text-slate-500 md:text-base">{plan.suffix}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-white md:text-4xl">{plan.priceLabel}</span>
                        <span className="text-sm text-slate-500 md:text-base">{plan.suffix}</span>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3.5 text-left text-sm text-slate-300 md:text-[15px]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link
                    to="/signup"
                    className={cn(
                      'inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-center text-sm font-semibold transition md:text-base',
                      plan.highlighted
                        ? 'bg-blue-600 text-white shadow-[0_0_28px_-6px_rgba(37,99,235,0.7)] hover:bg-blue-500'
                        : 'border border-white/[0.12] bg-white/[0.04] text-slate-100 hover:border-white/[0.2] hover:bg-white/[0.08]',
                    )}
                  >
                    {plan.cta}
                  </Link>
                  {plan.name === 'Enterprise' ? (
                    <p className="text-center text-xs text-slate-500">
                      Volume licensing and security reviews available—our team will tailor a quote.
                    </p>
                  ) : null}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection4
