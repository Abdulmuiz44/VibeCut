import Link from 'next/link';
import { signOut } from '@/auth';
import { requireUser } from '@/lib/auth/session';

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

  const totalProjects = projects?.length ?? 0;
  const latestProject = projects?.[0] ?? null;

  return (
    <main className="page-shell py-10 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6 lg:p-8">
          <span className="section-label">Dashboard</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Your project workspace.</h1>
          <p className="section-copy">
            Create a new edit, return to the latest project, or review what is ready to ship.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/projects/new" className="btn-primary">
              New project
            </Link>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="stat-pill">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Projects</p>
            <p className="mt-3 text-4xl font-semibold text-white">{totalProjects}</p>
            <p className="mt-2 text-sm text-slate-400">Projects in your workspace.</p>
          </div>
          <div className="stat-pill">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Latest</p>
            <p className="mt-3 text-xl font-semibold text-white">{latestProject?.title ?? 'No project yet'}</p>
            <p className="mt-2 text-sm text-slate-400">{latestProject?.status ?? 'Create your first upload to start editing.'}</p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Projects</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Recent work.</h2>
          </div>
          <p className="muted max-w-lg">Each project carries the transcript, sequence, and export history for a single edit loop.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects?.length ? (
            projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="glass-card p-5 transition hover:border-emerald-400/50 hover:bg-slate-950/70">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{project.status}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-300">Open</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-400">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">Transcript-led</div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">Export ready</div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">AI assisted</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="glass-card border-dashed p-8 text-center">
              <p className="text-lg font-semibold text-white">No projects yet.</p>
              <p className="muted mt-2">Start with a source video and VibeCut will build the edit context.</p>
              <Link href="/dashboard/projects/new" className="btn-primary mt-6 inline-flex">
                Create project
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
