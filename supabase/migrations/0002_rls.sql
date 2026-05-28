-- =============================================================
-- HM HOME — 0002_rls.sql
-- Row-level security policies. Run after 0001_init.sql.
--
-- Pattern:
--  • public reads on the catalog (products, categories, product_images)
--  • authed users manage their own wishlist + can read their own orders
--  • admins (profiles.role = 'admin') get full CRUD on everything
--  • carts/cart_items are accessed via server actions using the service-role
--    client (carts must be readable by guests who have only a session_id,
--    not an auth.uid()), so RLS for those is left restrictive.
-- =============================================================

-- Helper: is the current auth user an admin? --------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles ------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles: self read"   on public.profiles;
drop policy if exists "profiles: self update" on public.profiles;
drop policy if exists "profiles: admin all"   on public.profiles;

create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
  -- The role-immutability clause stops a user from elevating themselves to admin
  -- via a self-update. Admins change roles via the admin-all policy below.

create policy "profiles: admin all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- categories ----------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists "categories: public read" on public.categories;
drop policy if exists "categories: admin all"   on public.categories;

create policy "categories: public read"
  on public.categories for select
  using (true);

create policy "categories: admin all"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- products ------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products: public read" on public.products;
drop policy if exists "products: admin all"   on public.products;

create policy "products: public read"
  on public.products for select
  using (true);

create policy "products: admin all"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- product_images -----------------------------------------------
alter table public.product_images enable row level security;

drop policy if exists "product_images: public read" on public.product_images;
drop policy if exists "product_images: admin all"   on public.product_images;

create policy "product_images: public read"
  on public.product_images for select
  using (true);

create policy "product_images: admin all"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- carts ---------------------------------------------------------
-- Guests can't authenticate, so guest cart access goes through the
-- service-role client in server actions. Authed users can read/manage
-- their own row directly.
alter table public.carts enable row level security;

drop policy if exists "carts: self all"  on public.carts;
drop policy if exists "carts: admin all" on public.carts;

create policy "carts: self all"
  on public.carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "carts: admin all"
  on public.carts for all
  using (public.is_admin())
  with check (public.is_admin());

-- cart_items ----------------------------------------------------
alter table public.cart_items enable row level security;

drop policy if exists "cart_items: self all"  on public.cart_items;
drop policy if exists "cart_items: admin all" on public.cart_items;

create policy "cart_items: self all"
  on public.cart_items for all
  using (exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id and c.user_id = auth.uid()
  ));

create policy "cart_items: admin all"
  on public.cart_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- orders --------------------------------------------------------
-- Order placement runs through a server action with the service-role
-- client (it needs to validate prices, decrement stock atomically, and
-- accept guest orders with no auth.uid()). RLS still applies to direct
-- client reads — auth users see their own, admins see all.
alter table public.orders enable row level security;

drop policy if exists "orders: self read"  on public.orders;
drop policy if exists "orders: admin all"  on public.orders;

create policy "orders: self read"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders: admin all"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- order_items ---------------------------------------------------
alter table public.order_items enable row level security;

drop policy if exists "order_items: self read" on public.order_items;
drop policy if exists "order_items: admin all" on public.order_items;

create policy "order_items: self read"
  on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  ));

create policy "order_items: admin all"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- wishlists -----------------------------------------------------
alter table public.wishlists enable row level security;

drop policy if exists "wishlists: self all"  on public.wishlists;
drop policy if exists "wishlists: admin all" on public.wishlists;

create policy "wishlists: self all"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "wishlists: admin all"
  on public.wishlists for all
  using (public.is_admin())
  with check (public.is_admin());
