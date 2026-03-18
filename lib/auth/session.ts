import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type AppUser = {
  id: string;
  email: string;
  name: string | null;
};

async function getOrCreateAppUser(email: string, name?: string | null, image?: string | null) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: userRow, error } = await supabase
    .from('users')
    .upsert(
      {
        email: normalizedEmail,
        full_name: name ?? null,
        avatar_url: image ?? null,
        provider: 'google'
      },
      { onConflict: 'email' }
    )
    .select('id,email,full_name')
    .single();

  if (error || !userRow) {
    throw new Error(error?.message ?? 'Unable to create user profile');
  }

  return {
    id: userRow.id,
    email: userRow.email,
    name: userRow.full_name ?? name ?? null
  };
}

export async function requireUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error('Unauthorized');
  }

  const user = await getOrCreateAppUser(email, session.user?.name, session.user?.image);
  const supabase = getSupabaseAdmin();

  return { supabase, user: user as AppUser };
}
