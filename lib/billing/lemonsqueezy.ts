import { createHmac, timingSafeEqual } from 'node:crypto';

type LemonSqueezyRequestBody = Record<string, unknown>;

function getLemonSqueezyApiKey() {
  const value = process.env.LEMONSQUEEZY_API_KEY;
  if (!value) {
    throw new Error('LEMONSQUEEZY_API_KEY is required');
  }
  return value;
}

export function getLemonSqueezyStoreId() {
  const value = process.env.LEMONSQUEEZY_STORE_ID;
  if (!value) {
    throw new Error('LEMONSQUEEZY_STORE_ID is required');
  }
  return value;
}

export function getLemonSqueezyVariantId() {
  const value = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!value) {
    throw new Error('LEMONSQUEEZY_VARIANT_ID is required');
  }
  return value;
}

export function getLemonSqueezyWebhookSecret() {
  const value = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!value) {
    throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is required');
  }
  return value;
}

export function getLemonSqueezyPortalUrl() {
  const explicit = process.env.LEMONSQUEEZY_PORTAL_URL;
  if (explicit) return explicit;

  const storeDomain = process.env.LEMONSQUEEZY_STORE_DOMAIN;
  if (!storeDomain) {
    throw new Error('LEMONSQUEEZY_PORTAL_URL or LEMONSQUEEZY_STORE_DOMAIN is required');
  }
  return `https://${storeDomain}.lemonsqueezy.com/billing`;
}

async function lemonSqueezyApiRequest<T>(path: string, method: 'GET' | 'POST', body?: LemonSqueezyRequestBody) {
  const response = await fetch(`https://api.lemonsqueezy.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${getLemonSqueezyApiKey()}`,
      'Content-Type': 'application/vnd.api+json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = (await response.json().catch(async () => ({ errors: [{ detail: await response.text() }] }))) as T & {
    errors?: Array<{ detail?: string }>;
  };

  if (!response.ok) {
    throw new Error(payload.errors?.[0]?.detail ?? `Lemon Squeezy request failed (${response.status})`);
  }

  return payload;
}

export async function createLemonSqueezyCustomer(input: { email: string; name?: string | null; userId: string }) {
  return lemonSqueezyApiRequest<{ data: { id: string } }>('/v1/customers', 'POST', {
    data: {
      type: 'customers',
      attributes: {
        email: input.email,
        name: input.name ?? undefined
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: getLemonSqueezyStoreId()
          }
        }
      }
    }
  });
}

export async function createLemonSqueezyCheckout(input: {
  customerEmail: string;
  customerName?: string | null;
  userId: string;
  redirectUrl: string;
}) {
  return lemonSqueezyApiRequest<{
    data: {
      id: string;
      attributes: {
        url: string;
      };
    };
  }>('/v1/checkouts', 'POST', {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: input.customerEmail,
          name: input.customerName ?? undefined,
          custom: {
            user_id: input.userId
          }
        },
        checkout_options: {
          embed: false
        },
        product_options: {
          enabled_variants: [Number(getLemonSqueezyVariantId())],
          redirect_url: input.redirectUrl
        },
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: getLemonSqueezyStoreId()
          }
        },
        variant: {
          data: {
            type: 'variants',
            id: getLemonSqueezyVariantId()
          }
        }
      }
    }
  });
}

export async function retrieveLemonSqueezySubscription(subscriptionId: string) {
  return lemonSqueezyApiRequest<{
    data: {
      id: string;
      attributes: {
        status: string;
        renews_at: string | null;
        ends_at: string | null;
        cancelled: boolean | null;
        first_subscription_item?: {
          id?: string | null;
          price?: {
            id?: string | null;
            name?: string | null;
          } | null;
        } | null;
        urls?: {
          customer_portal?: string | null;
        };
      };
    };
  }>(`/v1/subscriptions/${subscriptionId}`, 'GET');
}

export async function retrieveLemonSqueezyCustomer(customerId: string) {
  return lemonSqueezyApiRequest<{
    data: {
      id: string;
      attributes: {
        urls?: {
          customer_portal?: string | null;
        };
      };
    };
  }>(`/v1/customers/${customerId}`, 'GET');
}

export function verifyLemonSqueezySignature(rawBody: string, signatureHeader: string) {
  const secret = getLemonSqueezyWebhookSecret();
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const actualBuffer = Buffer.from(signatureHeader.trim(), 'hex');

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error('Invalid Lemon Squeezy signature');
  }
}

export function parseLemonSqueezyEvent(rawBody: string) {
  return JSON.parse(rawBody) as {
    meta?: {
      event_name?: string;
      custom_data?: Record<string, unknown>;
    };
    data: {
      id: string;
      type: string;
      attributes?: Record<string, unknown>;
      relationships?: Record<string, unknown>;
      custom_data?: Record<string, unknown>;
    };
  };
}
