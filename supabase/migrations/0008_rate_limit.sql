-- 0008: Server-side rate limiting for the public, unauthenticated endpoints
-- (checkout order placement, visit requests). Without online payment there's
-- no friction stopping a bot from flooding orders/visits, draining stock, and
-- spamming the owner — this caps how many a single bucket (IP+action) can make
-- within a time window.
--
-- Sliding window backed by a tiny table; works across serverless instances
-- (unlike in-memory limiters) because state lives in the shared DB.

create table if not exists public.rate_limit_hits (
  id         bigserial primary key,
  bucket     text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_bucket_time
  on public.rate_limit_hits (bucket, created_at);

-- RLS on with no policies: only the service role (which bypasses RLS) can read
-- or write this table. anon/authenticated get nothing via PostgREST.
alter table public.rate_limit_hits enable row level security;

-- Returns true if the action is allowed (and records the hit), false if the
-- bucket has already reached p_limit within the last p_window_seconds. Prunes
-- this bucket's expired rows on each call so the table stays small.
create or replace function public.check_rate_limit(
  p_bucket         text,
  p_limit          int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  delete from rate_limit_hits
   where bucket = p_bucket
     and created_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into v_count
    from rate_limit_hits
   where bucket = p_bucket;

  if v_count >= p_limit then
    return false;
  end if;

  insert into rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$$;

-- Only callable by the service-role client used by the server actions.
revoke all on function public.check_rate_limit(text, int, int) from public;
revoke all on function public.check_rate_limit(text, int, int) from anon, authenticated;
