-- ============================================================================
-- Gift cards: bring the table up to the shape the manager needs.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run twice; the second run changes nothing.
--
-- The SQL editor runs the whole script as one transaction, so if any statement fails
-- nothing at all is applied. Re-run the file from the top after a fix rather than trying
-- to run only the part that failed.
--
-- WHY THIS IS AN ALTER AND NOT A CREATE
-- The gift_cards table already exists with a different set of columns —
--   id, date, card_number, card_pin, payment_method, payment_other,
--   card_price, spent, remaining, linked_boxes, notes
-- and it holds a row. The columns below are *added* alongside those, so nothing is
-- dropped and nothing is lost. None of the old columns are NOT NULL, so new-style rows
-- insert cleanly without filling any of them in.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. The new columns
-- ----------------------------------------------------------------------------

alter table public.gift_cards
  add column if not exists code text,
  add column if not exists amount numeric(14, 2),
  add column if not exists status text not null default 'active',
  add column if not exists customer_name text,
  add column if not exists used_at timestamptz,
  add column if not exists created_by_staff_id uuid references public.profiles (id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

-- A card is either spendable or spent. Nothing else.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'gift_cards_status_check'
  ) then
    alter table public.gift_cards
      add constraint gift_cards_status_check check (status in ('active', 'used'));
  end if;
end $$;

-- A used card must say when. Without this, a half-finished redemption leaves a card
-- marked spent with no record of the moment, and the history view has nothing to show.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'gift_cards_used_needs_time'
  ) then
    alter table public.gift_cards
      add constraint gift_cards_used_needs_time
      check (status <> 'used' or used_at is not null);
  end if;
end $$;

-- Codes must be unique, or redeeming one is ambiguous — and ambiguity here means money.
-- Compared without case or surrounding spaces, so "  ab12 " cannot be entered a second
-- time as "AB12".
create unique index if not exists gift_cards_code_unique_idx
  on public.gift_cards (upper(btrim(code)))
  where code is not null;

-- The history view lists newest first.
create index if not exists gift_cards_created_idx on public.gift_cards (created_at desc);
create index if not exists gift_cards_status_idx on public.gift_cards (status);

-- ----------------------------------------------------------------------------
-- 2. A card's code and value cannot change, and a used card cannot be un-used
--
-- Redeeming is one UPDATE, and an UPDATE can touch any column the policy allows. This
-- keeps that update honest: it may mark a card used and name the customer, and nothing
-- else. Without it a typo in the app could quietly rewrite a card's value, or hand a
-- spent card back for a second discount.
-- ----------------------------------------------------------------------------

create or replace function public.gift_cards_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- `old.code is not null` matters. A legacy row that predates these columns has no code
  -- yet, and filling one in for the first time is not a change — without this guard the
  -- backfill in section 4 is refused by the very trigger meant to protect it.
  if old.code is not null and new.code is distinct from old.code then
    raise exception 'a gift card code cannot be changed once it exists';
  end if;
  if old.amount is not null and new.amount is distinct from old.amount then
    raise exception 'a gift card amount cannot be changed once it exists';
  end if;
  if old.status = 'used' and new.status <> 'used' then
    raise exception 'a gift card that has been used cannot be made active again';
  end if;
  return new;
end;
$$;

drop trigger if exists gift_cards_guard_update on public.gift_cards;
create trigger gift_cards_guard_update
  before update on public.gift_cards
  for each row execute function public.gift_cards_guard();

-- ----------------------------------------------------------------------------
-- 3. Row level security
--
-- The table already has RLS enabled with no policies at all, which is why an anonymous
-- read comes back as an empty list — and why signed-in staff cannot read it either. That
-- is the reason the manager would show nothing at all before this section runs.
-- ----------------------------------------------------------------------------

alter table public.gift_cards enable row level security;

revoke all on public.gift_cards from anon;
grant select, insert, update on public.gift_cards to authenticated;

-- Deliberately no delete grant and no delete policy: a card is never removed, only used.

drop policy if exists "staff read gift cards" on public.gift_cards;
create policy "staff read gift cards"
  on public.gift_cards for select to authenticated
  using (true);

drop policy if exists "staff create gift cards" on public.gift_cards;
create policy "staff create gift cards"
  on public.gift_cards for insert to authenticated
  -- A card records who made it, and cannot be attributed to somebody else.
  with check (created_by_staff_id = auth.uid());

drop policy if exists "staff redeem gift cards" on public.gift_cards;
create policy "staff redeem gift cards"
  on public.gift_cards for update to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- 4. The one legacy row
--
-- Optional. It gives the existing sample card a code, an amount and a status so it shows
-- up in the history list instead of sitting there blank. Skip this if you would rather
-- leave it untouched. Nothing is deleted either way.
-- ----------------------------------------------------------------------------

update public.gift_cards
  set code = card_number::text,
      amount = card_price,
      status = case when coalesce(remaining, 0) > 0 then 'active' else 'used' end,
      used_at = case when coalesce(remaining, 0) > 0 then null else now() end,
      -- created_at was added with `default now()`, which stamps every existing row with
      -- the moment this script runs. The orders table was given that same default and it
      -- filed two thousand rows under a single day. The old `date` column holds the real
      -- one, so it is used wherever it can be read.
      created_at = coalesce(
        case when btrim(coalesce(date, '')) <> '' then date::timestamptz else null end,
        created_at
      )
  where code is null
    and card_number is not null;

-- ----------------------------------------------------------------------------
-- 5. Checks — send me this output and I will confirm before we rely on it
-- ----------------------------------------------------------------------------

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'gift_cards'
  and column_name in ('code', 'amount', 'status', 'customer_name',
                      'used_at', 'created_by_staff_id', 'created_at')
order by column_name;

select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'gift_cards'
order by policyname;

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.gift_cards'::regclass and contype = 'c'
order by conname;

select id, code, amount, status, customer_name, used_at from public.gift_cards order by id;
