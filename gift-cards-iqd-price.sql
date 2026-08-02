-- ============================================================================
-- One new column: what a gift card actually cost in IQD.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run twice. It adds a column and changes no existing value.
--
-- Until now the IQD figure on the screen was worked out from a fixed rate — 401,865 per
-- $300 for Zaincash, 419,250 for Qi card. That is a guess at the price, not the price. This
-- column holds the real one, per card, so what you paid is recorded rather than estimated.
--
-- Left empty on purpose for the cards already in the table. The screen falls back to the
-- old rate calculation wherever this is empty and shows it as an estimate, so nothing looks
-- broken and you can fill the real figures in as you go.
-- ============================================================================

alter table public.gift_cards
  add column if not exists iqd_price numeric(14, 2);

comment on column public.gift_cards.iqd_price is
  'What this card cost in IQD. Empty means it was never recorded, and the screen shows an estimate from the payment method rate instead.';

-- No policy or grant changes are needed. Staff already hold update on this table, and the
-- gift_cards_guard trigger only refuses changes to a card''s code, its amount, or an attempt
-- to un-use it — a new column is none of those.

-- ----------------------------------------------------------------------------
-- Check — expect one row, numeric, nullable
-- ----------------------------------------------------------------------------

select column_name, data_type, numeric_precision, numeric_scale, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'gift_cards' and column_name = 'iqd_price';
