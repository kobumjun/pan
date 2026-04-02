# PAN — 플레이리스트 공유 커뮤니티

Spotify · YouTube 플레이리스트를 공유·발견하는 Next.js + Supabase 앱입니다.

## 설치

```bash
npm install
```

## 환경 변수 (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` — Spotify 플레이리스트 메타데이터 (Client Credentials)
- `YOUTUBE_API_KEY` — YouTube Data API v3, `playlists.list` 용

## Supabase

SQL 에디터에서 `supabase/schema.sql`을 실행합니다. 기존 프로젝트는 파일 하단 `playlists` 확장(좋아요·댓글 테이블, RPC)만 추가 실행해도 됩니다.

## 페이지

- `/` — 플레이리스트 목록(게시판형 리스트), 태그 필터
- `/best` — 좋아요 15개 이상 추천(동일 리스트 UI)
- `/write` — 글쓰기(링크·닉네임·글 비밀번호 4~6자리)
- `/playlists/[id]` — 상세, 임베드, 좋아요·댓글, 수정/삭제(비밀번호)
- `/playlists/[id]/edit` — 제목·설명·태그 수정

## DB

`playlists.password_hash` 컬럼이 있어야 합니다. `supabase/schema.sql` 맨 아래 `alter table ... password_hash` 구문을 실행하세요.

## Spotify / YouTube

- Spotify: 공개 플레이리스트만 Client Credentials로 조회 가능한 경우가 많습니다.
- YouTube: `playlist?list=` 형식 링크를 사용하세요. Music 도메인도 동일하게 list 파라미터를 파싱합니다.
