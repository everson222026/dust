create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 60),
  bio text not null default '',
  photo_url text not null default '',
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 2000),
  category text not null check (
    category in ('Estranho', 'Inútil', 'Antigo', 'Tecnologia', 'Casa', 'Curioso')
  ),
  image_url text not null default '',
  why_useless text not null default '',
  history text not null default '',
  location text not null default '',
  condition text not null default '',
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_id_idx on public.posts (author_id);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_id_idx on public.follows (following_id);

create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.saved_posts (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index comments_post_id_created_at_idx
  on public.comments (post_id, created_at);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  target_user_id uuid references public.profiles (id) on delete set null,
  target_post_id uuid references public.posts (id) on delete set null,
  type text not null check (type in ('follow', 'like', 'comment', 'publication')),
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create index activities_recipient_created_at_idx
  on public.activities (recipient_id, created_at desc);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
begin
  base_username := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data ->> 'display_name', 'visitante'),
      '[^a-zA-Z0-9]+',
      '_',
      'g'
    )
  );

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    trim(both '_' from base_username) || '_' || substr(new.id::text, 1, 6),
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Visitante')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace function public.create_social_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_author uuid;
  actor_id uuid;
  post_id uuid;
  target_id uuid;
  activity_type text;
  activity_message text;
  actor_name text;
begin
  if tg_table_name = 'posts' then
    actor_id := new.author_id;
    post_id := new.id;
    activity_type := 'publication';
    select display_name into actor_name
      from public.profiles where id = actor_id;

    insert into public.activities (
      recipient_id, actor_id, target_post_id, type, message
    )
    select follower_id, actor_id, post_id, activity_type,
      actor_name || ' adicionou uma peça ao acervo.'
    from public.follows
    where following_id = actor_id and follower_id <> actor_id;

    return new;
  elsif tg_table_name = 'follows' then
    actor_id := new.follower_id;
    target_id := new.following_id;
    activity_type := 'follow';
    select display_name into actor_name
      from public.profiles where id = actor_id;

    insert into public.activities (
      recipient_id, actor_id, target_user_id, type, message
    ) values (
      target_id, actor_id, actor_id, activity_type,
      actor_name || ' começou a seguir você.'
    );

    return new;
  elsif tg_table_name = 'likes' then
    actor_id := new.user_id;
    post_id := new.post_id;
    activity_type := 'like';
  else
    actor_id := new.author_id;
    post_id := new.post_id;
    activity_type := 'comment';
  end if;

  select author_id into post_author
    from public.posts where id = post_id;

  if post_author is null or post_author = actor_id then
    return new;
  end if;

  select display_name into actor_name
    from public.profiles where id = actor_id;

  activity_message := case activity_type
    when 'like' then actor_name || ' curtiu sua peça.'
    else actor_name || ' comentou em sua peça.'
  end;

  insert into public.activities (
    recipient_id, actor_id, target_post_id, type, message
  ) values (
    post_author, actor_id, post_id, activity_type, activity_message
  );

  return new;
end;
$$;

create trigger notify_followers_of_new_posts
  after insert on public.posts
  for each row execute procedure public.create_social_activity();

create trigger notify_user_of_new_followers
  after insert on public.follows
  for each row execute procedure public.create_social_activity();

create trigger notify_post_author_of_likes
  after insert on public.likes
  for each row execute procedure public.create_social_activity();

create trigger notify_post_author_of_comments
  after insert on public.comments
  for each row execute procedure public.create_social_activity();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.saved_posts enable row level security;
alter table public.comments enable row level security;
alter table public.activities enable row level security;

create policy "Profiles are visible to visitors"
  on public.profiles for select to anon, authenticated using (true);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Published pieces are visible to visitors"
  on public.posts for select to anon, authenticated using (true);
create policy "Users can publish their own pieces"
  on public.posts for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy "Users can edit their own pieces"
  on public.posts for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "Users can remove their own pieces"
  on public.posts for delete to authenticated
  using ((select auth.uid()) = author_id);

create policy "Follow lists are visible to visitors"
  on public.follows for select to anon, authenticated using (true);
create policy "Users can follow other visitors"
  on public.follows for insert to authenticated
  with check ((select auth.uid()) = follower_id and follower_id <> following_id);
create policy "Users can unfollow visitors"
  on public.follows for delete to authenticated
  using ((select auth.uid()) = follower_id);

create policy "Likes are visible to visitors"
  on public.likes for select to anon, authenticated using (true);
create policy "Users can like pieces"
  on public.likes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can remove their likes"
  on public.likes for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can see their saved pieces"
  on public.saved_posts for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can save pieces"
  on public.saved_posts for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can remove saved pieces"
  on public.saved_posts for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Comments are visible to visitors"
  on public.comments for select to anon, authenticated using (true);
create policy "Signed-in visitors can comment"
  on public.comments for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy "Users can remove their own comments"
  on public.comments for delete to authenticated
  using ((select auth.uid()) = author_id);

create policy "Users can see their own activities"
  on public.activities for select to authenticated
  using ((select auth.uid()) = recipient_id);
create policy "Users can mark their own activities as read"
  on public.activities for update to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

grant select on public.profiles, public.posts, public.follows, public.likes, public.comments
  to anon, authenticated;
grant insert, update, delete on public.profiles, public.posts, public.follows,
  public.likes, public.saved_posts, public.comments
  to authenticated;
grant select on public.saved_posts, public.activities to authenticated;
grant update (read) on public.activities to authenticated;

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Post images are visible to visitors"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'post-images');
create policy "Visitors can upload images to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Visitors can update images in their own folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Visitors can delete images in their own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
