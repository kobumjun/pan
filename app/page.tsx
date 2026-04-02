import Link from "next/link";
import PlaylistExplore from "@/components/PlaylistExplore";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import type { PlaylistRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SELECT_FIELDS =
  "id, user_name, title, description, source_type, source_url, source_id, cover_image_url, author_name, track_count, tags, likes_count, comments_count, created_at";

async function fetchPlaylists(): Promise<PlaylistRow[]> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("playlists")
    .select(SELECT_FIELDS)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to load playlists", error);
    return [];
  }
  if (!data) return [];
  return (data as unknown as PlaylistRow[]).map((row) => ({
    ...row,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0
  }));
}

export default async function HomePage() {
  const playlists = await fetchPlaylists();

  if (playlists.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        <section className="overflow-hidden rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 p-8 text-white shadow-lg sm:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
            PAN
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            플레이리스트를 한곳에
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
            Spotify · YouTube 플레이리스트를 공유하는 커뮤니티. 첫 공유로 피드를
            채워보세요.
          </p>
        </section>
        <div className="mt-12 rounded-3xl border border-zinc-200/80 bg-white px-8 py-16 text-center shadow-sm">
          <p className="text-lg font-medium text-zinc-800">
            아직 올라온 플레이리스트가 없습니다
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            좋아하는 플리 링크 하나만 있으면 충분해요. 메타데이터는 자동으로
            채워집니다.
          </p>
          <Link
            href="/playlists/new"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-zinc-800"
          >
            플레이리스트 공유하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PlaylistExplore
      playlists={playlists}
      pageTitle="Discover playlists"
      pageSubtitle="Spotify · YouTube 플레이리스트를 공유하는 커뮤니티"
    />
  );
}
