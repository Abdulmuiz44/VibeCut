import Link from 'next/link';
import { signOut } from '@/auth';
import { requireUser } from '@/lib/auth/session';
import { DuplicateProjectButton } from '@/components/dashboard/duplicate-project-button';
import { BillingActions } from '@/components/billing/billing-actions';
import { billingPlanLabel, getBillingAccount, isBillingActive } from '@/lib/billing/account';
import { formatBillingCycleLabel, getBillingCycleStart, shouldShowUpgradePrompt } from '@/lib/billing/usage';

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const cycleStart = getBillingCycleStart();

  const [{ data: projects }, { data: cycleProjects }, { data: cycleExports }, billing] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('projects').select('id,created_at').eq('user_id', user.id).gte('created_at', cycleStart.toISOString()),
    supabase.from('exports').select('id,created_at').eq('user_id', user.id).gte('created_at', cycleStart.toISOString()),
    getBillingAccount(supabase, user.id)
  ]);

  const totalProjects = projects?.length ?? 0;
  const latestProject = projects?.[0] ?? null;
  const cycleProjectCount = cycleProjects?.length ?? 0;
  const cycleExportCount = cycleExports?.length ?? 0;
  const showUpgradePrompt = shouldShowUpgradePrompt(cycleProjectCount, cycleExportCount);
  const billingActive = isBillingActive(billing);

  return (
    <main className="page-shell py-10 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hero-card spotlight-border p-6 sm:p-8 lg:p-10">
          <span className="section-label">Workspace</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-5xl lg:text-6xl">
            A calmer control room for your next cut.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">
            Create a new edit, return to the latest project, and keep exports, billing, and repeat publishing in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/projects/new" className="btn-primary">
              New project
            </Link>
            <BillingActions active={billingActive} planLabel={billingPlanLabel(billing)} className="contents" />
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/sign-in' });
              }}
            >
              <button type="submit" className="btn-ghost">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="stat-pill">
            <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">Plan</p>
            <p className="mt-3 text-2xl font-semibold text-[hsl(var(--foreground))]">{billingActive ? 'Active' : 'Inactive'}</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{billingPlanLabel(billing)}</p>
          </div>
          <div className="stat-pill">
            <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">Projects</p>
            <p className="mt-3 text-4xl font-semibold text-[hsl(var(--foreground))]">{totalProjects}</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Tracked in your workspace.</p>
          </div>
          <div className="stat-pill">
            <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">Latest</p>
            <p className="mt-3 text-xl font-semibold text-[hsl(var(--foreground))]">{latestProject?.title ?? 'No project yet'}</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{latestProject?.status ?? 'Create your first project to begin.'}</p>
          </div>
        </div>
      </section>

      {showUpgradePrompt ? (
        <section className="page-section pb-0">
          <div className="surface-card--featured flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="section-label">Usage fit</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">You are actively publishing this cycle.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">
                You created {cycleProjectCount} projects and queued {cycleExportCount} exports in {formatBillingCycleLabel()}.
              </p>
            </div>
            <Link href="/#pricing" className="btn-primary">
              Review plans
            </Link>
          </div>
        </section>
      ) : null}

      <section className="page-section">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Recent work</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">Projects that are still in motion.</h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-[hsl(var(--muted-foreground))]">
            Each project keeps the transcript, edit history, exports, and restore points together so iteration stays fast.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {projects?.length ? (
            projects.map((project) => (
              <div key={project.id} className="glass-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{project.title}</p>
                    <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{project.status}</p>
                  </div>
                  <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.7)] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {project.active_sequence_id ? 'Sequence ready' : 'Preparing'}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.64)] px-3 py-3">Transcript-backed</div>
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.64)] px-3 py-3">History safe</div>
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.64)] px-3 py-3">Export queue</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/dashboard/projects/${project.id}`} className="btn-primary">
                    Open project
                  </Link>
                  <DuplicateProjectButton projectId={project.id} projectTitle={project.title} />
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-lg font-semibold text-[hsl(var(--foreground))]">No projects yet.</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Start with a source video and VibeCut will build the editing context.</p>
              <Link href="/dashboard/projects/new" className="btn-primary mt-6">
                Create project
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
