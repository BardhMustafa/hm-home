-- 0006: Properly lock down the place_order RPC.
--
-- 0004 revoked EXECUTE from anon/authenticated, but Postgres grants EXECUTE to
-- PUBLIC by default on new functions. Revoking from the named roles leaves that
-- PUBLIC grant intact, so anon could still call place_order directly via
-- PostgREST — and because the function is SECURITY DEFINER, it ran with elevated
-- privileges (bypassing RLS) for anyone who knew a cart UUID.
--
-- Revoke from PUBLIC so the function is only callable by the service role used
-- by the checkout server action.

revoke all on function public.place_order(
  uuid, uuid, text, text, text, text, text, text, text, text, text
) from public;

-- Re-assert the named-role revokes from 0004 in case any explicit grant exists.
revoke all on function public.place_order(
  uuid, uuid, text, text, text, text, text, text, text, text, text
) from anon, authenticated;
