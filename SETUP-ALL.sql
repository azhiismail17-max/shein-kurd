-- ============================================================================
-- The whole database setup, in one file.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run again — every step is written to be repeatable.
--
-- NO ORDER IS DELETED ANYWHERE IN THIS FILE. Not one delete statement against
-- orders_kurdistani, orders_iraqi or gift_cards. August is already correct (37 orders,
-- matching the sheet) and the Iraqi table is already empty; a file that could wipe either
-- has no business being re-runnable.
--
-- ----------------------------------------------------------------------------
-- THREE THINGS CHANGED FROM THE SQL YOU SENT
--
-- 1. M Kawsar and M Papula move to region 'kurdistani'.
--    Your policies read `using (current_region() = 'kurdistani')`, and both moderators are
--    recorded as region 'iraqi'. That condition is false for them, so running your file as
--    written would have shown them zero Kurdistani orders — locked out of the only branch
--    that has any work in it. This is the same root cause behind every "why can't I see the
--    orders" of the last few hours.
--
-- 2. The Kurdistani read policy has no staff_id condition.
--    Your second block narrowed reads to `staff_id = auth.uid() or staff_id is null`. That
--    is what hid fifteen of August's orders from a moderator: an order created by someone
--    else is invisible. You have said several times that all staff should see all orders, so
--    the read is by region only. Who created an order is still recorded and still drives the
--    team report — tracking and hiding are different things.
--
-- 3. The column type changes are left out.
--    phone, warning_url and linked_order_ids are already text in both tables, and sheet_row,
--    staff_id and created_at all already exist. Altering a column to the type it already has
--    rewrites the whole table for no reason.
--
-- ----------------------------------------------------------------------------
-- HOW THE IRAQI BRANCH IS CLOSED
--
-- The table stays. Its policies stay. What is gone is anyone who can reach it: every policy
-- on orders_iraqi requires current_region() = 'iraqi', and after this file runs nobody has
-- that region. So the table is unreachable today without a single special case.
--
-- When you add the Iraqi moderator, that one insert into profiles with region 'iraqi' opens
-- the Iraqi table to them and nothing else — they will not see a Kurdistani order, and
-- Kurdistani staff will not see theirs. No SQL changes needed then.
-- ============================================================================


-- ============================================================================
-- 1. Profiles, and the two functions the policies ask
-- ============================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text not null unique,
  role       text not null check (role in ('owner', 'admin', 'moderator', 'delivery')),
  region     text not null check (region in ('kurdistani', 'iraqi')),
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so a policy can read profiles without needing a policy on profiles,
-- which would recurse. search_path is pinned and every name written in full: a definer
-- function that resolves names loosely can be pointed at another schema's table.
create or replace function public.current_region()
returns text language sql security definer stable set search_path = '' as
$$ select region from public.profiles where id = auth.uid() $$;

create or replace function public.current_role_name()
returns text language sql security definer stable set search_path = '' as
$$ select role from public.profiles where id = auth.uid() $$;

grant execute on function public.current_region() to authenticated;
grant execute on function public.current_role_name() to authenticated;


-- ============================================================================
-- 2. Who works where
--
-- Everyone is Kurdistani. That is the whole point of the change: one branch, one table.
-- Matched on the email each account signs in with, so a missing account is skipped rather
-- than creating a profile pointing at nothing.
-- ============================================================================

insert into public.profiles (id, username, role, region)
select u.id, v.username, v.role, v.region
from (values
  ('azhiismail17@gmail.com',   'Owner',    'owner',     'kurdistani'),
  ('admin@shein-kurd.local',   'Admin',    'admin',     'kurdistani'),
  ('kawsardler9@gmail.com',    'M Kawsar', 'moderator', 'kurdistani'),
  ('papulagull984@gmail.com',  'M Papula', 'moderator', 'kurdistani')
) as v(email, username, role, region)
join auth.users u on u.email = v.email
on conflict (id) do update set
  username = excluded.username,
  role     = excluded.role,
  region   = excluded.region;

-- Anything already in profiles that this file did not name is moved to Kurdistani too, so
-- no account is left stranded on a region that can reach nothing.
update public.profiles set region = 'kurdistani' where region <> 'kurdistani';


-- ============================================================================
-- 3. Columns the app needs
--
-- All `if not exists`, so this section does nothing on a second run.
-- ============================================================================

alter table public.orders_kurdistani
  add column if not exists sheet_row  bigint,
  add column if not exists staff_id   uuid references auth.users (id),
  add column if not exists staff_name text,
  add column if not exists staff_role text,
  add column if not exists created_at timestamptz not null default now();

