create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  source_asset_id uuid null,
  active_transcript_id uuid null,
  active_sequence_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  duration_ms integer null,
  width integer null,
  height integer null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects add constraint fk_project_asset foreign key (source_asset_id) references assets(id);

create table if not exists transcripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  provider text not null,
  language text null,
  status text not null,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects add constraint fk_project_transcript foreign key (active_transcript_id) references transcripts(id);

create table if not exists transcript_segments (
  id uuid primary key default gen_random_uuid(),
  transcript_id uuid not null references transcripts(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  speaker text null,
  start_ms integer not null,
  end_ms integer not null,
  text text not null,
  confidence numeric null,
  segment_index integer not null
);

create table if not exists transcript_words (
  id uuid primary key default gen_random_uuid(),
  transcript_segment_id uuid not null references transcript_segments(id) on delete cascade,
  word text not null,
  start_ms integer not null,
  end_ms integer not null,
  confidence numeric null,
  word_index integer not null
);

create table if not exists sequences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  aspect_ratio text not null default '9:16',
  caption_theme text not null default 'clean',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects add constraint fk_project_sequence foreign key (active_sequence_id) references sequences(id);

create table if not exists sequence_segments (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references sequences(id) on delete cascade,
  source_transcript_segment_id uuid null references transcript_segments(id),
  source_asset_id uuid not null references assets(id) on delete cascade,
  start_ms integer not null,
  end_ms integer not null,
  timeline_order integer not null,
  include_in_export boolean not null default true,
  segment_role text not null default 'speech',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists edit_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  sequence_id uuid not null references sequences(id) on delete cascade,
  operation_type text not null,
  source text not null,
  status text not null default 'applied',
  payload jsonb not null,
  summary text null,
  created_at timestamptz not null default now()
);

create table if not exists exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  sequence_id uuid not null references sequences(id) on delete cascade,
  preset text not null,
  status text not null default 'queued',
  progress numeric null,
  output_storage_path text null,
  output_url text null,
  error_message text null,
  render_mode text not null,
  duration_ms integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id),
  project_id uuid null references projects(id),
  job_type text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user on projects(user_id, created_at desc);
create index if not exists idx_assets_project on assets(project_id, created_at desc);
create index if not exists idx_transcripts_project on transcripts(project_id, status);
create index if not exists idx_transcript_segments_transcript on transcript_segments(transcript_id, segment_index);
create index if not exists idx_sequences_project on sequences(project_id, created_at desc);
create index if not exists idx_sequence_segments_sequence on sequence_segments(sequence_id, timeline_order);
create index if not exists idx_edit_operations_sequence on edit_operations(sequence_id, created_at desc);
create index if not exists idx_exports_project on exports(project_id, status, created_at desc);

alter table projects enable row level security;
alter table assets enable row level security;
alter table transcripts enable row level security;
alter table transcript_segments enable row level security;
alter table transcript_words enable row level security;
alter table sequences enable row level security;
alter table sequence_segments enable row level security;
alter table edit_operations enable row level security;
alter table exports enable row level security;
alter table job_runs enable row level security;

create policy "own_projects" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_assets" on assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_transcripts" on transcripts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "segments_by_project_owner" on transcript_segments for select using (exists(select 1 from transcripts t where t.id = transcript_id and t.user_id = auth.uid()));
create policy "words_by_project_owner" on transcript_words for select using (exists(select 1 from transcript_segments s join transcripts t on t.id = s.transcript_id where s.id = transcript_segment_id and t.user_id = auth.uid()));
create policy "own_sequences" on sequences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sequence_segments_owner" on sequence_segments for all using (exists(select 1 from sequences s where s.id = sequence_id and s.user_id = auth.uid()));
create policy "own_operations" on edit_operations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_exports" on exports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_job_runs" on job_runs for select using (user_id is null or auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('source-videos', 'source-videos', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('export-videos', 'export-videos', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', false) on conflict (id) do nothing;
