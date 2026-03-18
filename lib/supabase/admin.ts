import { createClient } from '@supabase/supabase-js';

function createSupabaseAdminClient(supabaseUrl: string, serviceRoleKey: string) {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

let adminClient: ReturnType<typeof createSupabaseAdminClient> | null = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }

  adminClient = createSupabaseAdminClient(supabaseUrl, serviceRoleKey);

  return adminClient;
}
