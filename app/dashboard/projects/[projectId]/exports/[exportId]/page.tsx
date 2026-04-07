import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';

export default async function ExportPage({ params }: { params: Promise<{ projectId: string; exportId: string }> }) {
  const { exportId, projectId } = await params;
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from('exports').select('*').eq('id', exportId).eq('user_id', user.id).single();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Export status</h1>
        <p className="muted mt-3">Status: {data?.status}</p>
        <p className="muted">Progress: {Math.round((data?.progress ?? 0) * 100)}%</p>
        {data?.output_url ? (
          <a className="btn-primary mt-4 inline-block" href={data.output_url}>
            Download MP4
          </a>
        ) : null}
        <div className="mt-8">
          <Link className="text-sm text-slate-400 underline" href={`/dashboard/projects/${projectId}`}>
            Back to editor
          </Link>
        </div>
      </div>
    </main>
  );
}