-- PAN 피벗: 플레이리스트 → 정보글(posts) 중심. Supabase SQL 에디터에서 실행.
-- 기존 posts / post_images / comments / likes 테이블이 있다고 가정합니다.

-- posts: 작성자·태그
alter table public.posts add column if not exists author_name text not null default '';
alter table public.posts add column if not exists tags text[] not null default '{}';
alter table public.posts alter column category drop not null;

-- 댓글: 닉네임, 비밀번호는 선택(기존 스키마 호환)
alter table public.comments add column if not exists user_name text;
alter table public.comments alter column password_hash drop not null;

-- 좋아요 토글용 유니크 (이미 있으면 무시)
create unique index if not exists likes_post_id_client_key_unique
  on public.likes (post_id, client_key);

-- 좋아요 감소 RPC (토글 취소)
create or replace function public.decrement_likes(p_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set likes_count = greatest(likes_count - 1, 0)
  where id = p_post_id;
end;
$$;

-- Storage: 공개 버킷 `post-images` (또는 .env 의 이름) 생성은 대시보드에서.
-- Policies 예시 (공개 읽기, 인증된 업로드 또는 서비스 롤만 업로드):
-- insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);

comment on table public.posts is '자기계발·실행 기록 정보글';
