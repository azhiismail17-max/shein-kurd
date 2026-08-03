-- ============================================================================
-- Clear August out of Supabase so it can be rebuilt from the Google Sheet.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
--
-- THIS DELETES ORDERS. Read the two counts it prints first, and only then run the
-- delete block. The Google Sheet is not touched by anything in this file — the sheet keeps
-- all 36 August orders and is what they get rebuilt from.
--
-- Everything being removed is already saved to disk:
--   backups/kurdistani_Aug_2026-08-03T21-12-15-059Z.json   31 rows
--   backups/orders_iraqi_2026-08-03T21-12-15-059Z.json      14 rows
--
-- WHY START AGAIN RATHER THAN REPAIR
-- August in Supabase is in three kinds of wrong at once: one order is in twice, four are
-- missing, and nine carry a sheet row number that does not match the row they came from —
-- which means an edit to any of those nine would write over somebody else's order. Patching
-- three faults row by row risks a fourth. The sheet has all 36 orders and is correct, so
-- emptying the month and re-importing is both simpler and easier to check: the count and
-- every row number should match the sheet exactly afterwards.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. What is about to go. Run this on its own first.
-- ----------------------------------------------------------------------------

select 'orders_kurdistani August' as what, count(*) as rows, sum(price) as revenue
from public.orders_kurdistani where order_month = 'Aug'
union all
select 'orders_iraqi (all of it)', count(*), sum(price)
from public.orders_iraqi;

-- Expect: 31 rows for Kurdistani August, and 14 for the whole Iraqi table.
-- If those numbers are different from what you were told, stop and say so.

-- ----------------------------------------------------------------------------
-- 2. The delete
--
-- August only. Every other month in orders_kurdistani is untouched — the WHERE clause is
-- what keeps 1,988 orders from 2025 and the rest of 2026 exactly where they are.
-- ----------------------------------------------------------------------------

delete from public.orders_kurdistani where order_month = 'Aug';

-- The whole Iraqi table. Every row in it is an August order, and all of them are in the
-- Google Sheet, so they come back on the Kurdistani side in the re-import.
delete from public.orders_iraqi;

-- ----------------------------------------------------------------------------
-- 3. Check
-- ----------------------------------------------------------------------------

-- Expect 0 and 0.
select 'orders_kurdistani August' as what, count(*) as rows
from public.orders_kurdistani where order_month = 'Aug'
union all
select 'orders_iraqi', count(*) from public.orders_iraqi;

-- Expect 1,988 — every other month, still there. If this is not 1,988, something deleted
-- more than August and the backups should go straight back in.
select count(*) as all_other_months from public.orders_kurdistani;
