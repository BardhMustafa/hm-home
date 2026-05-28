# Supabase — HM HOME

## Apply the migrations

1. Create a Supabase project at https://supabase.com/dashboard.
2. Copy `.env.local.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project settings → API → `anon` `public`
   - `SUPABASE_SERVICE_ROLE_KEY` — Project settings → API → `service_role` `secret`
3. In the dashboard's SQL Editor, paste and run **in order**:
   - `migrations/0001_init.sql` — tables, indexes, triggers
   - `migrations/0002_rls.sql` — row-level security policies
   - `migrations/0003_storage.sql` — buckets + storage policies

## Make yourself an admin

After signing up through the app's `/auth/register` page, promote yourself in the SQL Editor:

```sql
update public.profiles
   set role = 'admin'
 where id = (select id from auth.users where email = 'you@example.com');
```

## Notes

- `profiles` rows are created automatically when an auth user signs up (trigger `on_auth_user_created`).
- The `is_admin()` helper used by every RLS policy reads from `profiles.role`.
- Storage buckets are public-read; only admins can write/update/delete.
- Order placement uses the service-role client server-side so it can validate prices and decrement stock atomically; RLS still restricts direct client reads to the owner.
