-- ============================================================================
-- Gift cards: only the owner and admins may create one.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run as many times as you like.
--
-- WHY THE FIRST VERSION OF THIS FILE DID NOT WORK
-- It dropped one policy by name and added a stricter one. But policies of the permissive
-- kind — the default — are combined with OR, not AND. So the moment any *other* insert
-- policy on the table says yes, the request is allowed no matter how strict this one is.
-- This project already had policies on gift_cards from an earlier lockdown, under names
-- this file did not know, and one of them was letting everybody in. Proved by signing in
-- as a freshly made moderator and creating a card worth 99,999: it came back 201 and the
-- row landed. (That test card has been removed.)
--
-- So this version does not guess at names. It removes *every* policy on gift_cards and
-- then puts back exactly the three that should exist. Nothing else in the database is
-- touched, and no data is deleted.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Who counts as a manager
--
-- SECURITY DEFINER so it can read profiles regardless of the policies on that table, and
-- search_path pinned empty with every name written in full — a definer function that
-- resolves names loosely can be aimed at another schema's table.
-- ----------------------------------------------------------------------------

create or replace function public.is_gift_card_manager()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner', 'admin')
  );
$$;

grant execute on function public.is_gift_card_manager() to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Clear the table's policies out completely
--
-- Every policy, whatever it is called and whichever command it covers. A policy written
-- FOR ALL grants inserts too, so leaving one of those behind would defeat this just as
-- surely as an insert policy would.
--
-- This is why the names are read from the catalogue instead of being listed here: the
-- ones that were doing the damage were not names this file could have known.
-- ----------------------------------------------------------------------------

do $$
declare
  policy_name text;
  removed int := 0;
begin
  for policy_name in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'gift_cards'
  loop
    execute format('drop policy %I on public.gift_cards', policy_name);
    removed := removed + 1;
  end loop;
  raise notice 'removed % existing policy(ies) from gift_cards', removed;
end $$;

-- ----------------------------------------------------------------------------
-- 3. Put back exactly three
-- ----------------------------------------------------------------------------

alter table public.gift_cards enable row level security;

-- Anonymous visitors get nothing at all.
revoke all on public.gift_cards from anon;
grant select, insert, update on public.gift_cards to authenticated;
-- No delete grant and no delete policy: a card is never removed, only used.

-- Creating: managers only.
create policy "only managers create gift cards"
  on public.gift_cards for insert to authenticated
  -- Both halves are needed. The role check is the lockdown; keeping
  -- created_by_staff_id = auth.uid() means a card cannot be attributed to somebody else,
  -- so the record of who made it stays true.
  with check (public.is_gift_card_manager() and created_by_staff_id = auth.uid());

-- Reading: open to staff, deliberately. They need the numbers and PINs to spend a card
-- while taking an order, which is what the Card PINs screen shows them.
create policy "staff read gift cards"
  on public.gift_cards for select to authenticated
  using (true);

-- Redeeming: open to staff, because spending a card is the job of whoever takes the order.
-- What it cannot do is change a card's code or its value, or turn a used card back into an
-- active one — the gift_cards_guard trigger refuses all three, whoever is asking.
create policy "staff redeem gift cards"
  on public.gift_cards for update to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- 4. Checks — paste me this output
-- ----------------------------------------------------------------------------

-- Expect exactly three rows and nothing else. Any fourth policy for INSERT or ALL is
-- another way in, and would need removing.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'gift_cards'
order by cmd, policyname;

-- Expect rls_enabled = true.
select relname, relrowsecurity as rls_enabled
from pg_class
where oid = 'public.gift_cards'::regclass;

-- Who may create a card. Expect true for the owner and admins only.
--
-- The function is not called here on purpose: it reads auth.uid(), and the SQL editor has
-- no signed-in user, so it would return false for everybody and read as though the
-- lockdown were broken. This checks the same condition directly.
select p.username, p.role, (p.role in ('owner', 'admin')) as may_create_cards
from public.profiles p
order by (p.role in ('owner', 'admin')) desc, p.role, p.username;
