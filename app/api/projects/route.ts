import { NextRequest, NextResponse } from 'next/server';
import { createProjectSchema } from '@/lib/validation/project';
import { requireUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const parsed = createProjectSchema.parse(await request.json());
  const { data, error } = await supabase.from('projects').insert({ title: parsed.title, user_id: user.id }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
