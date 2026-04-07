import type { SupabaseClient } from '@supabase/supabase-js';

export type BillingAccountRow = {
  user_id: string;
  lemonsqueezy_customer_id: string | null;
  lemonsqueezy_subscription_id: string | null;
  lemonsqueezy_variant_id: string | null;
  lemonsqueezy_customer_portal_url: string | null;
  lemonsqueezy_checkout_id: string | null;
  status: string;
  plan: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at?: string;
};

export function isBillingActive(account?: BillingAccountRow | null) {
  if (!account) return false;
  if (['inactive', 'expired'].includes(account.status)) return false;
  if (!account.current_period_end) return true;
  return new Date(account.current_period_end).getTime() > Date.now();
}

export async function getBillingAccount(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from('billing_accounts').select('*').eq('user_id', userId).maybeSingle();
  return (data ?? null) as BillingAccountRow | null;
}

export async function requireActiveBilling(supabase: SupabaseClient, userId: string) {
  const account = await getBillingAccount(supabase, userId);
  return {
    account,
    active: isBillingActive(account)
  };
}

export function billingPlanLabel(account?: BillingAccountRow | null) {
  if (!account) return 'No plan';
  if (account.plan) return account.plan;
  return account.status.replaceAll('_', ' ');
}
