# PAN — 실행형 정보 커뮤니티

자기계발·사업·돈·운동·AI·루틴·마인드셋 등 **정보와 실행 기록**을 빠르게 올리고 보는 Next.js + Supabase 앱입니다.

## 설치

```bash
npm install
```

## 환경 변수 (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_POST_IMAGES_BUCKET` — 이미지 업로드용 Storage **공개** 버킷 이름 (기본값: `post-images`)

## Supabase

1. SQL 에디터에서 `supabase/schema.sql` 기준으로 `posts`, `post_images`, `comments`, `likes` 등이 준비되어 있어야 합니다.
2. **피벗 마이그레이션**: `supabase/migration_pivot_to_posts.sql`을 실행해 `posts.author_name`, `posts.tags`, 댓글 `user_name`, `decrement_likes` RPC 등을 맞춥니다.
3. Storage에서 버킷을 만들고(예: `post-images`), **공개 읽기**가 가능하도록 설정합니다.
4. 브라우저에서 직접 업로드하므로 `supabase/storage_policies_post_images.sql`의 **anon `incoming/` 업로드** 정책을 적용합니다. 버킷 ID가 다르면 SQL의 `post-images`를 수정하세요.

## 페이지

- `/` — 최신 글 목록(촘촘한 리스트), 태그 필터
- `/best` — 좋아요 15개 이상 추천 글
- `/write` — 글쓰기(제목·본문·이미지 다중·작성자·태그·글 비밀번호)
- `/posts/[id]` — 상세, 이미지 갤러리, 좋아요·댓글, 수정/삭제(비밀번호)
- `/posts/[id]/edit` — 제목·본문·태그 수정

## 이전 플레이리스트 기능

Spotify/YouTube 플레이리스트 연동은 제거되었습니다. DB에 `playlists` 테이블이 남아 있을 수 있으나 앱에서는 사용하지 않습니다.
