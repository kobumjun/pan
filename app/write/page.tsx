import PostSubmitForm from "@/components/PostSubmitForm";

export const dynamic = "force-dynamic";

export default function WritePage() {
  return (
    <div className="mx-auto max-w-3xl px-2 pb-16 pt-3 sm:px-3 sm:pt-4">
      <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">글쓰기</h1>
      <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
        제목·본문·작성자·태그·글 비밀번호(4~6자리 숫자)와 선택 이미지를 등록합니다.
      </p>
      <div className="mt-4">
        <PostSubmitForm />
      </div>
    </div>
  );
}
