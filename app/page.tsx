import Link from "next/link";
import { redirect } from "next/navigation";
import PlaylistExplore from "@/components/PlaylistExplore";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import {
  fetchAnyPlaylistExists,
  fetchPlaylistsListPage,
  fetchTagOptions,
  parseListPage,
  playlistListPath
} from "@/lib/playlistsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({
  searchParams
}: {
  searchParams: { page?: string; tag?: string };
}) {
  const supabase = getSupabaseServerAnon();
  const hasAny = await fetchAnyPlaylistExists(supabase);

  if (!hasAny) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        <section className="overflow-hidden rounded-2xl border border-violet-200/40 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 px-6 py-7 text-white shadow-md sm:px-8 sm:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">
            PAN
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            플레이리스트를 한곳에
          </h1>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/90 sm:text-sm">
            Spotify · YouTube 플레이리스트를 공유하는 커뮤니티. 첫 글로 피드를
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
            href="/write"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white no-underline shadow-md shadow-violet-500/25 transition hover:opacity-95"
          >
            글쓰기
          </Link>
        </div>
      </div>
    );
  }

  const page = parseListPage(searchParams.page);
  const tag =
    typeof searchParams.tag === "string" && searchParams.tag.trim()
      ? searchParams.tag.trim()
      : null;

  const { rows, total, totalPages, safePage } = await fetchPlaylistsListPage(
    supabase,
    { recommendedOnly: false, tag, page }
  );

  if (page !== safePage) {
    redirect(playlistListPath("/", safePage, tag));
  }

  const allTags = await fetchTagOptions(supabase, false);

  return (
    <PlaylistExplore
      playlists={rows}
      allTags={allTags}
      totalCount={total}
      currentPage={safePage}
      totalPages={totalPages}
      currentTag={tag}
      basePath="/"
      pageTitle="Discover playlists"
      pageSubtitle="Spotify · YouTube 플레이리스트를 공유하는 커뮤니티"
    />
  );
}
