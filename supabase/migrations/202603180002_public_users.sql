create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text null,
  avatar_url text null,
  provider text not null default 'google',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users (email);

insert into public.users (id, email, full_name, avatar_url)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
where email is not null
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();

alter table profiles drop constraint if exists profiles_id_fkey;
alter table profiles add constraint profiles_id_fkey foreign key (id) references public.users(id) on delete cascade;

alter table projects drop constraint if exists projects_user_id_fkey;
alter table projects add constraint projects_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table assets drop constraint if exists assets_user_id_fkey;
alter table assets add constraint assets_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table transcripts drop constraint if exists transcripts_user_id_fkey;
alter table transcripts add constraint transcripts_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table sequences drop constraint if exists sequences_user_id_fkey;
alter table sequences add constraint sequences_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table edit_operations drop constraint if exists edit_operations_user_id_fkey;
alter table edit_operations add constraint edit_operations_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table exports drop constraint if exists exports_user_id_fkey;
alter table exports add constraint exports_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table job_runs drop constraint if exists job_runs_user_id_fkey;
alter table job_runs add constraint job_runs_user_id_fkey foreign key (user_id) references public.users(id) on delete set null;

drop policy if exists own_projects on projects;
create policy own_projects on projects for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));

drop policy if exists own_assets on assets;
create policy own_assets on assets for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));

drop policy if exists own_transcripts on transcripts;
create policy own_transcripts on transcripts for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));

drop policy if exists own_sequences on sequences;
create policy own_sequences on sequences for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));

drop policy if exists own_operations on edit_operations;
create policy own_operations on edit_operations for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));

drop policy if exists own_exports on exports;
create policy own_exports on exports for all using (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));

drop policy if exists own_job_runs on job_runs;
create policy own_job_runs on job_runs for select using (user_id is null or exists (select 1 from public.users u where u.id = user_id and lower(u.email) = lower(auth.jwt() ->> 'email')));