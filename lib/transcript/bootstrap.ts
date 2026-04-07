import { transcribeFromUrl } from '@/lib/transcript/transcribe';

type SupabaseAdminClient = {
  from: (table: string) => {
    select: (columns: string) => any;
    insert: (values: Record<string, unknown> | Record<string, unknown>[]) => any;
    update: (values: Record<string, unknown>) => any;
  };
  storage: {
    from: (bucket: string) => {
      download: (path: string) => Promise<{ data: Blob | null; error: Error | null }>;
    };
  };
};

type AssetRecord = {
  id: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  duration_ms: number | null;
};

type ProjectRecord = {
  id: string;
  title: string;
  user_id: string;
  active_transcript_id: string | null;
  active_sequence_id: string | null;
};

type TranscriptSourceSegment = {
  text: string;
  start_ms: number;
  end_ms: number;
  confidence?: number | null;
};

const FALLBACK_SEGMENT_TEXTS = [
  'Open with the core idea in the first few seconds.',
  'Build context with one clear example and a practical takeaway.',
  'Trim the dead air and keep the pacing moving.',
  'End on a repeatable closing line that encourages the next clip.'
];

function safeTranscriptText(value: unknown, projectTitle: string, index: number) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return `${projectTitle} segment ${index + 1}`;
}

function buildFallbackSegments(projectTitle: string, durationMs: number) {
  const segmentCount = 4;
  const segmentLength = Math.max(4000, Math.floor(durationMs / segmentCount));

  return Array.from({ length: segmentCount }, (_, index) => {
    const start_ms = Math.min(durationMs - 100, index * segmentLength);
    const end_ms = index === segmentCount - 1 ? durationMs : Math.min(durationMs, start_ms + segmentLength);
    return {
      text: `${projectTitle}: ${FALLBACK_SEGMENT_TEXTS[index]}`,
      start_ms,
      end_ms: Math.max(start_ms + 1000, end_ms),
      confidence: 0.7
    };
  });
}

function normalizeSegments(response: unknown, projectTitle: string, durationMs: number) {
  const maybeObject = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
  const rawSegments = Array.isArray(maybeObject.segments) ? maybeObject.segments : null;

  if (!rawSegments?.length) {
    return buildFallbackSegments(projectTitle, durationMs);
  }

  return rawSegments
    .map((segment, index) => {
      if (!segment || typeof segment !== 'object') return null;
      const candidate = segment as Record<string, unknown>;
      const start = typeof candidate.start === 'number' ? candidate.start : typeof candidate.start_ms === 'number' ? candidate.start_ms / 1000 : null;
      const end = typeof candidate.end === 'number' ? candidate.end : typeof candidate.end_ms === 'number' ? candidate.end_ms / 1000 : null;
      const text = safeTranscriptText(candidate.text, projectTitle, index);

      if (start === null || end === null) return null;

      return {
        text,
        start_ms: Math.max(0, Math.round(start * 1000)),
        end_ms: Math.max(Math.round(start * 1000) + 100, Math.round(end * 1000)),
        confidence: typeof candidate.confidence === 'number' ? candidate.confidence : null
      };
    })
    .filter(Boolean) as TranscriptSourceSegment[];
}

function deriveDurationMs(asset: AssetRecord) {
  return asset.duration_ms ?? Math.max(30000, Math.min(180000, Math.round((asset.size_bytes / 1_000_000) * 6000)));
}

