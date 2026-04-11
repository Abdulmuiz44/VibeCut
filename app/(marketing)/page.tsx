import Link from 'next/link';
import type { ComponentProps } from 'react';
import { auth } from '@/auth';

const logos = ['Stripe', 'Notion', 'Linear', 'Loom', 'Framer'];

const features = [
  {
    title: 'Transcript-Led Editing',
    description:
      'Take the guesswork out of spoken-content editing. Move through the story from the transcript first, then fine-tune timing only when it matters.',
    points: ['Cut filler phrases fast', 'Jump to strong moments instantly', 'Shape the story before touching the timeline'],
    mockTitle: 'Transcript controls'
  },
  {
    title: 'AI Suggestions You Can Trust',
    description:
      'Use AI to tighten pacing and clean weak sections, while keeping every suggestion visible, reviewable, and reversible.',
    points: ['Suggested edits stay inspectable', 'Undo and redo without fear', 'Restore points before risky changes'],
    mockTitle: 'Reviewable edit history'
  },
  {
    title: 'Export Built For Social Delivery',
    description:
      'Queue polished vertical, square, or landscape outputs without breaking the flow from draft to final clip.',
    points: ['Preset aspect ratios', 'Render progress visibility', 'Easy re-export after revisions'],
    mockTitle: 'Delivery workflow'
  }
];

const plans = [
  {
    name: 'Starter',
    price: '$19',
    description: 'For creators testing a cleaner weekly workflow.',
    features: ['Transcript-first edits', 'Project history', 'Basic export queue']
  },
  {
    name: 'Creator',
    price: '$49',
    description: 'For consistent publishers who want speed and confidence.',
    features: ['AI edit suggestions', 'Restore points', 'Priority export flow'],
    featured: true
  },
  {
    name: 'Studio',
    price: '$99',
    description: 'For teams turning long-form content into repeatable short-form output.',
    features: ['Shared workflows', 'Unlimited projects', 'Premium support']
  }
];

