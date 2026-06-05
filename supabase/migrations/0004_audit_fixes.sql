-- =============================================================
-- HM HOME — 0004_audit_fixes.sql
-- Audit remediation:
--   1. products.stock nullable  (NULL = made-to-order)
--   2. order_items.product_id FK -> ON DELETE SET NULL
--      (so products that have been ordered can be deleted)
--   3. orders.idempotency_key   (block duplicate-submit orders)
--   4. place_order()            (atomic, transactional checkout with
--                                guarded stock decrement)
-- =============================================================

-- 1. Make stock nullable so NULL genuinely means "made-to-order" -----------
--    The whole app already branches on `stock === null`; the schema just
--    never allowed it. Existing 0-stock rows keep meaning "sold out".
alter table public.products alter column stock drop default;
alter table public.products alter column stock drop not null;
alter table public.products drop constraint if exists products_stock_check;
alter table public.products
  add constraint products_stock_check check (stock is null or stock >= 0);

-- 2. Allow deleting an ordered product without wiping order history ---------
--    order_items.product_id is already nullable and the row snapshots
--    product_name + price, so SET NULL preserves the historical line.
alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;
alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products(id) on delete set null;

-- 3. Idempotency key — one order per checkout submission --------------------
alter table public.orders add column if not exists idempotency_key text;
create unique index if not exists orders_idempotency_key_unique
  on public.orders (idempotency_key) where idempotency_key is not null;

-- 4. Transactional order placement -----------------------------------------
--    Everything (stock decrement, order, items, cart clear) happens in one
--    transaction. Stock is decremented with a guarded UPDATE under a row
--    lock, so concurrent checkouts can never oversell. Prices are taken
--    live from the products table, so the customer is always charged the
--    current price. Returns the new (or idempotently-existing) order id.
create or replace function public.place_order(
  p_cart_id         uuid,
  p_user_id         uuid,
  p_guest_email     text,
  p_full_name       text,
  p_phone           text,
  p_country         text,
  p_city            text,
  p_address         text,
  p_postal_code     text,
  p_notes           text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(10,2) := 0;
  v_shipping numeric(10,2) := 0;
  v_item     record;
  v_eff      numeric(10,2);
  v_updated  integer;
begin
  -- Idempotency: if this submission already produced an order, return it.
  if p_idempotency_key is not null then
    select id into v_order_id from orders where idempotency_key = p_idempotency_key;
    if found then
      return v_order_id;
    end if;
  end if;

  if not exists (select 1 from carts where id = p_cart_id) then
    raise exception 'CART_NOT_FOUND';
  end if;
  if not exists (select 1 from cart_items where cart_id = p_cart_id) then
    raise exception 'CART_EMPTY';
  end if;

  insert into orders (
    user_id, guest_email, status, subtotal, shipping_cost, total,
    full_name, phone, country, city, address, postal_code, notes, idempotency_key
  ) values (
    p_user_id, p_guest_email, 'pending', 0, v_shipping, 0,
    p_full_name, p_phone, p_country, p_city, p_address, p_postal_code, p_notes,
    p_idempotency_key
  ) returning id into v_order_id;

  -- Walk the cart lines with the product rows locked FOR UPDATE so two
  -- concurrent checkouts serialize on the same products.
  for v_item in
    select ci.product_id, ci.quantity,
           p.name, p.price, p.discount_price, p.stock
    from cart_items ci
    join products p on p.id = ci.product_id
    where ci.cart_id = p_cart_id
    for update of p
  loop
    v_eff := case
      when v_item.discount_price is not null
       and v_item.discount_price < v_item.price
      then v_item.discount_price
      else v_item.price
    end;

    -- Guarded decrement only for tracked stock (NULL = made-to-order).
    if v_item.stock is not null then
      update products
        set stock = stock - v_item.quantity
        where id = v_item.product_id and stock >= v_item.quantity;
      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        raise exception 'OUT_OF_STOCK:%', v_item.name;
      end if;
    end if;

    insert into order_items (order_id, product_id, product_name, price, quantity)
    values (v_order_id, v_item.product_id, v_item.name, v_eff, v_item.quantity);

    v_subtotal := v_subtotal + (v_eff * v_item.quantity);
  end loop;

  update orders
    set subtotal = v_subtotal, total = v_subtotal + v_shipping
    where id = v_order_id;

  delete from cart_items where cart_id = p_cart_id;

  return v_order_id;

exception
  -- Two requests with the same idempotency key raced past the early check;
  -- the unique index rejected the second insert — return the winner's order.
  when unique_violation then
    select id into v_order_id from orders where idempotency_key = p_idempotency_key;
    return v_order_id;
end;
$$;

-- Only the trusted server (service role) may place orders. The server action
-- validates the address + resolves the cart before calling this.
revoke all on function public.place_order(
  uuid, uuid, text, text, text, text, text, text, text, text, text
) from anon, authenticated;
