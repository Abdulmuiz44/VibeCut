import { createHash } from 'node:crypto';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type AppUser = {
  id: string;
  email: string;
  name: string | null;
};

function emailToStableUuid(email: string) {
  const bytes = createHash('sha256').update(email.trim().toLowerCase()).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function resolveAppUser(email: string, name?: string | null, image?: string | null) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackId = emailToStableUuid(normalizedEmail);

  try {
    const { data: existing, error: lookupError } = await supabase.from('users').select('id,email,full_name').eq('email', normalizedEmail).maybeSingle();

    if (lookupError) {
      return {
        id: fallbackId,
        email: normalizedEmail,
        name: name ?? null
      };
    }

    if (existing) {
      return {
        id: existing.id,
        email: existing.email,
        name: existing.full_name ?? name ?? null
      };
    }

    const { data: inserted } = await supabase
      .from('users')
      .upsert(
        {
          id: fallbackId,
          email: normalizedEmail,
          full_name: name ?? null,
          avatar_url: image ?? null,
          provider: 'google'
        },
        { onConflict: 'email' }
      )
      .select('id,email,full_name')
      .single();

    if (inserted) {
      return {
        id: inserted.id,
        email: inserted.email,
        name: inserted.full_name ?? name ?? null
      };
    }
  } catch {
    return {
      id: fallbackId,
      email: normalizedEmail,
      name: name ?? null
    };
  }

  return {
    id: fallbackId,
    email: normalizedEmail,
    name: name ?? null
  };
}

export async function requireUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error('Unauthorized');
  }

  const user = await resolveAppUser(email, session.user?.name, session.user?.image);
  const supabase = getSupabaseAdmin();

  return { supabase, user: user as AppUser };
}