alter table public.orders_iraqi
  add column if not exists sheet_row  bigint,
  add column if not exists staff_id   uuid references auth.users (id),
  add column if not exists staff_name text,
  add column if not exists staff_role text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists orders_kurdistani_staff_id_idx on public.orders_kurdistani (staff_id);
create index if not exists orders_iraqi_staff_id_idx      on public.orders_iraqi (staff_id);
create index if not exists orders_kurdistani_month_idx    on public.orders_kurdistani (order_month);


-- ============================================================================
-- 4. Row level security, and nothing for anonymous visitors
-- ============================================================================

alter table public.orders_kurdistani enable row level security;
alter table public.orders_iraqi      enable row level security;
alter table public.profiles          enable row level security;
alter table public.gift_cards        enable row level security;

revoke all on public.orders_kurdistani from anon;
revoke all on public.orders_iraqi      from anon;
revoke all on public.profiles          from anon;
revoke all on public.gift_cards        from anon;

grant select, insert, update, delete on public.orders_kurdistani to authenticated;
grant select, insert, update, delete on public.orders_iraqi      to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.gift_cards to authenticated;
-- No delete on gift_cards, for anyone: a card is used, never removed.
revoke delete on public.gift_cards from authenticated;
-- TRUNCATE ignores row level security entirely — one statement would empty a table whatever
-- the policies say. REFERENCES and TRIGGER are no use to an application role either.
revoke truncate, references, trigger on public.orders_kurdistani from authenticated;
revoke truncate, references, trigger on public.orders_iraqi      from authenticated;
revoke truncate, references, trigger on public.gift_cards        from authenticated;
revoke truncate, references, trigger on public.profiles          from authenticated;


-- ============================================================================
-- 5. Clear out every old policy, then write the ones that should exist
--
-- Read from the catalogue rather than dropped by name. Permissive policies combine with OR,
-- so one forgotten policy saying "yes" defeats every strict one beside it — which is exactly
-- how an earlier gift card lockdown failed while looking correct.
-- ============================================================================

do $$
declare
  p record;
  removed int := 0;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('orders_kurdistani', 'orders_iraqi', 'profiles', 'gift_cards')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    removed := removed + 1;
  end loop;
  raise notice 'removed % old policy(ies)', removed;
end $$;


-- Profiles: your own row, so the app can read your role and region.
create policy "read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);


-- Kurdistani ------------------------------------------------------------------
-- Read: every order in the branch. No staff_id condition — all staff see all orders.
create policy "k select" on public.orders_kurdistani
  for select to authenticated
  using (public.current_region() = 'kurdistani');

create policy "k insert" on public.orders_kurdistani
  for insert to authenticated
  with check (public.current_region() = 'kurdistani' and region = 'kurdistani');

-- Edit: anyone in the branch may edit any order. `with check` stops an order being moved to
-- another region on the way through.
create policy "k update" on public.orders_kurdistani
  for update to authenticated
  using (public.current_region() = 'kurdistani')
  with check (region = 'kurdistani');

-- Delete: owner and admin only.
create policy "k delete" on public.orders_kurdistani
  for delete to authenticated
  using (
    public.current_region() = 'kurdistani'
    and public.current_role_name() in ('owner', 'admin')
  );


-- Iraqi -----------------------------------------------------------------------
-- Same four rules, gated on region 'iraqi'. Nobody has that region after this file runs, so
-- the table is closed to everyone — no order can be read from it or written to it. Adding
-- one profile with region 'iraqi' is all it takes to reopen it for that person alone.
create policy "i select" on public.orders_iraqi
  for select to authenticated
  using (public.current_region() = 'iraqi');

create policy "i insert" on public.orders_iraqi
  for insert to authenticated
  with check (public.current_region() = 'iraqi' and region = 'iraqi');

create policy "i update" on public.orders_iraqi
  for update to authenticated
  using (public.current_region() = 'iraqi')
  with check (region = 'iraqi');

create policy "i delete" on public.orders_iraqi
  for delete to authenticated
  using (
    public.current_region() = 'iraqi'
    and public.current_role_name() in ('owner', 'admin')
  );


-- Gift cards ------------------------------------------------------------------
create or replace function public.is_gift_card_manager()
returns boolean language sql security definer stable set search_path = '' as
$$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('owner', 'admin')
  );
$$;

grant execute on function public.is_gift_card_manager() to authenticated;

-- Creating: owner and admin only. Keeping created_by_staff_id = auth.uid() as well means a
-- card cannot be attributed to somebody else.
create policy "only managers create gift cards" on public.gift_cards
  for insert to authenticated
  with check (public.is_gift_card_manager() and created_by_staff_id = auth.uid());

-- Reading: open to staff, who need the number and PIN to spend a card.
create policy "staff read gift cards" on public.gift_cards
  for select to authenticated using (true);

