import PlaylistExplore from "@/components/PlaylistExplore";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import type { PlaylistRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SELECT_FIELDS =
  "id, user_name, title, description, source_type, source_url, source_id, cover_image_url, author_name, track_count, tags, likes_count, comments_count, created_at";

async function fetchRecommended(): Promise<PlaylistRow[]> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("playlists")
    .select(SELECT_FIELDS)
    .gte("likes_count", 15)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to load recommended playlists", error);
    return [];
  }
  if (!data) return [];
  return (data as unknown as PlaylistRow[]).map((row) => ({
    ...row,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0
  }));
}

export default async function BestPage() {
  const playlists = await fetchRecommended();

  if (playlists.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">추천</h1>
          <p className="mt-1 text-sm text-zinc-500">
            좋아요 15개 이상 받은 플레이리스트만 모여 있어요.
          </p>
        </div>
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white px-8 py-16 text-center">
          <p className="font-medium text-zinc-800">아직 추천 플레이리스트가 없어요</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            마음에 드는 플리에 좋아요를 눌러주면, 여기에 올라올 수 있어요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PlaylistExplore
      playlists={playlists}
      pageTitle="추천"
      pageSubtitle="좋아요 15개 이상 받은 플레이리스트만 골랐어요."
      compactHero
    />
  );
}
