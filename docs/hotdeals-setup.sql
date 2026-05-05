-- ============================================================
-- Lifetool 핫딜 게시판 스키마
-- Supabase SQL Editor에서 한번 실행해 주세요.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.hotdeals (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  source text not null,
  title text not null,
  url text not null,
  thumbnail_url text,
  description text,
  price text,
  category text,
  posted_at timestamptz not null default now(),
  fetched_at timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists hotdeals_posted_at_idx on public.hotdeals (posted_at desc);
create index if not exists hotdeals_source_idx on public.hotdeals (source);

alter table public.hotdeals enable row level security;

drop policy if exists "hotdeals_public_read" on public.hotdeals;
create policy "hotdeals_public_read"
  on public.hotdeals for select
  using (true);

-- ============================================================
-- 일 단위 자동 수집 cron (pg_cron + pg_net 확장 필요)
-- ★ 아래 URL과 service_role key 를 본인 프로젝트 값으로 바꿔주세요.
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- select cron.schedule(
--   'fetch-hotdeals-daily',
--   '0 0 * * *',  -- 매일 09:00 KST
--   $$
--   select net.http_post(
--     url := 'https://YOUR-PROJECT.supabase.co/functions/v1/fetch-hotdeals',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
