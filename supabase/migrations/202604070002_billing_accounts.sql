create table if not exists billing_accounts (
  user_id uuid primary key references public.users(id) on delete cascade,
  lemonsqueezy_customer_id text unique,
  lemonsqueezy_subscription_id text unique,
  lemonsqueezy_variant_id text null,
  lemonsqueezy_customer_portal_url text null,
  lemonsqueezy_checkout_id text null,
  status text not null default 'inactive',
  plan text null,
  current_period_end timestamptz null,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table billing_accounts enable row level security;

drop policy if exists own_billing_accounts on billing_accounts;
create policy own_billing_accounts on billing_accounts for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));

create index if not exists idx_billing_accounts_customer on billing_accounts(lemonsqueezy_customer_id);
create index if not exists idx_billing_accounts_subscription on billing_accounts(lemonsqueezy_subscription_id);
