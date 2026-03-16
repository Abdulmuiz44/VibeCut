import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';

export async function GET(_: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).eq('user_id', user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}