-- Spending: open to staff. The gift_cards_guard trigger still refuses any change to a card's
-- code or its value, and refuses to turn a used card back into an active one.
create policy "staff redeem gift cards" on public.gift_cards
  for update to authenticated using (true) with check (true);


-- ============================================================================
-- 6. Fill in who created the older orders
--
-- Only where it is still blank, and only where the name recorded on the order matches a
-- profile. Nothing is overwritten.
-- ============================================================================

update public.orders_kurdistani o
set staff_id = p.id, staff_name = p.username, staff_role = p.role
from public.profiles p
where o.staff_id is null and lower(o.admin_name) = lower(p.username);

update public.orders_iraqi o
set staff_id = p.id, staff_name = p.username, staff_role = p.role
from public.profiles p
where o.staff_id is null and lower(o.admin_name) = lower(p.username);


-- ============================================================================
-- 7. Gift cards: a real id, and the IQD price column
-- ============================================================================

alter table public.gift_cards
  add column if not exists iqd_price numeric(14, 2);

comment on column public.gift_cards.iqd_price is
  'What this card cost in IQD. Empty means it was never recorded, and the screen shows an estimate from the payment method rate instead.';

-- Ids for any card that has none, numbered oldest first and starting above the highest in
-- use. Matched on code, which carries a unique index.
with numbered as (
  select code,
         row_number() over (order by created_at nulls last, code)
           + coalesce((select max(id) from public.gift_cards), 0) as new_id
  from public.gift_cards
  where id is null
)
update public.gift_cards g
set id = numbered.new_id
from numbered
where g.code = numbered.code and g.id is null;

do $$
begin
  if exists (select 1 from public.gift_cards where id is null) then
    raise notice 'some cards still have no id — leaving the column nullable';
  else
    alter table public.gift_cards alter column id set not null;

    if not exists (
      select 1 from pg_constraint
      where conrelid = 'public.gift_cards'::regclass and contype = 'p'
    ) then
      alter table public.gift_cards add constraint gift_cards_pkey primary key (id);
    end if;

    if not exists (
      select 1 from pg_attribute
      where attrelid = 'public.gift_cards'::regclass
        and attname = 'id' and attidentity <> ''
    ) then
      alter table public.gift_cards alter column id add generated by default as identity;
    end if;

    -- Start counting above the ids in use, or the next insert collides with a card.
    perform setval(
      pg_get_serial_sequence('public.gift_cards', 'id'),
      greatest(coalesce((select max(id) from public.gift_cards), 1), 1)
    );
  end if;
end $$;


-- ============================================================================
-- 8. Order photos in Supabase Storage
--
-- The order-images bucket exists but has no policies, so every upload is refused and the app
-- silently falls back to the old third-party image host.
--
-- Both policies name the bucket. storage.objects is one shared table for every bucket, so a
-- policy without that condition would apply to all of them — and only these two are dropped
-- by name, for the same reason.
-- ============================================================================

drop policy if exists "staff can upload order images" on storage.objects;
create policy "staff can upload order images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'order-images');

-- Photos render in an <img> tag, which sends no auth header, so reads have to be open or no
-- picture appears.
drop policy if exists "order images are publicly readable" on storage.objects;
create policy "order images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'order-images');

-- No update and no delete policy: a photo is replaced by uploading a new one under a new
-- name, never by overwriting or removing a file.


-- ============================================================================
-- 9. Checks — paste me this output
-- ============================================================================

-- Everyone Kurdistani. Nobody on 'iraqi' until you add the new moderator.
select username, role, region from public.profiles order by role, username;

-- Orders, untouched by this file.
select 'orders_kurdistani' as tbl, count(*) as rows from public.orders_kurdistani
union all
select 'orders_kurdistani Aug', count(*) from public.orders_kurdistani where order_month = 'Aug'
union all
select 'orders_iraqi', count(*) from public.orders_iraqi
union all
select 'gift_cards', count(*) from public.gift_cards;
-- Expect roughly 2036 / 37 / 0 / 39.

-- Four policies per orders table, one on profiles, three on gift_cards.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('orders_kurdistani', 'orders_iraqi', 'profiles', 'gift_cards')
order by tablename, cmd, policyname;

-- The two storage policies.
select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by cmd, policyname;

-- No TRUNCATE and no DELETE on gift_cards; no anon anywhere.
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('orders_kurdistani', 'orders_iraqi', 'gift_cards', 'profiles')
  and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;

-- Gift card id should be identity and not nullable.
select column_name, data_type, is_nullable, is_identity
from information_schema.columns
where table_schema = 'public' and table_name = 'gift_cards'
  and column_name in ('id', 'iqd_price')
order by column_name;
