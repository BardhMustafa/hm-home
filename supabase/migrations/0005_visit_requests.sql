-- =============================================================
-- HM HOME — 0005_visit_requests.sql
-- Showroom visit booking ("Caktoni vizitën"). Public visitors submit a
-- request (via the service-role server action); admins review them.
-- =============================================================

create table if not exists public.visit_requests (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  phone          text not null,
  email          text,
  preferred_date date,
  preferred_time text,
  notes          text,
  status         text not null default 'new'
                 check (status in ('new', 'confirmed', 'done', 'cancelled')),
  created_at     timestamptz not null default now()
);

create index if not exists visit_requests_status_idx
  on public.visit_requests (status);
create index if not exists visit_requests_created_at_idx
  on public.visit_requests (created_at desc);

-- RLS: only admins can read/manage. Inserts come through the service-role
-- client in the server action (which bypasses RLS), so no public insert
-- policy is needed — the public can't read or enumerate requests.
alter table public.visit_requests enable row level security;

create policy "visit_requests: admin all"
  on public.visit_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());
