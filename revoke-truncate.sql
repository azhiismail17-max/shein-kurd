-- ============================================================================
-- Take TRUNCATE away from staff, on every table that holds records.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run twice. It grants nothing and deletes no data.
--
-- WHY
-- The grants on gift_cards came back as:
--   authenticated: INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
--
-- TRUNCATE is the one command row level security cannot touch. No policy applies to it, so
-- every careful rule about who may delete what is simply bypassed — one statement empties
-- the table. It is almost certainly left over from a `grant all`, which is also why the
-- orders tables are included here.
--
-- Nothing in the app can reach it: PostgREST never issues TRUNCATE, so neither the
-- publishable key nor a signed-in member of staff using the app can call it. It needs a
-- direct database connection. That makes this housekeeping rather than an emergency — but
-- it is the only privilege that can undo the delete rules in one go, so it should not sit
-- there.
--
-- REFERENCES and TRIGGER go too. Neither is needed by an application role: they allow
-- pointing a foreign key at the table and attaching a trigger to it.
-- ============================================================================

revoke truncate, references, trigger on public.gift_cards from authenticated;
revoke truncate, references, trigger on public.orders_kurdistani from authenticated;
revoke truncate, references, trigger on public.orders_iraqi from authenticated;
revoke truncate, references, trigger on public.profiles from authenticated;

-- Delete as well, everywhere it is not wanted. Orders are removed by the app on purpose
-- when the delete button is pressed, so orders keep theirs; a gift card is never deleted.
revoke delete on public.gift_cards from authenticated;

-- And nothing at all for anonymous visitors, on any of them.
revoke all on public.gift_cards from anon;
revoke all on public.orders_kurdistani from anon;
revoke all on public.orders_iraqi from anon;
revoke all on public.profiles from anon;

-- ----------------------------------------------------------------------------
-- Check — paste me this output
--
-- Expect no TRUNCATE, REFERENCES or TRIGGER anywhere, no anon rows at all, and DELETE
-- only on the two orders tables.
-- ----------------------------------------------------------------------------

select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('gift_cards', 'orders_kurdistani', 'orders_iraqi', 'profiles')
  and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;
