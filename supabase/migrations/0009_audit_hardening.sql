-- =============================================================
-- HM HOME — 0009_audit_hardening.sql
-- Follow-up hardening from the full security audit (2026-06-18).
-- All items are defense-in-depth; none fix an actively-exploitable hole
-- (place_order is already service-role-only, role self-elevation is already
-- blocked by RLS). Safe to apply to the live DB.
-- =============================================================

-- 1. Lock the profiles.role column at the engine level ---------------------
--    RLS already pins role on self-update, but column privileges are an

--    independent, snapshot-proof guard: end users simply cannot write `role`.
--    Admins/role changes go through the service-role client (bypasses this) or
--    direct SQL, so no app flow breaks.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- 2. Non-negative money constraints ----------------------------------------
--    place_order computes these server-side, but the schema should forbid
--    negative amounts regardless of which writer inserts.
alter table public.orders drop constraint if exists orders_amounts_nonneg;
alter table public.orders
  add constraint orders_amounts_nonneg
  check (subtotal >= 0 and shipping_cost >= 0 and total >= 0);

alter table public.order_items drop constraint if exists order_items_price_nonneg;
alter table public.order_items
  add constraint order_items_price_nonneg check (price >= 0);

-- 3. place_order: assert cart ownership + narrow the exception handler ------
--    (a) The cart must belong to the claimed user, so an order can never be
--        attributed to the wrong account (defense in depth; the only caller is
--        the trusted checkout action).
--    (b) The unique_violation handler previously caught ANY unique violation
--        and, for a null idempotency key, returned a null "order id" — masking
--        a real error as success. Re-raise unless it's the idempotency race.
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
  -- Defense in depth: a user-owned checkout must reference that user's cart.
  if p_user_id is not null and not exists (
    select 1 from carts where id = p_cart_id and user_id = p_user_id
  ) then
    raise exception 'CART_OWNERSHIP_MISMATCH';
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
  when unique_violation then
    -- Only the idempotency race is an expected unique violation; anything else
    -- is a real error and must propagate instead of returning a null id.
    if p_idempotency_key is null then
      raise;
    end if;
    select id into v_order_id from orders where idempotency_key = p_idempotency_key;
    return v_order_id;
end;
$$;

-- CREATE OR REPLACE keeps prior grants, but re-assert the lockdown to be safe.
revoke all on function public.place_order(
  uuid, uuid, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
