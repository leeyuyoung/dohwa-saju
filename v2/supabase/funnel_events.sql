-- 관리자 퍼널용. Supabase SQL editor에서 한 번 실행한다.
create table if not exists public.funnel_events (
  session_id text not null,
  step text not null,
  token text null,
  product text not null default 'dohwa',
  created_at timestamptz not null default now(),
  primary key (session_id, step, product)
);

create index if not exists funnel_events_step_idx on public.funnel_events (step);
create index if not exists funnel_events_created_at_idx on public.funnel_events (created_at desc);
create index if not exists funnel_events_product_step_idx on public.funnel_events (product, step);
create index if not exists funnel_events_product_created_at_idx on public.funnel_events (product, created_at desc);

-- analyses 목록 조회를 위해 created_at 인덱스가 없으면 추가한다.
create index if not exists analyses_created_at_idx on public.analyses (created_at desc);
