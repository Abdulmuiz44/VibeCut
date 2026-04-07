import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { requireActiveBilling } from '@/lib/billing/account';

type TranscriptSegmentRow = {
  id: string;
  start_ms: number;
  end_ms: number;
  text: string;
  confidence: number | null;
  speaker: string | null;
  segment_index: number;
};

type SequenceSegmentRow = {
  id: string;
  source_transcript_segment_id: string | null;
  source_asset_id: string;
  start_ms: number;
  end_ms: number;
  timeline_order: number;
  include_in_export: boolean;
  segment_role: string;
  metadata: Record<string, unknown>;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to duplicate projects', billing_required: true }, { status: 402 });
  }

  const { title } = await request.json();

  const { data: sourceProject, error: projectError } = await supabase.from('projects').select('*').eq('id', projectId).eq('user_id', user.id).maybeSingle();
  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 400 });
  }

  if (!sourceProject) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const [sequenceResult, transcriptResult, operationsResult, snapshotsResult] = await Promise.all([
    sourceProject.active_sequence_id
      ? supabase.from('sequences').select('*, sequence_segments(*)').eq('id', sourceProject.active_sequence_id).maybeSingle()
      : Promise.resolve({ data: null }),
    sourceProject.active_transcript_id
      ? supabase
          .from('transcript_segments')
          .select('*')
          .eq('transcript_id', sourceProject.active_transcript_id)
          .order('segment_index', { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase.from('edit_operations').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
    supabase.from('sequence_snapshots').select('*').eq('project_id', projectId).eq('user_id', user.id).order('created_at', { ascending: true })
  ]);

  const sourceSequence = sequenceResult.data;
  const sourceTranscriptSegments = (transcriptResult.data ?? []) as TranscriptSegmentRow[];
  const sourceOperations = operationsResult.data ?? [];
  const sourceSnapshots = snapshotsResult.data ?? [];

  const { data: duplicatedProject, error: duplicateProjectError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: title?.trim() || `${sourceProject.title} Copy`,
      status: sourceProject.status === 'draft' ? 'draft' : 'ready_for_editing',
      source_asset_id: sourceProject.source_asset_id,
      active_transcript_id: null,
      active_sequence_id: null
    })
    .select('*')
    .single();

  if (duplicateProjectError || !duplicatedProject) {
    return NextResponse.json({ error: duplicateProjectError?.message ?? 'Unable to duplicate project' }, { status: 400 });
  }

  let transcriptId: string | null = null;
  let sequenceId: string | null = null;

  if (sourceProject.active_transcript_id && sourceTranscriptSegments.length) {
    const { data: transcriptRow, error: transcriptInsertError } = await supabase
      .from('transcripts')
      .insert({
        user_id: user.id,
        project_id: duplicatedProject.id,
        asset_id: sourceProject.source_asset_id,
        provider: 'duplicate',
        language: 'en',
        status: 'completed',
        raw_response: { duplicated: true }
      })
      .select('*')
      .single();

    if (transcriptInsertError || !transcriptRow) {
      return NextResponse.json({ error: transcriptInsertError?.message ?? 'Unable to duplicate transcript' }, { status: 400 });
    }

    transcriptId = transcriptRow.id;

    const { data: insertedTranscriptSegments, error: transcriptSegmentsError } = await supabase
      .from('transcript_segments')
      .insert(
        sourceTranscriptSegments.map((segment) => ({
          transcript_id: transcriptId,
          project_id: duplicatedProject.id,
          speaker: segment.speaker,
          start_ms: segment.start_ms,
          end_ms: segment.end_ms,
          text: segment.text,
          confidence: segment.confidence,
          segment_index: segment.segment_index
        }))
      )
      .select('*')
      .order('segment_index', { ascending: true });

    if (transcriptSegmentsError) {
      return NextResponse.json({ error: transcriptSegmentsError.message }, { status: 400 });
    }

    const transcriptSegmentMap = new Map<string, string>();
    sourceTranscriptSegments.forEach((segment, index) => {
      const inserted = insertedTranscriptSegments?.[index];
      if (inserted) transcriptSegmentMap.set(segment.id, inserted.id);
    });

    if (sourceSequence) {
      const { data: sequenceRow, error: sequenceInsertError } = await supabase
        .from('sequences')
        .insert({
          user_id: user.id,
          project_id: duplicatedProject.id,
          name: `${sourceSequence.name} Copy`,
          aspect_ratio: sourceSequence.aspect_ratio,
          caption_theme: sourceSequence.caption_theme,
          settings: sourceSequence.settings
        })
        .select('*')
        .single();

      if (sequenceInsertError || !sequenceRow) {
        return NextResponse.json({ error: sequenceInsertError?.message ?? 'Unable to duplicate sequence' }, { status: 400 });
      }

      sequenceId = sequenceRow.id;

      const sourceSequenceSegments = (sourceSequence.sequence_segments ?? []) as SequenceSegmentRow[];
      if (sourceSequenceSegments.length) {
        const { error: sequenceSegmentsInsertError } = await supabase.from('sequence_segments').insert(
          sourceSequenceSegments.map((segment) => ({
            sequence_id: sequenceId,
            source_transcript_segment_id: segment.source_transcript_segment_id ? transcriptSegmentMap.get(segment.source_transcript_segment_id) ?? null : null,
            source_asset_id: segment.source_asset_id,
            start_ms: segment.start_ms,
            end_ms: segment.end_ms,
            timeline_order: segment.timeline_order,
            include_in_export: segment.include_in_export,
            segment_role: segment.segment_role,
            metadata: segment.metadata
          }))
        );

        if (sequenceSegmentsInsertError) {
          return NextResponse.json({ error: sequenceSegmentsInsertError.message }, { status: 400 });
        }
      }
    }
  } else if (sourceSequence) {
    const { data: sequenceRow, error: sequenceInsertError } = await supabase
      .from('sequences')
      .insert({
        user_id: user.id,
        project_id: duplicatedProject.id,
        name: `${sourceSequence.name} Copy`,
        aspect_ratio: sourceSequence.aspect_ratio,
        caption_theme: sourceSequence.caption_theme,
        settings: sourceSequence.settings
      })
      .select('*')
      .single();

    if (sequenceInsertError || !sequenceRow) {
      return NextResponse.json({ error: sequenceInsertError?.message ?? 'Unable to duplicate sequence' }, { status: 400 });
    }

    sequenceId = sequenceRow.id;
    const sourceSequenceSegments = (sourceSequence.sequence_segments ?? []) as SequenceSegmentRow[];
    if (sourceSequenceSegments.length) {
      const { error: sequenceSegmentsInsertError } = await supabase.from('sequence_segments').insert(
        sourceSequenceSegments.map((segment) => ({
          sequence_id: sequenceId,
          source_transcript_segment_id: segment.source_transcript_segment_id,
          source_asset_id: segment.source_asset_id,
          start_ms: segment.start_ms,
          end_ms: segment.end_ms,
          timeline_order: segment.timeline_order,
          include_in_export: segment.include_in_export,
          segment_role: segment.segment_role,
          metadata: segment.metadata
        }))
      );

      if (sequenceSegmentsInsertError) {
        return NextResponse.json({ error: sequenceSegmentsInsertError.message }, { status: 400 });
      }
    }
  }

  if (sequenceId && sourceOperations.length) {
    const { error: operationsInsertError } = await supabase.from('edit_operations').insert(
      sourceOperations.map((operation) => ({
        user_id: user.id,
        project_id: duplicatedProject.id,
        sequence_id: sequenceId,
        operation_type: operation.operation_type,
        source: 'duplicate',
        status: operation.status,
        payload: operation.payload,
        summary: operation.summary
      }))
    );

    if (operationsInsertError) {
      return NextResponse.json({ error: operationsInsertError.message }, { status: 400 });
    }
  }

  if (sequenceId && sourceSnapshots.length) {
    const { error: snapshotsInsertError } = await supabase.from('sequence_snapshots').insert(
      sourceSnapshots.map((snapshot) => ({
        user_id: user.id,
        project_id: duplicatedProject.id,
        sequence_id: sequenceId,
        label: `${snapshot.label} (Copy)`,
        operations_snapshot: snapshot.operations_snapshot
      }))
    );

    if (snapshotsInsertError) {
      return NextResponse.json({ error: snapshotsInsertError.message }, { status: 400 });
    }
  }

  const { error: projectUpdateError } = await supabase
    .from('projects')
    .update({
      active_transcript_id: transcriptId,
      active_sequence_id: sequenceId,
      status: sourceProject.status === 'draft' ? 'draft' : 'ready_for_editing'
    })
    .eq('id', duplicatedProject.id);

  if (projectUpdateError) {
    return NextResponse.json({ error: projectUpdateError.message }, { status: 400 });
  }

  return NextResponse.json({ id: duplicatedProject.id });
}
