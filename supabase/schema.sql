-- PAN 앱은 `posts` / `post_images` / `comments` / `likes` 를 사용합니다.
-- 피벗 후 DB 정렬: `supabase/migration_pivot_to_posts.sql` 참고.
-- 하단 `playlists` 블록은 레거시이며 앱에서 사용하지 않습니다.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'cert',
  title text not null,
  content text not null,
  password_hash text not null,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  image_url text not null,
  sort_order integer
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  content text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  client_key text,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

create policy "Public read posts"
  on public.posts
  for select
  using (true);

create policy "Service role write posts"
  on public.posts
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Public read post_images"
  on public.post_images
  for select
  using (true);

create policy "Service role write post_images"
  on public.post_images
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Public read comments"
  on public.comments
  for select
  using (true);

create policy "Service role write comments"
  on public.comments
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Public read likes"
  on public.likes
  for select
  using (true);

create policy "Service role write likes"
  on public.likes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.increment_likes(p_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set likes_count = likes_count + 1
  where id = p_post_id;
end;
$$;

create or replace function public.increment_comments(p_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set comments_count = comments_count + 1
  where id = p_post_id;
end;
$$;

create or replace function public.decrement_comments(p_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set comments_count = greatest(comments_count - 1, 0)
  where id = p_post_id;
end;
$$;

-- Playlist sharing (run on existing projects: paste from here if tables already exist)
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  title text not null,
  description text,
  source_type text not null check (source_type in ('spotify', 'youtube')),
  source_url text not null,
  source_id text,
  cover_image_url text,
  author_name text,
  track_count integer,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists playlists_created_at_idx on public.playlists (created_at desc);
create index if not exists playlists_tags_idx on public.playlists using gin (tags);

alter table public.playlists enable row level security;

create policy "Public read playlists"
  on public.playlists
  for select
  using (true);

create policy "Service role write playlists"
  on public.playlists
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Playlist engagement (기존 DB: 아래 alter / create 는 SQL 에디터에서 순서대로 실행)
alter table public.playlists add column if not exists likes_count integer not null default 0;
alter table public.playlists add column if not exists comments_count integer not null default 0;

create table if not exists public.playlist_comments (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_name text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists playlist_comments_playlist_idx
  on public.playlist_comments (playlist_id, created_at);

create table if not exists public.playlist_likes (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  client_key text not null,
  created_at timestamptz not null default now(),
  unique (playlist_id, client_key)
);

create index if not exists playlist_likes_playlist_idx on public.playlist_likes (playlist_id);

alter table public.playlist_comments enable row level security;
alter table public.playlist_likes enable row level security;

create policy "Public read playlist_comments"
  on public.playlist_comments for select using (true);

create policy "Service role write playlist_comments"
  on public.playlist_comments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Public read playlist_likes"
  on public.playlist_likes for select using (true);

create policy "Service role write playlist_likes"
  on public.playlist_likes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.increment_playlist_likes(p_playlist_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.playlists set likes_count = likes_count + 1 where id = p_playlist_id;
end;
$$;

create or replace function public.decrement_playlist_likes(p_playlist_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.playlists set likes_count = greatest(likes_count - 1, 0) where id = p_playlist_id;
end;
$$;

create or replace function public.increment_playlist_comments(p_playlist_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.playlists set comments_count = comments_count + 1 where id = p_playlist_id;
end;
$$;

-- 수정/삭제용 숫자 PIN (bcrypt 해시 저장 권장)
alter table public.playlists add column if not exists password_hash text;