const testimonials = [
  {
    name: 'Maya Rivers',
    role: 'Podcast creator',
    quote:
      'VibeCut makes spoken-content editing feel obvious. I spend less time searching for the clip and more time actually shipping it.'
  },
  {
    name: 'Ethan Cole',
    role: 'YouTube educator',
    quote:
      'The transcript-first workflow saves me every week. It is the first editing setup that actually feels built for talking-head content.'
  },
  {
    name: 'Nia Brooks',
    role: 'Short-form strategist',
    quote:
      'The AI suggestions are useful because they stay reviewable. The product feels fast without feeling risky.'
  }
const steps = [
  ['01', 'Upload the source', 'Bring in a long-form recording and let VibeCut generate the transcript and edit context.'],
  ['02', 'Trim by transcript', 'Cut weak beats, remove dead air, and tighten pacing while seeing the story clearly.'],
  ['03', 'Export the final cut', 'Render vertical, square, or landscape formats for the channel you are publishing to.']
] as const;

const usedBy = ['Podcast creators', 'Educators', 'Marketing teams', 'Agencies', 'Solo operators'];

const bullets = [
  'Transcript-backed timeline editing',
  'Restore points before risky changes',
  'Export presets for social formats',
  'Project duplication for repeat workflows',
  'AI suggestions with visible history',
  'Built for repeat publishing, not one-off edits'
];

const faqs = [
  {
    question: 'Is VibeCut for podcasts and talking-head videos?',
    answer:
      'Yes. The workflow is specifically designed for spoken-content editing where transcript-first control is much faster than pure timeline work.'
  },
  {
    question: 'Can I review AI edits before saving them?',
    answer: 'Yes. Suggestions stay visible, and the editing flow includes undo, redo, and restore points.'
  },
  {
    question: 'Can I export multiple social formats?',
    answer: 'Yes. VibeCut supports common delivery formats like vertical, square, and landscape presets.'
  },
  {
    question: 'Will this help me publish more consistently?',
    answer:
      'That is the core goal. VibeCut is built to reduce repeated editing friction so each weekly project feels faster than the last.'
  }
];

const stats = [
  ['3x', 'Faster clip selection from transcript-led editing'],
  ['5 min', 'To move from upload to an editable transcript-backed project'],
  ['100%', 'Visible history for safer iteration and exports']
] as const;

function StoreButton({ eyebrow, label, href }: { eyebrow: string; label: string; href: ComponentProps<typeof Link>['href'] }) {
  return (
    <Link href={href} className="inline-flex min-w-[230px] items-center justify-center gap-4 rounded-full bg-[#161616] px-7 py-4 text-white shadow-sm transition hover:bg-black">
      <span className="text-3xl leading-none">●</span>
      <span className="text-left">
        <span className="block text-[11px] uppercase tracking-[0.2em] text-white/70">{eyebrow}</span>
        <span className="block text-2xl font-semibold leading-none">{label}</span>
      </span>
    </Link>
  );
}

export default async function MarketingPage() {
  const session = await auth();
  const primaryHref = session?.user ? '/dashboard' : '/sign-in';
  const primaryLabel = session?.user ? 'Open workspace' : 'Start with Google';
  const riskReducer = 'No credit card required. Keep your current editor. Cancel anytime.';

  return (
    <main className="bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.02),transparent_22%)] pb-24">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="page-shell relative flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center py-16 text-center">
          <div className="max-w-5xl">
            <h1 className="text-5xl font-semibold tracking-[-0.06em] text-[hsl(var(--foreground))] sm:text-6xl lg:text-8xl">
              Smart, Fast, Simple Video Editing For Spoken Content.
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-10 text-[hsl(var(--muted-foreground))] sm:text-2xl">
              From transcript-led trimming to reviewable AI suggestions and clean exports, VibeCut helps creators ship better clips with less friction.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <StoreButton eyebrow="Start with" label="Google Sign In" href={primaryHref} />
              <StoreButton eyebrow="See the" label="Workflow" href="#features" />
            </div>
          </div>
        </div>
      </section>
                <div className="funnel-row">
                  <Link href={primaryHref} className="btn-primary whitespace-nowrap">
                    {primaryLabel}
                  </Link>
                  <Link href="#how-it-works" className="btn-ghost">
                    See how it works
                  </Link>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] sm:whitespace-nowrap">{riskReducer}</p>

      <section className="page-shell py-10 text-center">
        <p className="text-xl text-[hsl(var(--muted-foreground))]">Trusted by creators building weekly publishing systems</p>
        <div className="mt-8 grid grid-cols-2 gap-6 text-2xl font-semibold text-[hsl(var(--foreground))] sm:grid-cols-3 lg:grid-cols-5">
          {logos.map((logo) => (
            <div key={logo} className="opacity-75">
              {logo}
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="page-shell page-section space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-5xl">Features</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            Built for creators who need to move from raw recording to polished clip without losing speed or control.
          </p>
        </div>

        {features.map((feature, index) => (
          <div key={feature.title} className="grid items-center gap-8 rounded-[2rem] bg-[hsl(var(--card))] px-6 py-8 shadow-sm shadow-black/5 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <h3 className="text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{feature.title}</h3>
              <p className="mt-4 max-w-xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">{feature.description}</p>
              <div className="mt-6 space-y-3">
                {feature.points.map((point) => (
                  <div key={point} className="flex items-center gap-3 text-base text-[hsl(var(--foreground))]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ffd33d] text-xs font-semibold text-black">✓</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <div className="rounded-[2rem] border border-black/5 bg-[linear-gradient(180deg,#fafafa,#f1f1f1)] p-6 shadow-inner">
                <div className="mb-4 flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
                  <span>{feature.mockTitle}</span>
                  <span>VibeCut</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white p-4 text-left shadow-sm">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Current action</p>
                    <p className="mt-2 text-xl font-semibold text-[hsl(var(--foreground))]">{feature.title}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">State</p>
                      <p className="mt-2 font-semibold text-[hsl(var(--foreground))]">Ready</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Speed</p>
                      <p className="mt-2 font-semibold text-[hsl(var(--foreground))]">Faster than timeline-only</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="h-3 rounded-full bg-[#f1f1f1]">
                      <div className="h-3 w-3/4 rounded-full bg-[#ffd33d]" />
                </div>
              </div>

              <div className="surface-card p-5">
                <p className="section-label">Used by teams shipping every week</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {usedBy.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="section-label">What you get</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {bullets.map((item) => (
                    <div key={item} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.56)] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                      {item}
                    </div>
                    <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Workflow progress stays visible and simple.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section id="pricing" className="page-shell page-section">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-5xl">Pricing</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            Pick the workflow level that matches how often you publish.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-[2rem] p-8 shadow-sm ${plan.featured ? 'bg-[#161616] text-white' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'}`}>
              <p className={`text-lg font-semibold ${plan.featured ? 'text-white/80' : 'text-[hsl(var(--muted-foreground))]'}`}>{plan.name}</p>
              <p className="mt-5 text-5xl font-semibold tracking-tight">{plan.price}</p>
              <p className={`mt-4 text-base leading-8 ${plan.featured ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'}`}>{plan.description}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-base">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${plan.featured ? 'bg-[#ffd33d] text-black' : 'bg-[#ffd33d] text-black'}`}>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link href={primaryHref} className={`mt-8 inline-flex w-full justify-center rounded-full px-6 py-4 text-lg font-medium ${plan.featured ? 'bg-[#ffd33d] text-black' : 'bg-black text-white'}`}>
                Get started
              </Link>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map(([step, title, description]) => (
              <div key={step} className="surface-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]">{step}</p>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{description}</p>
              </div>
            ))}
          </div>

          <aside className="surface-card p-5 sm:p-6" aria-label="Transcript editing preview">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]">UI preview</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.7)] px-2 py-1 text-[hsl(var(--muted-foreground))]">
                  AI suggestion
                </span>
                <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.7)] px-2 py-1 text-[hsl(var(--muted-foreground))]">Undo</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-3 sm:p-4">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs sm:text-sm">
                <p className="font-mono text-[hsl(var(--muted-foreground))]">00:14</p>
                <p className="text-[hsl(var(--muted-foreground))]">We tested six hooks before this one finally landed.</p>

                <p className="font-mono text-[hsl(var(--muted-foreground))]">00:18</p>
                <p className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-2 py-1 text-[hsl(var(--foreground))]">
                  <span className="font-medium">Selected cut:</span> tighten this section and keep the payoff line.
                </p>

                <p className="font-mono text-[hsl(var(--muted-foreground))]">00:24</p>
                <p className="text-[hsl(var(--muted-foreground))]">Then we export vertical and square in one pass for socials.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="testimonials" className="page-shell page-section">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-5xl">What Creators Say</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            Hear from people using transcript-first editing to move faster every week.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="rounded-[2rem] bg-[hsl(var(--card))] p-8 shadow-sm">
              <div>
                <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{testimonial.name}</p>
                <p className="mt-1 text-base text-[hsl(var(--muted-foreground))]">{testimonial.role}</p>
              </div>
              <p className="mt-6 text-lg leading-9 text-[hsl(var(--foreground))]">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell page-section">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]">FAQ&apos;s</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-5xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg leading-8 text-[hsl(var(--muted-foreground))]">Ask us anything about the workflow.</p>
            <Link href="mailto:help@vibecut.com" className="mt-6 inline-flex text-lg font-medium text-[hsl(var(--foreground))] underline underline-offset-4">
              help@vibecut.com
            </Link>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[1.6rem] bg-[hsl(var(--card))] p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">{faq.question}</h3>
                <p className="mt-3 text-base leading-8 text-[hsl(var(--muted-foreground))]">{faq.answer}</p>
              </div>
            ))}

          <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.72)] p-6">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Start the workflow</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">Open your next edit faster.</p>
            <div className="mt-6 space-y-3">
              <Link href={primaryHref} className="btn-primary w-full justify-center whitespace-nowrap">
                {primaryLabel}
              </Link>
              <Link href="/dashboard/projects/new" className="btn-ghost w-full justify-center">
                Create a project
              </Link>
            </div>
            <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] sm:whitespace-nowrap">{riskReducer}</p>
            <p className="mt-4 text-xs leading-6 text-[hsl(var(--muted-foreground))]">
              Sign in with Google, create the project, upload the source, and move directly into the editor.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell page-section pt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {stats.map(([stat, text]) => (
            <div key={stat} className="rounded-[2rem] bg-[hsl(var(--card))] p-8 text-center shadow-sm">
              <p className="text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{stat}</p>
              <p className="mt-4 text-lg leading-8 text-[hsl(var(--muted-foreground))]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="page-shell page-section pt-0">
        <div className="rounded-[2.5rem] bg-[#161616] px-6 py-12 text-center text-white sm:px-10 lg:px-14 lg:py-16">
          <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Join creators turning long videos into polished clips faster.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-10 text-white/70">
            Start with Google, upload the source, edit from the transcript, and export the final cut without the usual timeline drag.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <StoreButton eyebrow="Start with" label="Google Sign In" href={primaryHref} />
            <StoreButton eyebrow="See the" label="Pricing" href="#pricing" />
      <section className="page-shell page-section pt-0">
        <div className="hero-card spotlight-border flex flex-col items-start gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div>
            <span className="section-label">Final CTA</span>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Stop losing time in the timeline. Start editing from the story.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">
              VibeCut is built to help recurring creators cut faster, revise safely, and publish more consistently.
            </p>
          </div>

          <div>
            <div className="funnel-row">
              <Link href={primaryHref} className="btn-primary">
                {primaryLabel}
              </Link>
              <Link href="#faq" className="btn-ghost">
                Read FAQ
              </Link>
            </div>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] sm:whitespace-nowrap">{riskReducer}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
