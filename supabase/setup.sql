create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  session_id uuid not null unique,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  answers jsonb not null,
  question_times jsonb not null,
  result_code text not null,
  axis_scores jsonb not null,
  user_agent text,
  total_duration_ms bigint not null,
  created_at timestamptz not null default now(),
  constraint submissions_time_order check (completed_at >= started_at),
  constraint submissions_duration_nonnegative check (total_duration_ms >= 0),
  constraint submissions_result_code check (result_code ~ '^[RH][LA][CO][TG]$'),
  constraint submissions_answers_object check (jsonb_typeof(answers) = 'object'),
  constraint submissions_times_object check (jsonb_typeof(question_times) = 'object'),
  constraint submissions_scores_object check (jsonb_typeof(axis_scores) = 'object'),
  constraint submissions_answers_size check (octet_length(answers::text) <= 12000),
  constraint submissions_times_size check (octet_length(question_times::text) <= 12000),
  constraint submissions_user_agent_size check (user_agent is null or octet_length(user_agent) <= 1000)
);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

create index if not exists submissions_result_created_idx
  on public.submissions (result_code, created_at desc);

alter table public.submissions enable row level security;

revoke all on table public.submissions from anon, authenticated;
revoke all on sequence public.submissions_id_seq from anon, authenticated;

grant insert on table public.submissions to anon;
grant usage on sequence public.submissions_id_seq to anon;

drop policy if exists "anonymous visitors may submit once" on public.submissions;
create policy "anonymous visitors may submit once"
  on public.submissions
  for insert
  to anon
  with check (true);

comment on table public.submissions is
  'Anonymous GEO/TYPE quiz responses. Client roles can insert but cannot select, update, or delete.';
