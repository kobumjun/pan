import Link from "next/link";
import type { PlaylistRow } from "@/lib/types";
import PlaylistBoardRow from "./PlaylistBoardRow";
import PlaylistPagination from "./PlaylistPagination";
import { PLAYLISTS_PAGE_SIZE } from "@/lib/playlistsList";

function tagHref(basePath: string, t: string | null) {
  const params = new URLSearchParams();
  if (t) params.set("tag", t);
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

type Props = {
  playlists: PlaylistRow[];
  allTags: string[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentTag: string | null;
  basePath: string;
  pageTitle?: string;
  pageSubtitle?: string;
  compactHero?: boolean;
};

export default function PlaylistExplore({
  playlists,
  allTags,
  totalCount,
  currentPage,
  totalPages,
  currentTag,
  basePath,
  pageTitle = "Discover",
  pageSubtitle = "Spotify · YouTube 플레이리스트를 공유하는 커뮤니티",
  compactHero = false
}: Props) {
  const fromItem = totalCount === 0 ? 0 : (currentPage - 1) * PLAYLISTS_PAGE_SIZE + 1;
  const toItem =
    totalCount === 0 ? 0 : Math.min(currentPage * PLAYLISTS_PAGE_SIZE, totalCount);

  return (
    <div className="mx-auto max-w-4xl px-3 pb-20 pt-1 sm:px-4">
      {!compactHero ? (
        <section className="mb-4 overflow-hidden rounded-2xl border border-violet-200/40 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 px-5 py-6 text-white shadow-md shadow-violet-500/15 sm:px-7 sm:py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85">
            PAN
          </p>
          <h1 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/90 sm:text-sm">
            {pageSubtitle}
          </p>
        </section>
      ) : (
        <div className="mb-5 border-b border-zinc-200/80 pb-4">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            {pageTitle}
          </h1>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{pageSubtitle}</p>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2 sm:mb-4">
        <Link
          href={tagHref(basePath, null)}
          className={`rounded-full px-3 py-1 text-[11px] font-medium no-underline transition sm:text-xs ${
            currentTag === null
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          전체
        </Link>
        {allTags.map((t) => (
          <Link
            key={t}
            href={tagHref(basePath, t)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium no-underline transition sm:text-xs ${
              currentTag === t
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            #{t}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-violet-50/40 px-3 py-2 sm:px-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              전체 글
            </span>
            <span className="ml-2 text-[11px] text-zinc-500">
              총 <strong className="text-zinc-800">{totalCount}</strong>개
            </span>
          </div>
          {totalCount > 0 ? (
            <span className="text-[11px] text-zinc-400">
              {fromItem}–{toItem} 표시
            </span>
          ) : null}
        </div>
        {playlists.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-medium text-zinc-700">글이 없습니다.</p>
            <p className="mt-1 text-xs text-zinc-500">
              태그를 바꾸거나 새 글을 올려보세요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-200/80 px-1 sm:px-0">
            {playlists.map((p) => (
              <PlaylistBoardRow key={p.id} p={p} />
            ))}
          </div>
        )}

        <PlaylistPagination
          basePath={basePath}
          currentPage={currentPage}
          totalPages={totalPages}
          tag={currentTag}
        />
      </div>
    </div>
  );
}
