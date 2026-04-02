import PlaylistSubmitForm from "@/components/PlaylistSubmitForm";

export const dynamic = "force-dynamic";

export default function WritePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">글쓰기</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
        플레이리스트 링크와 닉네임, 글 비밀번호만 있으면 등록할 수 있어요. Spotify·YouTube
        메타데이터는 자동으로 채워집니다.
      </p>
      <div className="mt-8">
        <PlaylistSubmitForm />
      </div>
    </div>
  );
}
