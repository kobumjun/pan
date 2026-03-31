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

