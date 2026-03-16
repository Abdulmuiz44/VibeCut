import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { editOperationSchema } from '@/lib/validation/operations';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const body = await request.json();
  const parsed = editOperationSchema.parse({ operationType: body.operationType, payload: body.payload, summary: body.summary });

  const { error } = await supabase.from('edit_operations').insert({
    user_id: user.id,
    project_id: body.projectId,
    sequence_id: body.sequenceId,
    operation_type: parsed.operationType,
    source: 'user',
    payload: parsed.payload,
    summary: parsed.summary ?? null
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
