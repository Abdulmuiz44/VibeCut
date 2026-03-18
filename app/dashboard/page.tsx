import Link from 'next/link';
import { signOut } from '@/auth';
import { requireUser } from '@/lib/auth/session';

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your projects</h1>
          <p className="muted">Transcript-first video editing workflow.</p>
        </div>
        <div className="flex items-center gap-3">
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
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {projects?.length ? (
          projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="glass-card p-4 transition hover:border-emerald-400/50">
              <p className="font-medium">{project.title}</p>
              <p className="mt-1 text-xs text-slate-400">{project.status}</p>
            </Link>
          ))
        ) : (
          <p className="glass-card border-dashed p-8 text-center text-slate-400">No projects yet.</p>
        )}
      </div>
    </main>
  );
}