import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { UploadPanel } from '@/components/upload/upload-panel';
import { EditorShell } from '@/components/editor/editor-shell';

export default async function ProjectEditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).eq('user_id', user?.id).single();
  if (!project) notFound();

  const { data: sequence } = await supabase.from('sequences').select('*, sequence_segments(*)').eq('id', project.active_sequence_id).single();
  const { data: transcriptSegments } = await supabase
    .from('transcript_segments')
    .select('*')
    .eq('transcript_id', project.active_transcript_id)
    .order('segment_index', { ascending: true });

  return (
    <main className="h-screen overflow-hidden p-4">
      {project.status === 'draft' ? (
        <UploadPanel projectId={project.id} />
      ) : (
        <EditorShell project={project} sequence={sequence} transcriptSegments={transcriptSegments ?? []} />
      )}
    </main>
  );
}
