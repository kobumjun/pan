import { redirect } from "next/navigation";
import PlaylistExplore from "@/components/PlaylistExplore";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import {
  fetchPlaylistsListPage,
  fetchTagOptions,
  parseListPage,
  playlistListPath
} from "@/lib/playlistsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BestPage({
  searchParams
}: {
  searchParams: { page?: string; tag?: string };
}) {
  const supabase = getSupabaseServerAnon();
  const page = parseListPage(searchParams.page);
  const tag =
    typeof searchParams.tag === "string" && searchParams.tag.trim()
      ? searchParams.tag.trim()
      : null;

  const { rows, total, totalPages, safePage } = await fetchPlaylistsListPage(
    supabase,
    { recommendedOnly: true, tag, page }
  );

  if (page !== safePage) {
    redirect(playlistListPath("/best", safePage, tag));
  }

  if (total === 0 && !tag) {
    return (
      <div className="mx-auto max-w-4xl px-3 pb-24 pt-6 sm:px-4 sm:pt-8">
        <div className="mb-6 border-b border-zinc-200/90 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">추천</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            좋아요 15개 이상 받은 플레이리스트만 모여 있어요.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-zinc-200/90 bg-pan-card px-6 py-14 text-center shadow-sm sm:py-16">
          <p className="font-semibold text-zinc-800">아직 추천 플레이리스트가 없어요</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            마음에 드는 플리에 좋아요를 눌러주면, 여기에 올라올 수 있어요.
          </p>
        </div>
      </div>
    );
  }

  const allTags = await fetchTagOptions(supabase, true);

  return (
    <PlaylistExplore
      playlists={rows}
      allTags={allTags}
      totalCount={total}
      currentPage={safePage}
      totalPages={totalPages}
      currentTag={tag}
      basePath="/best"
      pageTitle="추천"
      pageSubtitle="좋아요 15개 이상 받은 플레이리스트만 골랐어요."
      compactHero
    />
  );
}
