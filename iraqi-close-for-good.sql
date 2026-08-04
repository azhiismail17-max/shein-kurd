-- ============================================================================
-- Move the last Iraqi orders across and stop the table accepting any more.
--
-- Run this in the Supabase dashboard: SQL Editor -> New query -> Run.
-- RUN IT NOW rather than waiting for a deploy. Here is why.
--
-- WHY THE APP CHANGE IS NOT ENOUGH
-- The app already refuses to create an Iraqi order, and that is deployed. But a browser
-- keeps running the version it loaded, so anyone who had the app open before the deploy is
-- still on the old code and their orders still go to the Iraqi table. Two arrived this
-- morning that way — one of them ninety seconds before this file was written, both by
-- M Kawsar, who is clearly working right now.
--
-- A database rule does not care which version of the app is asking. This closes the table
-- itself, so an Iraqi order cannot be written from any build, any browser, any tab left open
-- over lunch.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. What is still sitting in the Iraqi table
-- ----------------------------------------------------------------------------

select id, insta, name, price, order_month, staff_name, created_at
from public.orders_iraqi
order by id;

-- ----------------------------------------------------------------------------
-- 2. Move them to Kurdistani
--
-- Every column is copied except id, which the Kurdistani table assigns itself, and region,
-- which is written as 'kurdistani' because that is what the order now is. unique_order_id
-- comes across unchanged so the order keeps the key an edit or delete matches on.
--
-- `where not exists` makes this safe to run twice: an order already carried across by key is
-- not copied again.
-- ----------------------------------------------------------------------------

insert into public.orders_kurdistani (
  date, insta, name, place, phone, fib, price, box_cost, pics_text, shipping_cost,
  box_name, lost, profit, track_no, initial_payment, link, note, extra, status,
  primary_urls, proof_urls, warning_url, unique_order_id, admin_name, admin_role,
  linked_order_ids, is_finished, order_month, order_year, region, sheet_row,
  staff_id, staff_name, staff_role, created_at
)
select
  i.date, i.insta, i.name, i.place, i.phone, i.fib, i.price, i.box_cost, i.pics_text,
  i.shipping_cost, i.box_name, i.lost, i.profit, i.track_no, i.initial_payment, i.link,
  i.note, i.extra, i.status, i.primary_urls, i.proof_urls, i.warning_url,
  i.unique_order_id, i.admin_name, i.admin_role, i.linked_order_ids, i.is_finished,
  i.order_month, i.order_year, 'kurdistani', i.sheet_row,
  i.staff_id, i.staff_name, i.staff_role, i.created_at
from public.orders_iraqi i
where i.unique_order_id is null
   or not exists (
     select 1 from public.orders_kurdistani k
     where k.unique_order_id = i.unique_order_id
   );

-- ----------------------------------------------------------------------------
-- 3. Empty the Iraqi table
--
-- Only runs after the copy above, and only what has a counterpart in Kurdistani. If the
-- copy failed, this deletes nothing.
-- ----------------------------------------------------------------------------

delete from public.orders_iraqi i
where exists (
  select 1 from public.orders_kurdistani k
  where k.unique_order_id = i.unique_order_id
);

-- ----------------------------------------------------------------------------
-- 4. Shut the door
--
-- No insert policy and no insert privilege, so nothing can add an order here whatever the
-- app happens to be running. Reading is left alone, so if anything does still point at this
-- table it gets an empty list rather than an error.
--
-- To reopen the branch later:
--   grant insert on public.orders_iraqi to authenticated;
--   create policy "staff create iraqi orders" on public.orders_iraqi
--     for insert to authenticated with check (true);
-- ----------------------------------------------------------------------------

do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'orders_iraqi'
      and cmd in ('INSERT', 'ALL')
  loop
    execute format('drop policy %I on public.orders_iraqi', p.policyname);
    raise notice 'dropped insert policy %', p.policyname;
  end loop;
end $$;

revoke insert on public.orders_iraqi from authenticated;
revoke insert on public.orders_iraqi from anon;
revoke all on public.orders_iraqi from anon;

-- ----------------------------------------------------------------------------
-- 5. Checks
-- ----------------------------------------------------------------------------

-- Expect 0.
select count(*) as iraqi_orders_left from public.orders_iraqi;

-- Expect no INSERT row for authenticated.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'orders_iraqi'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;

-- Expect no INSERT or ALL policy.
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'orders_iraqi'
order by cmd, policyname;

-- The two orders that came in this morning should now be here, in August.
select sheet_row, insta, price, staff_name, created_at
from public.orders_kurdistani
where insta in ('_twi1ighttt', 'Ros4l1nd')
order by created_at;
