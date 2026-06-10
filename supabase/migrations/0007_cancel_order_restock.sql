-- 0007: Atomic order cancellation + stock restore.
--
-- The admin "set status = cancelled" path used to: (1) read the current status
-- in app code, (2) update the order, then (3) loop per item doing a separate
-- read-modify-write of products.stock. That has two problems:
--   * The status read and update are a TOCTOU window — two concurrent cancels
--     could both see "not cancelled" and both restock (double-counting stock).
--   * Each `stock = current + qty` is a non-atomic read-modify-write, so a
--     concurrent stock edit can be lost.
--
-- This function makes the whole thing atomic and idempotent: the conditional
-- UPDATE is the gate (only the transition INTO cancelled restocks), and the
-- restock is a single set-based UPDATE that increments in-place.
--
-- Returns true if this call performed the cancellation (and restock), false if
-- the order was already cancelled / not found (no-op).

create or replace function public.cancel_order_restock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
     set status = 'cancelled'
   where id = p_order_id
     and status <> 'cancelled';

  if not found then
    return false;
  end if;

  -- Return reserved units to inventory for items whose product still exists
  -- and tracks stock (NULL stock = made-to-order, never decremented).
  update products p
     set stock = p.stock + oi.quantity
    from order_items oi
   where oi.order_id = p_order_id
     and oi.product_id = p.id
     and p.stock is not null;

  return true;
end;
$$;

-- Only the service-role admin client (used by the admin server action) may call
-- this; never anon/authenticated directly via PostgREST.
revoke all on function public.cancel_order_restock(uuid) from public;
revoke all on function public.cancel_order_restock(uuid) from anon, authenticated;
