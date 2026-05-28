-- =============================================================
-- HM HOME — 0003_storage.sql
-- Storage buckets + policies. Run after 0002_rls.sql.
-- =============================================================

-- Buckets ------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('product-images',  'product-images',  true),
  ('category-images', 'category-images', true),
  ('site-assets',     'site-assets',     true)
on conflict (id) do nothing;

-- Public read on all three (catalog images are meant to be served
-- straight from the CDN; nothing sensitive lives in these buckets).
drop policy if exists "storage: public read product-images"  on storage.objects;
drop policy if exists "storage: public read category-images" on storage.objects;
drop policy if exists "storage: public read site-assets"     on storage.objects;

create policy "storage: public read product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "storage: public read category-images"
  on storage.objects for select
  using (bucket_id = 'category-images');

create policy "storage: public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

-- Admin write/update/delete across all three buckets.
drop policy if exists "storage: admin write all"  on storage.objects;
drop policy if exists "storage: admin update all" on storage.objects;
drop policy if exists "storage: admin delete all" on storage.objects;

create policy "storage: admin write all"
  on storage.objects for insert
  with check (
    bucket_id in ('product-images', 'category-images', 'site-assets')
    and public.is_admin()
  );

create policy "storage: admin update all"
  on storage.objects for update
  using (
    bucket_id in ('product-images', 'category-images', 'site-assets')
    and public.is_admin()
  );

create policy "storage: admin delete all"
  on storage.objects for delete
  using (
    bucket_id in ('product-images', 'category-images', 'site-assets')
    and public.is_admin()
  );
