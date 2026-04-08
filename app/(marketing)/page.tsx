import Link from 'next/link';
import { auth } from '@/auth';

const valueProps = [
  {
    title: 'Edit from the transcript',
    description: 'Cut dead air, trim weak beats, and move through the story with text-first precision.'
  },
  {
    title: 'Review every AI suggestion',
    description: 'Use AI for speed, but keep every decision inspectable, reversible, and creator-controlled.'
  },
  {
    title: 'Ship weekly without burnout',
    description: 'A workflow built for repeat publishing, not one-off editing experiments.'
  }
];

const workflow = [
  ['01', 'Upload the long-form source', 'Bring in the original recording and let VibeCut prepare the transcript and sequence.'],
  ['02', 'Shape the story quickly', 'Cut directly from the transcript, tighten pacing, and restore anything you want back.'],
  ['03', 'Export polished social formats', 'Queue vertical, square, or landscape outputs with a clean review loop.']
] as const;

const proof = [
  'Transcript-backed timeline editing',
  'Restore points and project history',
  'Fast export handoff for repeat publishing'
];

export default async function MarketingPage() {
  const session = await auth();
  const primaryHref = session?.user ? '/dashboard' : '/sign-in';
  const primaryLabel = session?.user ? 'Open workspace' : 'Start editing';

  return (
    <main className="pb-20">
      <section className="page-shell page-section pt-10 sm:pt-14 lg:pt-16">
        <div className="hero-card spotlight-border poster-grid overflow-hidden p-0">
          <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.78fr_1.22fr] lg:px-10 lg:py-12">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <span className="section-label">Creator editing system</span>
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[hsl(var(--muted-foreground))]">VibeCut</p>
                  <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-6xl lg:text-7xl">
                    Edit faster than the timeline.
                  </h1>
                  <p className="max-w-lg text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">
                    The transcript-first studio for talking-head, podcast, and short-form creators who need clean weekly output.
                  </p>
                </div>
                <div className="funnel-row">
                  <Link href={primaryHref} className="btn-primary">
                    {primaryLabel}
                  </Link>
                  <Link href="#workflow" className="btn-ghost">
                    See workflow
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {proof.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.55)] px-4 py-4 text-sm text-[hsl(var(--foreground))]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="surface-card spotlight-border flex min-h-[480px] flex-col justify-between p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="section-label">Editing studio</span>
                  <span>Transcript → timeline → export</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Current cut</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">&ldquo;Hook tighter, pace cleaner, export ready.&rdquo;</p>
                  </div>
                  <div className="grid gap-3">
                    {['[00:02.4] Strong opening line', '[00:11.8] Remove dead air', '[00:29.1] Keep final CTA'].map((line) => (
                      <div key={line} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                    <p className="text-[hsl(var(--muted-foreground))]">Edit mode</p>
                    <p className="mt-2 font-medium text-[hsl(var(--foreground))]">Transcript</p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                    <p className="text-[hsl(var(--muted-foreground))]">Export</p>
                    <p className="mt-2 font-medium text-[hsl(var(--foreground))]">9:16 queued</p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                    <p className="text-[hsl(var(--muted-foreground))]">History</p>
                    <p className="mt-2 font-medium text-[hsl(var(--foreground))]">Restorable</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {valueProps.map((item) => (
                  <div key={item.title} className="surface-card p-5 sm:p-6">
                    <p className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="page-shell page-section">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">Workflow</span>
            <h2 className="mt-4 section-title max-w-3xl">A calmer path from raw recording to final clip.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">
            Each section does one job: prepare the edit, shape the story, then deliver the right format without extra friction.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {workflow.map(([step, title, description]) => (
            <div key={step} className="glass-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]">{step}</p>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="page-shell page-section pt-0">
        <div className="surface-card--featured grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="section-label">Subscription fit</span>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Built for creators who publish often enough that speed becomes part of the product.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">
              VibeCut earns its place by making the second, third, and tenth project feel lighter than the first.
            </p>
          </div>
          <div className="funnel-row">
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
            </Link>
            <Link href="/dashboard/projects/new" className="btn-ghost">
              Create a project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
