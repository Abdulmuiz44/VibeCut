import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import {
  createLemonSqueezyCustomer,
  getLemonSqueezyPortalUrl,
  retrieveLemonSqueezyCustomer,
  retrieveLemonSqueezySubscription
} from '@/lib/billing/lemonsqueezy';
import { getBillingAccount } from '@/lib/billing/account';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await getBillingAccount(supabase, user.id);
  let customerId = billing?.lemonsqueezy_customer_id ?? null;
  let portalUrl = billing?.lemonsqueezy_customer_portal_url ?? null;

  if (!customerId) {
    const customer = await createLemonSqueezyCustomer({
      email: user.email,
      name: user.name,
      userId: user.id
    });
    customerId = customer.data.id;
    await supabase.from('billing_accounts').upsert({
      user_id: user.id,
      lemonsqueezy_customer_id: customerId,
      status: billing?.status ?? 'inactive',
      plan: billing?.plan ?? 'Creator'
    });
  }

  if (!portalUrl && billing?.lemonsqueezy_subscription_id) {
    try {
      const subscription = await retrieveLemonSqueezySubscription(billing.lemonsqueezy_subscription_id);
      portalUrl = subscription.data.attributes.urls?.customer_portal ?? null;
    } catch {
      portalUrl = null;
    }
  }

  if (!portalUrl && customerId) {
    try {
      const customer = await retrieveLemonSqueezyCustomer(customerId);
      portalUrl = customer.data.attributes.urls?.customer_portal ?? null;
    } catch {
      portalUrl = null;
    }
  }

  if (!portalUrl) {
    portalUrl = getLemonSqueezyPortalUrl();
  }

  return NextResponse.json({ url: portalUrl });
}
