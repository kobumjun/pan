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

const pill =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium no-underline transition sm:px-2.5 sm:py-1 sm:text-[11px]";

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
    <div className="mx-auto max-w-4xl px-3 pb-24 pt-2 sm:px-4 sm:pt-3">
      {!compactHero ? (
        <section className="mb-6 rounded-xl border border-zinc-200/90 bg-pan-card px-5 py-6 shadow-sm sm:px-6 sm:py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            PAN
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            {pageSubtitle}
          </p>
        </section>
      ) : (
        <div className="mb-6 border-b border-zinc-200/90 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            {pageTitle}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{pageSubtitle}</p>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-1.5 sm:gap-2">
        <Link
          href={tagHref(basePath, null)}
          className={`${pill} ${
            currentTag === null
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200/90 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          전체
        </Link>
        {allTags.map((t) => (
          <Link
            key={t}
            href={tagHref(basePath, t)}
            className={`${pill} ${
              currentTag === t
                ? "border-pan-accent/40 bg-pan-accent-soft text-pan-accent"
                : "border-zinc-200/90 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            #{t}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-pan-card shadow-sm">
        <div className="flex flex-col gap-1 border-b border-zinc-100 bg-zinc-50/90 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="text-[13px] text-zinc-600">
            <span className="font-semibold text-zinc-800">게시글</span>
            <span className="mx-2 text-zinc-300">·</span>
            <span>
              총{" "}
              <strong className="font-semibold text-zinc-900">{totalCount}</strong>개
            </span>
          </div>
          {totalCount > 0 ? (
            <span className="text-xs tabular-nums text-zinc-400">
              {fromItem}–{toItem} 표시
            </span>
          ) : null}
        </div>

        {playlists.length === 0 ? (
          <div className="px-5 py-16 text-center sm:py-20">
            <p className="text-sm font-semibold text-zinc-800">글이 없습니다</p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
              태그를 바꾸거나 새 글을 올려보세요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3 sm:gap-3.5 sm:p-4">
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
