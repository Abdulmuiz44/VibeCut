import { NextRequest, NextResponse } from 'next/server';
import { createUploadSchema } from '@/lib/validation/project';
import { requireUser } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
  const { user } = await requireUser();
  const input = createUploadSchema.parse(await request.json());
  const storagePath = `${user.id}/${input.projectId}/${crypto.randomUUID()}-${input.fileName}`;
  const supabaseAdmin = getSupabaseAdmin();

  const { data: asset } = await supabaseAdmin
    .from('assets')
    .insert({ user_id: user.id, project_id: input.projectId, kind: 'source', storage_path: storagePath, mime_type: input.mimeType, size_bytes: input.sizeBytes })
    .select('id')
    .single();

  const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`;
  return NextResponse.json({ uploadUrl, assetId: asset?.id, storagePath });
}

export async function PUT(request: NextRequest) {
  const { user } = await requireUser();
  const { projectId, assetId } = await request.json();
  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin.from('projects').update({ source_asset_id: assetId, status: 'transcribing' }).eq('id', projectId).eq('user_id', user.id);
  await inngest.send({ name: 'vibecut/asset.uploaded', data: { projectId, assetId } });
  return NextResponse.json({ ok: true });
}
