# 익명 자랑 인증 커뮤니티 MVP

Next.js 14 App Router + TypeScript + Tailwind + Supabase 기반의 익명 자랑 커뮤니티입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env.local` 파일을 만들고 아래 값을 채웁니다.

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (서버 전용, 클라이언트에 노출 금지)

## Supabase 설정

1. Supabase 프로젝트에서 SQL 에디터를 열고 `supabase/schema.sql` 내용을 실행합니다.
2. Storage에서 `post-images` 버킷을 생성하고 public 읽기 권한을 켭니다.

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## 기본 페이지

- `/` : 인증 게시판 목록
- `/best` : 추천글 (likes_count ≥ 15)
- `/write` : 글 작성
- `/post/[id]` : 글 상세
- `/post/[id]/edit` : 글 수정/삭제
- `/comment/[id]/edit` : 댓글 수정/삭제

