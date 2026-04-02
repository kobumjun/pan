import PlaylistSubmitForm from "@/components/PlaylistSubmitForm";

export const dynamic = "force-dynamic";

export default function NewPlaylistPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        플레이리스트 공유
      </h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
        링크만 넣으면 Spotify·YouTube 메타데이터를 자동으로 불러옵니다. 태그로
        분위기를 더해보세요.
      </p>
      <div className="mt-10">
        <PlaylistSubmitForm />
      </div>
    </div>
  );
}
