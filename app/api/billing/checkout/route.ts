import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { createLemonSqueezyCheckout, createLemonSqueezyCustomer } from '@/lib/billing/lemonsqueezy';
import { getBillingAccount } from '@/lib/billing/account';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await getBillingAccount(supabase, user.id);
  let customerId = billing?.lemonsqueezy_customer_id ?? null;

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
      plan: billing?.plan ?? 'Creator',
      lemonsqueezy_variant_id: billing?.lemonsqueezy_variant_id ?? null
    });
  }

  const origin = request.nextUrl.origin;
  const checkout = await createLemonSqueezyCheckout({
    customerEmail: user.email,
    customerName: user.name,
    userId: user.id,
    redirectUrl: `${origin}/dashboard?billing=success`
  });

  await supabase.from('billing_accounts').upsert({
    user_id: user.id,
    lemonsqueezy_customer_id: customerId,
    status: billing?.status ?? 'inactive',
    plan: 'Creator',
    lemonsqueezy_checkout_id: checkout.data.id,
    lemonsqueezy_variant_id: billing?.lemonsqueezy_variant_id ?? null
  });

  return NextResponse.json({ url: checkout.data.attributes.url });
}
