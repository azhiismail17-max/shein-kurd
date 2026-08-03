-- ============================================================================
-- Let every member of staff read every Kurdistani order again.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run as many times as you like. No order is inserted, changed or deleted.
--
-- KURDISTANI ONLY
-- orders_iraqi is not touched by this file at all — not its policies, not its grants,
-- nothing. Every order goes to Kurdistani for now; the Iraqi branch gets set up when you
-- say so, and doing it early would mean guessing at rules you have not decided yet.
--
-- WHAT IS WRONG
-- Signed in as each role and counted, the same table looks like three different tables:
--
--     as moderator  sees  1545 of 2019 orders,   7 of 22 in August
--     as admin      sees  2019 of 2019 orders,  22 of 22 in August
--     as owner      sees  2019 of 2019 orders,  22 of 22 in August
--
-- Nothing is missing from the database. A moderator is simply not allowed to see an order
-- somebody else created, so fifteen of August's orders are invisible to them and the app
-- looks as though those orders were never saved.
--
-- The 1545 they do see is their own orders plus the older rows that record no author at
-- all, which is why the gap is not obvious until you count.
--
-- WHAT THIS CHANGES
-- Reading only. Any signed-in member of staff may read every Kurdistani order, which is how
-- the shop worked before the restriction. Who created an order is still recorded on every
-- new one and still shown in the team report — tracking and hiding are different things,
-- and only the hiding is being undone here.
--
-- Anonymous visitors are unaffected: they had nothing before and have nothing after.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Clear out every existing read policy, by name, from the catalogue
--
-- The names are read rather than listed because the ones doing the restricting were added
-- outside this file and cannot be guessed. Permissive policies combine with OR, so a
-- leftover "only your own" policy would do no harm on its own — but the earlier gift card
-- lockdown failed for exactly this reason, and the same care is worth taking.
--
-- Only SELECT and ALL policies are dropped. The insert, update and delete rules are left
-- exactly as they are, so nothing about who may create or remove an order changes.
-- ----------------------------------------------------------------------------

do $$
declare
  p record;
  removed int := 0;
begin
  for p in
    select policyname, cmd from pg_policies
    where schemaname = 'public'
      and tablename = 'orders_kurdistani'
      and cmd in ('SELECT', 'ALL')
  loop
    execute format('drop policy %I on public.orders_kurdistani', p.policyname);
    removed := removed + 1;
    raise notice 'dropped % policy %', p.cmd, p.policyname;
  end loop;
  raise notice 'removed % read policy(ies) from orders_kurdistani', removed;
end $$;

-- ----------------------------------------------------------------------------
-- 2. One read policy: signed-in staff see everything
-- ----------------------------------------------------------------------------

alter table public.orders_kurdistani enable row level security;

-- `to authenticated` is what keeps anonymous visitors out. Without it, `using (true)`
-- would hand the whole order book to anybody holding the publishable key.
create policy "staff read all kurdistani orders"
  on public.orders_kurdistani for select to authenticated
  using (true);

revoke all on public.orders_kurdistani from anon;

-- ----------------------------------------------------------------------------
-- 3. Checks — paste me this output
-- ----------------------------------------------------------------------------

-- Expect one SELECT policy, for authenticated, with qual = true. A second SELECT or ALL
-- policy would be another rule still in play and worth looking at.
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename = 'orders_kurdistani'
order by cmd, policyname;

-- Expect rls_enabled = true.
select relname, relrowsecurity as rls_enabled
from pg_class
where oid = 'public.orders_kurdistani'::regclass;

-- Every role should now report this number in the app.
select count(*) as kurdistani_orders from public.orders_kurdistani;
