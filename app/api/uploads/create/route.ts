import { NextRequest, NextResponse } from 'next/server';
import { createUploadSchema } from '@/lib/validation/project';
import { requireUser } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { inngest } from '@/lib/inngest/client';
import { ensureEditorWorkspace } from '@/lib/transcript/bootstrap';
import { requireActiveBilling } from '@/lib/billing/account';

const SOURCE_BUCKET = 'source-videos';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to upload media', billing_required: true }, { status: 402 });
  }

  const input = createUploadSchema.parse(await request.json());
  const storagePath = `${user.id}/${input.projectId}/${crypto.randomUUID()}-${input.fileName}`;
  const supabaseAdmin = getSupabaseAdmin();

  const { data: asset } = await supabaseAdmin
    .from('assets')
    .insert({ user_id: user.id, project_id: input.projectId, kind: 'source', storage_path: storagePath, mime_type: input.mimeType, size_bytes: input.sizeBytes })
    .select('id')
    .single();

  const uploadEndpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`;
  return NextResponse.json({
    uploadEndpoint,
    bucketName: SOURCE_BUCKET,
    objectName: storagePath,
    assetId: asset?.id,
    storagePath
  });
}

export async function PUT(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to start transcription', billing_required: true }, { status: 402 });
  }

  const { projectId, assetId } = await request.json();
  const supabaseAdmin = getSupabaseAdmin();

  const { error: updateError } = await supabaseAdmin.from('projects').update({ source_asset_id: assetId, status: 'transcribing' }).eq('id', projectId).eq('user_id', user.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const workspaceResult = await ensureEditorWorkspace({ supabase: supabaseAdmin, projectId, assetId });
  if (!workspaceResult.ok) {
    return NextResponse.json({ error: workspaceResult.reason }, { status: 400 });
  }

  await inngest.send({ name: 'vibecut/asset.uploaded', data: { projectId, assetId } });
  return NextResponse.json({ ok: true });
}
