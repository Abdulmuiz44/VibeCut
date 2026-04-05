import { notFound } from 'next/navigation';
import { UploadPanel } from '@/components/upload/upload-panel';
import { EditorShell } from '@/components/editor/editor-shell';
import { requireUser } from '@/lib/auth/session';

export default async function ProjectEditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).eq('user_id', user.id).single();
  if (!project) notFound();

  const { data: sequence } = await supabase.from('sequences').select('*, sequence_segments(*)').eq('id', project.active_sequence_id).maybeSingle();
  const { data: transcriptSegments } = await supabase
    .from('transcript_segments')
    .select('*')
    .eq('transcript_id', project.active_transcript_id)
    .order('segment_index', { ascending: true });

  const isDraft = project.status === 'draft';

  return (
    <main className="page-shell py-6 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="glass-card p-6">
            <span className="section-label">Project</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{project.title}</h1>
            <p className="section-copy">
              {isDraft
                ? 'Upload a source clip to generate the transcript, sequence, and export context.'
                : 'Review the timeline, adjust the edit, and export the final cut when it is ready.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1">{project.status}</span>
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1">{project.active_sequence_id ? 'Sequence ready' : 'Waiting on sequence'}</span>
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1">{project.active_transcript_id ? 'Transcript ready' : 'Waiting on transcript'}</span>
            </div>
          </div>

          <div className="surface-card p-5">
            <p className="section-label">Project details</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                <span className="text-slate-500">Project ID</span>
                <span className="font-mono text-xs text-slate-200">{project.id}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                <span className="text-slate-500">Mode</span>
                <span className="text-slate-200">{isDraft ? 'Upload first' : 'Editing'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                <span className="text-slate-500">Transcript markers</span>
                <span className="text-slate-200">{transcriptSegments?.length ?? 0}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-0">
          {isDraft ? (
            <div className="hero-card h-full">
              <div className="rounded-[1.5rem] border border-slate-800 bg-[#0b0f14] p-6 lg:p-8">
                <p className="section-label">Upload</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Drop in the source video.</h2>
                <p className="muted mt-3 max-w-2xl leading-7">
                  VibeCut will create the transcript and editing context automatically, then bring you straight back here.
                </p>
                <UploadPanel projectId={project.id} />
              </div>
            </div>
          ) : sequence ? (
            <div className="min-h-0 rounded-[2rem] border border-slate-800 bg-slate-950/40 p-3 shadow-2xl shadow-black/20">
              <EditorShell project={project} sequence={sequence} transcriptSegments={transcriptSegments ?? []} />
            </div>
          ) : (
            <div className="surface-card flex min-h-[420px] flex-col items-start justify-center p-8">
              <p className="section-label">Workspace unavailable</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">This project has not finished preparing yet.</h2>
              <p className="section-copy max-w-2xl">
                The upload may still be processing or the editor context has not been generated yet. Refresh the page in a moment.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}