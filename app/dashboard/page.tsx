import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your projects</h1>
          <p className="muted">Transcript-first video editing workflow.</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary">
          New project
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {projects?.length ? (
          projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="glass-card p-4 transition hover:opacity-95">
              <p className="font-medium">{project.title}</p>
              <p className="mt-1 text-xs muted">{project.status}</p>
            </Link>
          ))
        ) : (
          <p className="glass-card border-dashed p-8 text-center muted">No projects yet.</p>
        )}
      </div>
    </main>
  );
}
