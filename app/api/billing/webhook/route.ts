import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { parseLemonSqueezyEvent, verifyLemonSqueezySignature } from '@/lib/billing/lemonsqueezy';

function resolveStatus(status: string | undefined) {
  return status ?? 'inactive';
}

function resolvePeriodEnd(attributes: { renews_at?: string | null; ends_at?: string | null }) {
  return attributes.renews_at ?? attributes.ends_at ?? null;
}

function resolvePlanName(name?: string | null) {
  return name ?? 'Creator';
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature') ?? request.headers.get('x-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Lemon Squeezy signature' }, { status: 400 });
  }

  try {
    verifyLemonSqueezySignature(rawBody, signature);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid signature' }, { status: 400 });
  }

  const event = parseLemonSqueezyEvent(rawBody);
  const eventName = event.meta?.event_name ?? event.data.type;
  const supabase = getSupabaseAdmin();
  const attributes = (event.data.attributes ?? {}) as {
    customer_id?: string | null;
    subscription_id?: string | null;
    status?: string;
    renews_at?: string | null;
    ends_at?: string | null;
    cancelled?: boolean | null;
    urls?: { customer_portal?: string | null };
    checkout_id?: string | null;
    first_order_item?: {
      variant_id?: number | string | null;
      variant_name?: string | null;
      product_name?: string | null;
    } | null;
    first_subscription_item?: {
      variant_id?: number | string | null;
      variant_name?: string | null;
      product_name?: string | null;
    } | null;
  };
  const customData = (event.meta as { custom_data?: Record<string, unknown> } | undefined)?.custom_data ?? {};
  const userId = typeof customData.user_id === 'string' ? customData.user_id : null;
  const customerId = attributes.customer_id ?? null;

  if (eventName === 'order_created') {
    if (userId) {
      const firstOrderItem = attributes.first_order_item ?? null;
      await supabase.from('billing_accounts').upsert({
        user_id: userId,
        lemonsqueezy_customer_id: customerId,
        lemonsqueezy_checkout_id: attributes.checkout_id ?? event.data.id,
        lemonsqueezy_variant_id: firstOrderItem?.variant_id != null ? String(firstOrderItem.variant_id) : null,
        status: 'active',
        plan: resolvePlanName(firstOrderItem?.variant_name ?? firstOrderItem?.product_name),
        current_period_end: resolvePeriodEnd(attributes),
        cancel_at_period_end: Boolean(attributes.cancelled ?? false),
        lemonsqueezy_customer_portal_url: attributes.urls?.customer_portal ?? null,
        updated_at: new Date().toISOString()
      });
    }
  }

  if (
    eventName === 'subscription_created' ||
    eventName === 'subscription_updated' ||
    eventName === 'subscription_resumed' ||
    eventName === 'subscription_paused' ||
    eventName === 'subscription_unpaused' ||
    eventName === 'subscription_plan_changed' ||
    eventName === 'subscription_cancelled' ||
    eventName === 'subscription_expired'
  ) {
    const { data: existing } = await supabase
      .from('billing_accounts')
      .select('user_id')
      .eq('lemonsqueezy_customer_id', customerId ?? '')
      .maybeSingle();

    const existingUserId = existing?.user_id ?? userId;
    if (existingUserId) {
      const firstSubscriptionItem = attributes.first_subscription_item ?? null;
      await supabase.from('billing_accounts').upsert({
        user_id: existingUserId,
        lemonsqueezy_customer_id: customerId,
        lemonsqueezy_subscription_id: event.data.id,
        lemonsqueezy_variant_id: firstSubscriptionItem?.variant_id != null ? String(firstSubscriptionItem.variant_id) : null,
        lemonsqueezy_customer_portal_url: attributes.urls?.customer_portal ?? null,
        status: resolveStatus(attributes.status),
        plan: resolvePlanName(firstSubscriptionItem?.variant_name ?? firstSubscriptionItem?.product_name),
        current_period_end: resolvePeriodEnd(attributes),
        cancel_at_period_end: Boolean(attributes.cancelled ?? false),
        updated_at: new Date().toISOString()
      });
    }
  }

  if (eventName === 'subscription_payment_success' || eventName === 'subscription_payment_failed') {
    const { data: existing } = await supabase
      .from('billing_accounts')
      .select('user_id')
      .eq('lemonsqueezy_customer_id', customerId ?? '')
      .maybeSingle();

    if (existing?.user_id) {
      const firstSubscriptionItem = attributes.first_subscription_item ?? null;
      await supabase.from('billing_accounts').upsert({
        user_id: existing.user_id,
        lemonsqueezy_customer_id: customerId,
        lemonsqueezy_subscription_id: attributes.subscription_id ?? event.data.id,
        lemonsqueezy_variant_id: firstSubscriptionItem?.variant_id != null ? String(firstSubscriptionItem.variant_id) : null,
        lemonsqueezy_customer_portal_url: attributes.urls?.customer_portal ?? null,
        status: resolveStatus(attributes.status),
        plan: resolvePlanName(firstSubscriptionItem?.variant_name ?? firstSubscriptionItem?.product_name),
        current_period_end: resolvePeriodEnd(attributes),
        cancel_at_period_end: Boolean(attributes.cancelled ?? false),
        updated_at: new Date().toISOString()
      });
    }
  }

  return NextResponse.json({ received: true });
}
