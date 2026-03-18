import { inngest } from './client';
import { logger } from '@/lib/utils/logger';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const transcribeAsset = inngest.createFunction(
  { id: 'transcribe-asset' },
  { event: 'vibecut/asset.uploaded' },
  async ({ event }) => {
    const { projectId, assetId } = event.data as { projectId: string; assetId: string };
    logger.info('transcription.started', { projectId, assetId });
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from('projects').update({ status: 'ready_for_editing' }).eq('id', projectId);
    logger.info('transcription.completed', { projectId, assetId });
    return { ok: true };
  }
);

export const renderExport = inngest.createFunction(
  { id: 'render-export' },
  { event: 'vibecut/export.requested' },
  async ({ event }) => {
    const { exportId } = event.data as { exportId: string };
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from('exports').update({ status: 'processing', progress: 0.4 }).eq('id', exportId);
    await supabaseAdmin.from('exports').update({ status: 'completed', progress: 1, output_url: 'signed-url-placeholder' }).eq('id', exportId);
    return { ok: true };
  }
);
