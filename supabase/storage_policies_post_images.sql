-- 글쓰기: 브라우저(anon)가 Storage에 직접 업로드하려면 아래 정책이 필요합니다.
-- 버킷 이름을 실제 값으로 바꾸세요 (기본: post-images, .env 의 NEXT_PUBLIC_SUPABASE_POST_IMAGES_BUCKET 와 동일).

-- 대시보드에서 버킷 생성 후 Public 로 설정하거나, SELECT 정책으로 읽기 허용

-- 익명 읽기 (공개 버킷과 동일 효과)
create policy "Public read post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- 익명 업로드: incoming/ 접두사만 (앱이 사용하는 경로와 일치)
create policy "Anon insert incoming only"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = 'incoming'
  );

-- 업로드 롤백·글 등록 실패 시 클라이언트가 같은 경로 객체를 삭제할 수 있게 함
create policy "Anon delete incoming only"
  on storage.objects for delete
  to anon
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = 'incoming'
  );

-- 선택: 인증 사용자/서비스 롤은 다른 경로도 쓸 수 있게 별도 정책 추가 가능
-- 기존 정책과 충돌하면 대시보드에서 이름·조건을 조정하세요.
