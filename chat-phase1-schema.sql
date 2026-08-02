-- ============================================================================
-- Messaging, phase 1: schema, storage and row level security.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- It is written to be safe to run twice; the second run makes no changes.
--
-- Everything hangs off the profiles table you already have — profiles(id, username,
-- role, region) — so a person needs a profile row to take part in a chat.
--
-- THE ONE THING TO UNDERSTAND BEFORE READING ON
-- A policy on topic_participants that asks "is this user a participant?" by selecting
-- from topic_participants sends Postgres into infinite recursion and every query on the
-- table fails with 42P17. That is the single most common way a chat schema like this
-- breaks. It is avoided here with a SECURITY DEFINER function, which runs as its owner
-- and so reads the table without re-triggering the policy. Every policy below asks that
-- one function rather than querying membership directly.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------------

-- A conversation. One table for all three kinds so messages only need one foreign key.
--   'direct'  one-to-one between exactly two people
--   'general' the everyone channel; needs no participant rows, see the policies
--   'topic'   a named group whose creator picks who is in it
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct', 'general', 'topic')),
  title text,
  created_by uuid references public.profiles (id) on delete set null,
  -- The two people in a direct chat, smaller uuid first. A plain pair of columns lets
  -- the same two people end up with two separate threads depending on who opened it
  -- first, which is the classic duplicate-conversation bug. One canonical string with a
  -- unique index makes that impossible. Null for group chats.
  direct_key text,
  created_at timestamptz not null default now(),
  -- Kept current by a trigger, so the conversation list can be ordered without reading
  -- every message.
  last_message_at timestamptz not null default now()
);

create unique index if not exists topics_direct_key_idx on public.topics (direct_key)
  where direct_key is not null;

-- Only ever one everyone-channel.
create unique index if not exists topics_one_general_idx on public.topics (kind)
  where kind = 'general';

create index if not exists topics_last_message_idx on public.topics (last_message_at desc);

-- Who is in which conversation.
create table if not exists public.topic_participants (
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  added_by uuid references public.profiles (id) on delete set null,
  joined_at timestamptz not null default now(),
  -- How unread counts are worked out: messages in this topic newer than this.
  last_read_at timestamptz not null default now(),
  muted boolean not null default false,
  primary key (topic_id, user_id)
);

create index if not exists topic_participants_user_idx on public.topic_participants (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  -- 'text' carries body; the rest carry media_url. A caption may accompany media, so
  -- body stays usable either way.
  kind text not null default 'text' check (kind in ('text', 'image', 'video', 'audio', 'file')),
  body text,
  media_url text,
  -- Stored so the player can show a duration before the file has loaded. Voice notes
  -- especially: a waveform with no length looks broken.
  media_duration_ms integer check (media_duration_ms is null or media_duration_ms >= 0),
  media_size_bytes bigint check (media_size_bytes is null or media_size_bytes >= 0),
  media_mime text,
  -- Replies, Messenger style. Self-referencing, and set null so answering a message
  -- that is later unsent does not take the reply with it.
  reply_to uuid references public.messages (id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  -- Unsend is a soft delete. The row stays so replies and reactions keep their anchor,
  -- and because nothing in this database is removed except on purpose.
  deleted_at timestamptz,
  -- A message has to say something: either words or a file.
  constraint messages_have_content check (
    (kind = 'text' and coalesce(btrim(body), '') <> '')
    or (kind <> 'text' and coalesce(btrim(media_url), '') <> '')
  )
);

-- The index the message list actually uses: newest first within one conversation.
create index if not exists messages_topic_created_idx
  on public.messages (topic_id, created_at desc);

create index if not exists messages_sender_idx on public.messages (sender_id);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (btrim(emoji) <> '' and length(emoji) <= 16),
  created_at timestamptz not null default now(),
  -- One of each emoji per person per message. Without this, a double tap on a slow
  -- connection leaves two identical hearts.
  primary key (message_id, user_id, emoji)
);

create index if not exists message_reactions_message_idx on public.message_reactions (message_id);

-- Realtime sends the old row on a delete only when the table keeps a full copy of it.
-- Without this, removing a reaction arrives with nothing but its primary key and the UI
-- cannot tell which emoji to take away.
alter table public.message_reactions replica identity full;

-- ----------------------------------------------------------------------------
-- 2. Helper functions
--
-- SECURITY DEFINER, so they read the tables without setting the policies off again.
-- search_path is pinned empty and every name written in full: a SECURITY DEFINER
-- function that resolves names loosely can be pointed at an attacker's table by
-- changing the search path.
-- ----------------------------------------------------------------------------

