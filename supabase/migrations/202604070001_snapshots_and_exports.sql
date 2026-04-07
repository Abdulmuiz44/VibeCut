create table if not exists sequence_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  sequence_id uuid not null references sequences(id) on delete cascade,
  label text not null,
  operations_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sequence_snapshots_project on sequence_snapshots(project_id, created_at desc);
create index if not exists idx_sequence_snapshots_sequence on sequence_snapshots(sequence_id, created_at desc);

alter table sequence_snapshots enable row level security;

drop policy if exists own_sequence_snapshots on sequence_snapshots;
create policy own_sequence_snapshots on sequence_snapshots for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));