export async function ensureEditorWorkspace({
  supabase,
  projectId,
  assetId
}: {
  supabase: SupabaseAdminClient;
  projectId: string;
  assetId: string;
}) {
  const { data: project } = await supabase
    .from('projects')
    .select('id,title,user_id,active_transcript_id,active_sequence_id')
    .eq('id', projectId)
    .maybeSingle();

  const { data: asset } = await supabase
    .from('assets')
    .select('id,storage_path,mime_type,size_bytes,duration_ms')
    .eq('id', assetId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (!project || !asset) {
    return { ok: false as const, reason: 'Project or asset not found' };
  }

  if (project.active_transcript_id && project.active_sequence_id) {
    await supabase.from('projects').update({ status: 'ready_for_editing' }).eq('id', projectId);
    return { ok: true as const, transcriptId: project.active_transcript_id, sequenceId: project.active_sequence_id };
  }

  const durationMs = deriveDurationMs(asset as AssetRecord);
  const fallbackSegments = buildFallbackSegments(project.title, durationMs);

  let transcriptPayload: unknown = null;
  try {
    const { data: blob, error: downloadError } = await supabase.storage.from('source-videos').download(asset.storage_path);
    if (downloadError || !blob) {
      throw downloadError ?? new Error('Unable to download source video for transcription');
    }

    const file = new File([blob], asset.storage_path.split('/').pop() ?? `${project.title}.mp4`, { type: asset.mime_type });
    transcriptPayload = await transcribeFromUrl(file);
  } catch {
    transcriptPayload = null;
  }

  const transcriptSegments = normalizeSegments(transcriptPayload, project.title, durationMs);
  const transcriptText =
    typeof transcriptPayload === 'object' && transcriptPayload && 'text' in transcriptPayload && typeof (transcriptPayload as Record<string, unknown>).text === 'string'
      ? (transcriptPayload as Record<string, string>).text
      : transcriptSegments.map((segment) => segment.text).join(' ');

  const { data: transcript, error: transcriptError } = await supabase
    .from('transcripts')
    .insert({
    user_id: project.user_id,
      project_id: projectId,
      asset_id: assetId,
      provider: transcriptPayload ? 'mistral' : 'fallback',
      language: typeof transcriptPayload === 'object' && transcriptPayload && 'language' in transcriptPayload ? String((transcriptPayload as Record<string, unknown>).language ?? 'en') : 'en',
      status: 'completed',
      raw_response: transcriptPayload ?? { fallback: true, segments: fallbackSegments, text: transcriptText }
    })
    .select('id')
    .single();

  if (transcriptError || !transcript) {
    return { ok: false as const, reason: transcriptError?.message ?? 'Transcript creation failed' };
  }

  const { data: sequence, error: sequenceError } = await supabase
    .from('sequences')
    .insert({
      user_id: project.user_id,
      project_id: projectId,
      name: `${project.title} primary cut`,
      aspect_ratio: '9:16',
      caption_theme: 'clean',
      settings: { source: transcriptPayload ? 'mistral' : 'fallback' }
    })
    .select('id')
    .single();

  if (sequenceError || !sequence) {
    return { ok: false as const, reason: sequenceError?.message ?? 'Sequence creation failed' };
  }

  const { data: transcriptRows, error: transcriptRowsError } = await supabase
    .from('transcript_segments')
    .insert(
      transcriptSegments.map((segment, index) => ({
        transcript_id: transcript.id,
        project_id: projectId,
        speaker: null,
        start_ms: segment.start_ms,
        end_ms: segment.end_ms,
        text: segment.text,
        confidence: segment.confidence ?? null,
        segment_index: index
      }))
    )
    .select('id,segment_index,start_ms,end_ms,text')
    .order('segment_index', { ascending: true });

  if (transcriptRowsError) {
    return { ok: false as const, reason: transcriptRowsError.message };
  }

  const segmentRows = transcriptRows ?? [];
  const { error: sequenceSegmentsError } = await supabase.from('sequence_segments').insert(
    segmentRows.map((segment: { id: string; start_ms: number; end_ms: number }, index: number) => ({
      sequence_id: sequence.id,
      source_transcript_segment_id: segment.id,
      source_asset_id: assetId,
      start_ms: segment.start_ms,
      end_ms: segment.end_ms,
      timeline_order: index,
      include_in_export: true,
      segment_role: 'speech',
      metadata: { source: transcriptPayload ? 'mistral' : 'fallback' }
    }))
  );

  if (sequenceSegmentsError) {
    return { ok: false as const, reason: sequenceSegmentsError.message };
  }

  const { error: projectUpdateError } = await supabase
    .from('projects')
    .update({
      status: 'ready_for_editing',
      active_transcript_id: transcript.id,
      active_sequence_id: sequence.id
    })
    .eq('id', projectId);

  if (projectUpdateError) {
    return { ok: false as const, reason: projectUpdateError.message };
  }

  return {
    ok: true as const,
    transcriptId: transcript.id,
    sequenceId: sequence.id
  };
}
