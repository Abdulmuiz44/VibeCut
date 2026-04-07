import { inngest } from './client';
import { logger } from '@/lib/utils/logger';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureEditorWorkspace } from '@/lib/transcript/bootstrap';
import { getRenderer } from '@/lib/remotion';

function getSafeExportFileName(storagePath?: string | null, exportId?: string) {
  const baseName = storagePath?.split('/').pop() || `${exportId ?? 'export'}.mp4`;
  const cleaned = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (cleaned.includes('.')) return cleaned;
  return `${cleaned}.mp4`;
}

export const transcribeAsset = inngest.createFunction(
  { id: 'transcribe-asset' },
  { event: 'vibecut/asset.uploaded' },
  async ({ event }) => {
    const { projectId, assetId } = event.data as { projectId: string; assetId: string };
    logger.info('transcription.started', { projectId, assetId });
    const supabaseAdmin = getSupabaseAdmin();

    const result = await ensureEditorWorkspace({ supabase: supabaseAdmin, projectId, assetId });
    if (!result.ok) {
      logger.error('transcription.failed', { projectId, assetId, reason: result.reason });
      return { ok: false, reason: result.reason };
    }

    logger.info('transcription.completed', { projectId, assetId, transcriptId: result.transcriptId, sequenceId: result.sequenceId });
    return { ok: true };
  }
);

export const renderExport = inngest.createFunction(
  { id: 'render-export' },
  { event: 'vibecut/export.requested' },
  async ({ event }) => {
    const { exportId } = event.data as { exportId: string };
    const supabaseAdmin = getSupabaseAdmin();
    const renderer = getRenderer();

    try {
      const { data: exportRow, error: exportError } = await supabaseAdmin
        .from('exports')
        .select('id,project_id,sequence_id,preset')
        .eq('id', exportId)
        .maybeSingle();

      if (exportError || !exportRow) {
        throw new Error(exportError?.message ?? 'Export row not found');
      }

      const { data: project } = await supabaseAdmin.from('projects').select('id,title,source_asset_id').eq('id', exportRow.project_id).maybeSingle();
      if (!project) {
        throw new Error('Project not found for export');
      }

      const { data: sourceAsset } = project.source_asset_id
        ? await supabaseAdmin.from('assets').select('id,storage_path,mime_type,size_bytes').eq('id', project.source_asset_id).maybeSingle()
        : { data: null };

      let asset = sourceAsset;
      if (!asset) {
        const { data: firstSequenceSegment } = await supabaseAdmin
          .from('sequence_segments')
          .select('source_asset_id')
          .eq('sequence_id', exportRow.sequence_id)
          .order('timeline_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (firstSequenceSegment?.source_asset_id) {
          const { data: fallbackAsset } = await supabaseAdmin
            .from('assets')
            .select('id,storage_path,mime_type,size_bytes')
            .eq('id', firstSequenceSegment.source_asset_id)
            .maybeSingle();
          asset = fallbackAsset;
        }
      }

      if (!asset) {
        throw new Error('Source asset not found for export');
      }

      await supabaseAdmin.from('exports').update({ status: 'processing', progress: 0.2, error_message: null }).eq('id', exportId);
      await supabaseAdmin.from('job_runs').update({ status: 'processing' }).contains('metadata', { exportId });

      const { outputPath, durationMs } = await renderer.render({
        exportId,
        compositionProps: {
          projectId: project.id,
          projectTitle: project.title,
          sourceAssetId: asset.id
        },
        outputPath: `exports/${exportId}/${getSafeExportFileName(asset.storage_path, exportId)}`
      });

      const { data: sourceFile, error: downloadError } = await supabaseAdmin.storage.from('source-videos').download(asset.storage_path);
      if (downloadError || !sourceFile) {
        throw downloadError ?? new Error('Unable to download source media');
      }

      const uploadBuffer = Buffer.from(await sourceFile.arrayBuffer());
      const { error: uploadError } = await supabaseAdmin.storage.from('source-videos').upload(outputPath, uploadBuffer, {
        contentType: asset.mime_type,
        upsert: true
      });
      if (uploadError) {
        throw uploadError;
      }

      const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage.from('source-videos').createSignedUrl(outputPath, 60 * 60 * 24);
      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw signedUrlError ?? new Error('Unable to create signed download URL');
      }

      await supabaseAdmin.from('exports').update({ status: 'processing', progress: 0.75, output_storage_path: outputPath, duration_ms: durationMs }).eq('id', exportId);
      await supabaseAdmin.from('exports').update({ status: 'completed', progress: 1, output_url: signedUrlData.signedUrl, output_storage_path: outputPath, duration_ms: durationMs }).eq('id', exportId);
      await supabaseAdmin.from('job_runs').update({ status: 'completed' }).contains('metadata', { exportId });
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      await supabaseAdmin.from('exports').update({ status: 'failed', error_message: message }).eq('id', exportId);
      await supabaseAdmin.from('job_runs').update({ status: 'failed', metadata: { exportId, error: message } }).contains('metadata', { exportId });
      logger.error('export.failed', { exportId, message });
      return { ok: false, reason: message };
    }
  }
);
