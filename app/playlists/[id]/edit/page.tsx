import Link from "next/link";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import type { PlaylistRow } from "@/lib/types";
import PlaylistEditForm from "@/components/PlaylistEditForm";

export const dynamic = "force-dynamic";

const SELECT_FIELDS =
  "id, user_name, title, description, source_type, source_url, source_id, cover_image_url, author_name, track_count, tags, likes_count, comments_count, created_at";

async function fetchOne(id: string): Promise<PlaylistRow | null> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("playlists")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const row = data as unknown as PlaylistRow;
  return {
    ...row,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0
  };
}

export default async function PlaylistEditPage({
  params
}: {
  params: { id: string };
}) {
  const p = await fetchOne(params.id);
  if (!p) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-zinc-500">
        글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8">
      <Link
        href={`/playlists/${p.id}`}
        className="text-sm text-violet-700 no-underline hover:underline"
      >
        ← 상세로
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">글 수정</h1>
      <p className="mt-1 text-sm text-zinc-500">
        제목·설명·태그만 바꿀 수 있어요. 링크는 그대로 유지됩니다.
      </p>
      <div className="mt-8">
        <PlaylistEditForm
          playlistId={p.id}
          initialTitle={p.title}
          initialDescription={p.description ?? ""}
          initialTags={p.tags ?? []}
        />
      </div>
    </div>
  );
}