-- May the signed-in user see this conversation?
create or replace function public.chat_is_participant(p_topic uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.topics t
    where t.id = p_topic
      and (
        -- The everyone channel is open to every signed-in member of staff, which is why
        -- it needs no participant rows and nobody can be left out of it by accident.
        t.kind = 'general'
        or t.created_by = auth.uid()
        or exists (
          select 1
          from public.topic_participants tp
          where tp.topic_id = t.id
            and tp.user_id = auth.uid()
        )
      )
  );
$$;

-- Did the signed-in user create this conversation? Decides who may add people.
create or replace function public.chat_is_topic_creator(p_topic uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.topics t
    where t.id = p_topic and t.created_by = auth.uid()
  );
$$;

-- May the signed-in user see this message? Used by the reaction policies.
create or replace function public.chat_can_see_message(p_message uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.messages m
    where m.id = p_message
      and public.chat_is_participant(m.topic_id)
  );
$$;

-- The conversation a media file belongs to, taken from the first folder of its path.
--
-- Returns null rather than raising when the path is not laid out as expected. A plain
-- ::uuid cast in a storage policy throws 22P02 on any oddly named object and takes the
-- whole policy down with it; chat_is_participant(null) is simply false.
create or replace function public.chat_media_topic(p_name text)
returns uuid
language sql
immutable
as $$
  select case
    when split_part(p_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then split_part(p_name, '/', 1)::uuid
    else null
  end;
$$;

-- Keeps topics.last_message_at current so the conversation list sorts without a scan.
create or replace function public.chat_touch_topic()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.topics
    set last_message_at = new.created_at
    where id = new.topic_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_topic on public.messages;
create trigger messages_touch_topic
  after insert on public.messages
  for each row execute function public.chat_touch_topic();

-- Opens the one-to-one conversation with someone, creating it only if it is not there.
--
-- Call this instead of inserting a topic from the app. It is the only way to be sure two
-- people never end up with two threads: the unique index refuses the second one, and the
-- race where both people press at the same instant is caught and turned into the id that
-- won.
create or replace function public.start_direct_chat(p_other uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_key text;
  v_id uuid;
begin
  if v_me is null then
    raise exception 'not signed in';
  end if;
  if p_other is null or p_other = v_me then
    raise exception 'pick somebody else to message';
  end if;
  if not exists (select 1 from public.profiles where id = p_other) then
    raise exception 'that person has no profile';
  end if;

  v_key := case when v_me < p_other
    then v_me::text || ':' || p_other::text
    else p_other::text || ':' || v_me::text
  end;

  select id into v_id from public.topics where direct_key = v_key;
  if v_id is not null then
    return v_id;
  end if;

  begin
    insert into public.topics (kind, created_by, direct_key)
      values ('direct', v_me, v_key)
      returning id into v_id;
  exception when unique_violation then
    -- Both people pressed at the same moment. Whoever lost takes the winner's thread.
    select id into v_id from public.topics where direct_key = v_key;
    return v_id;
  end;

  insert into public.topic_participants (topic_id, user_id, added_by)
    values (v_id, v_me, v_me), (v_id, p_other, v_me)
    on conflict do nothing;

  return v_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Row level security
--
-- Enabled on every table. Note what is deliberately missing: there is no delete policy
-- on topics or messages, so neither can be removed through the app at all. Unsending a
-- message sets deleted_at instead. Reactions and memberships can be removed, because
-- taking a reaction back and leaving a group are ordinary things to do.
-- ----------------------------------------------------------------------------

alter table public.topics enable row level security;
alter table public.topic_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;

-- Anonymous visitors get nothing. Every policy below names `authenticated` only, and the
-- grants are withdrawn from anon as well so a missing policy can never be the one thing
-- standing between the publishable key and the chat history.
revoke all on public.topics from anon;
revoke all on public.topic_participants from anon;
revoke all on public.messages from anon;
revoke all on public.message_reactions from anon;

grant select, insert, update on public.topics to authenticated;
grant select, insert, update, delete on public.topic_participants to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, delete on public.message_reactions to authenticated;

grant execute on function public.start_direct_chat(uuid) to authenticated;
grant execute on function public.chat_is_participant(uuid) to authenticated;
grant execute on function public.chat_is_topic_creator(uuid) to authenticated;
grant execute on function public.chat_can_see_message(uuid) to authenticated;

-- topics -------------------------------------------------------------------
drop policy if exists "see conversations you are in" on public.topics;
create policy "see conversations you are in"
  on public.topics for select to authenticated
  using (public.chat_is_participant(id));

drop policy if exists "start a conversation" on public.topics;
create policy "start a conversation"
  on public.topics for insert to authenticated
  -- Only ever as yourself, and never a second everyone-channel.
  with check (created_by = auth.uid() and kind in ('direct', 'topic'));

drop policy if exists "rename your own conversation" on public.topics;
create policy "rename your own conversation"
  on public.topics for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- topic_participants -------------------------------------------------------
drop policy if exists "see who is in your conversations" on public.topic_participants;
create policy "see who is in your conversations"
  on public.topic_participants for select to authenticated
  using (public.chat_is_participant(topic_id));

drop policy if exists "creator adds people" on public.topic_participants;
create policy "creator adds people"
  on public.topic_participants for insert to authenticated
  -- The creator picks who is in a group. Widen this to owners and admins by adding
  --   or exists (select 1 from public.profiles p
  --              where p.id = auth.uid() and p.role in ('owner','admin'))
  -- if you would rather they could add people to anyone's group.
  with check (public.chat_is_topic_creator(topic_id));

drop policy if exists "mark your own place" on public.topic_participants;
create policy "mark your own place"
  on public.topic_participants for update to authenticated
  -- This is how last_read_at and muted get written. Only your own row.
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "leave, or be removed by the creator" on public.topic_participants;
create policy "leave, or be removed by the creator"
  on public.topic_participants for delete to authenticated
  using (user_id = auth.uid() or public.chat_is_topic_creator(topic_id));

-- messages -----------------------------------------------------------------
drop policy if exists "read messages in your conversations" on public.messages;
create policy "read messages in your conversations"
  on public.messages for select to authenticated
  using (public.chat_is_participant(topic_id));

drop policy if exists "send as yourself" on public.messages;
create policy "send as yourself"
  on public.messages for insert to authenticated
  -- Both halves matter: sender_id = auth.uid() stops anyone posting under another
  -- name, and the participation check stops posting into a conversation they are not in.
  with check (sender_id = auth.uid() and public.chat_is_participant(topic_id));

drop policy if exists "edit or unsend your own message" on public.messages;
create policy "edit or unsend your own message"
  on public.messages for update to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- message_reactions --------------------------------------------------------
drop policy if exists "see reactions you can see messages for" on public.message_reactions;
create policy "see reactions you can see messages for"
  on public.message_reactions for select to authenticated
  using (public.chat_can_see_message(message_id));

drop policy if exists "react as yourself" on public.message_reactions;
create policy "react as yourself"
  on public.message_reactions for insert to authenticated
  with check (user_id = auth.uid() and public.chat_can_see_message(message_id));

drop policy if exists "take your own reaction back" on public.message_reactions;
create policy "take your own reaction back"
  on public.message_reactions for delete to authenticated
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. Storage for chat media
--
-- PRIVATE, on purpose. "Only participants may view" cannot be done with a public
-- bucket: a public bucket serves anybody who has the URL, policies or not, and chat
-- media URLs end up in message rows, logs and link previews. Because it is private the
-- app has to ask for a signed URL to display anything:
--
--   const { data } = await supabase.storage
--     .from("chat-media")
--     .createSignedUrl(path, 60 * 60);   // one hour
--
-- Store the *path* in messages.media_url, not a signed URL — signed URLs expire, and a
-- message that has to keep working for years cannot hold one.
--
-- Uploads must be named  <topic_id>/<anything>  because that first folder is what the
-- policies read to decide who may see the file:
--
--   await supabase.storage.from("chat-media").upload(`${topicId}/${crypto.randomUUID()}.webm`, blob)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media',
  'chat-media',
  false,
  52428800, -- 50 MB, enough for a short video; voice notes are a few hundred KB
  array['image/*', 'video/*', 'audio/*']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 52428800,
      allowed_mime_types = array['image/*', 'video/*', 'audio/*'];

drop policy if exists "participants read chat media" on storage.objects;
create policy "participants read chat media"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-media'
    and public.chat_is_participant(public.chat_media_topic(name))
  );

drop policy if exists "participants upload chat media" on storage.objects;
create policy "participants upload chat media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-media'
    and public.chat_is_participant(public.chat_media_topic(name))
  );

-- No update and no delete policy: media is never overwritten or removed through the
-- app. A replacement is a new upload under a new name.

-- ----------------------------------------------------------------------------
-- 5. The everyone channel
-- ----------------------------------------------------------------------------

insert into public.topics (kind, title, created_by)
select 'general', 'General', (
  select id from public.profiles where role = 'owner' order by created_at limit 1
)
where not exists (select 1 from public.topics where kind = 'general');

-- ----------------------------------------------------------------------------
-- 6. Checks — read the output of these before moving on to phase 2
-- ----------------------------------------------------------------------------

-- Four tables, RLS on for all of them.
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relname in ('topics', 'topic_participants', 'messages', 'message_reactions')
order by relname;

-- Every policy, and who it applies to. Expect 'authenticated' throughout and no anon.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname in ('public', 'storage')
  and (tablename in ('topics', 'topic_participants', 'messages', 'message_reactions')
       or policyname like '%chat media%')
order by tablename, policyname;

-- The bucket must come back public = false.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'chat-media';

-- One general topic, holding the title 'General'.
select id, kind, title, last_message_at from public.topics where kind = 'general';
