-- =============================================================
-- HM HOME — 0001_init.sql
-- Tables, indexes, triggers. Run this first.
-- =============================================================

-- profiles ----------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'customer'
              check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
-- full_name pulled from raw_user_meta_data when the signup form sends it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- categories --------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  image_url   text,
  created_at  timestamptz not null default now()
);

create index if not exists categories_slug_idx on public.categories (slug);

-- products ----------------------------------------------------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  discount_price  numeric(10,2) check (discount_price is null or discount_price >= 0),
  sku             text unique,
  stock           integer not null default 0 check (stock >= 0),
  featured        boolean not null default false,
  category_id     uuid references public.categories(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists products_slug_idx       on public.products (slug);
create index if not exists products_category_idx   on public.products (category_id);
create index if not exists products_featured_idx   on public.products (featured) where featured;
create index if not exists products_created_at_idx on public.products (created_at desc);

-- Keep updated_at fresh on every UPDATE.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- product_images ----------------------------------------------
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  storage_path  text not null,
  image_url     text not null,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, position);

-- carts -------------------------------------------------------
-- Auth users use user_id; guests use session_id (set client-side, sent up
-- when checkout runs). Exactly one of the two should be set, enforced via
-- a partial unique index per identifier (so reloading the same browser
-- doesn't spawn duplicate carts).
create table if not exists public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  session_id  text,
  created_at  timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);

create unique index if not exists carts_user_unique
  on public.carts (user_id) where user_id is not null;
create unique index if not exists carts_session_unique
  on public.carts (session_id) where session_id is not null;

-- cart_items --------------------------------------------------
create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    integer not null check (quantity > 0),
  unique (cart_id, product_id)
);

-- orders ------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id),
  guest_email   text,
  status        text not null default 'pending'
                check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal      numeric(10,2) not null,
  shipping_cost numeric(10,2) not null default 0,
  total         numeric(10,2) not null,
  full_name     text not null,
  phone         text not null,
  country       text not null,
  city          text not null,
  address       text not null,
  postal_code   text,
  notes         text,
  created_at    timestamptz not null default now(),
  check (user_id is not null or guest_email is not null)
);

create index if not exists orders_user_idx       on public.orders (user_id);
create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- order_items -------------------------------------------------
-- product_name + price are snapshotted at order time so deleting or
-- repricing a product later doesn't rewrite history.
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id),
  product_name  text not null,
  price         numeric(10,2) not null,
  quantity      integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- wishlists ---------------------------------------------------
create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);
