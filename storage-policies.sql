-- Lets the app store order photos in Supabase instead of a third-party image host.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run twice — each policy is dropped by name first.
--
-- The order-images bucket is already there and set up correctly: public, a 10 MB limit per
-- file, images only. What it has is no policies at all, so every upload is refused with
-- "new row violates row-level security policy" — signed-in staff included. Verified just
-- now: the bucket holds 0 objects, and an upload attempt comes back 403. Until this runs,
-- the app quietly falls back to the old image host and nothing reaches Supabase.

-- Signed-in staff may add photos. `to authenticated` excludes the anon role, so a stranger
-- holding the publishable key still gets nothing.
drop policy if exists "staff can upload order images" on storage.objects;
create policy "staff can upload order images"
on storage.objects for insert to authenticated
with check (bucket_id = 'order-images');

-- Anyone may view them. The photos are rendered in an <img> tag, which sends no auth
-- header, and the bucket is public — so reads have to be open or no picture appears.
drop policy if exists "order images are publicly readable" on storage.objects;
create policy "order images are publicly readable"
on storage.objects for select
using (bucket_id = 'order-images');

-- Deliberately absent: update and delete.
--
-- With no policy for either, nothing can overwrite or remove a photo through the app, which
-- matches the rule that nothing here is deleted except when you press delete on an order. A
-- photo is replaced by uploading a new one under a new name, never by rewriting a file.
-- Anything that genuinely must go can still be removed from the dashboard.

-- Both policies name bucket_id = 'order-images' on purpose. storage.objects is one shared
-- table for every bucket, so a policy without that condition would apply to all of them.
-- For the same reason this file only ever drops its own two policies by name: clearing out
-- every policy on storage.objects would reach buckets this has nothing to do with.

-- ----------------------------------------------------------------------------
-- Check — paste me this output
--
-- Expect the two policies below. Any other INSERT policy on storage.objects without a
-- bucket_id condition would be a way into every bucket.
-- ----------------------------------------------------------------------------

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by cmd, policyname;
