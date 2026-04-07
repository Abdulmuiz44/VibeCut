alter table billing_accounts
  add column if not exists lemonsqueezy_customer_id text unique,
  add column if not exists lemonsqueezy_subscription_id text unique,
  add column if not exists lemonsqueezy_variant_id text null,
  add column if not exists lemonsqueezy_customer_portal_url text null,
  add column if not exists lemonsqueezy_checkout_id text null;

create index if not exists idx_billing_accounts_lemon_customer on billing_accounts(lemonsqueezy_customer_id);
create index if not exists idx_billing_accounts_lemon_subscription on billing_accounts(lemonsqueezy_subscription_id);
