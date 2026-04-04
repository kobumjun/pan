import Link from "next/link";
import type { PostListRow as PostListRowData } from "@/lib/types";
import { POSTS_PAGE_SIZE } from "@/lib/postsList";
import { TOPIC_FILTER_SLUGS } from "@/lib/topics";
import PostListRow from "./PostListRow";
import PostPagination from "./PostPagination";

function tagHref(basePath: string, t: string | null) {
  const params = new URLSearchParams();
  if (t) params.set("tag", t);
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

function mergeFilterTags(dbTags: string[]): string[] {
  const topicSet = new Set<string>(TOPIC_FILTER_SLUGS);
  const extra = dbTags.filter((t) => !topicSet.has(t));
  return [...TOPIC_FILTER_SLUGS, ...extra];
}

type Props = {
  posts: PostListRowData[];
  allTags: string[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentTag: string | null;
  basePath: string;
  pageTitle: string;
  pageSubtitle: string;
  compactIntro?: boolean;
};

export default function PostExplore({
  posts,
  allTags,
  totalCount,
  currentPage,
  totalPages,
  currentTag,
  basePath,
  pageTitle,
  pageSubtitle,
  compactIntro = false
}: Props) {
  const fromItem = totalCount === 0 ? 0 : (currentPage - 1) * POSTS_PAGE_SIZE + 1;
  const toItem =
    totalCount === 0 ? 0 : Math.min(currentPage * POSTS_PAGE_SIZE, totalCount);

  const filterTags = mergeFilterTags(allTags);

  return (
    <div className="mx-auto max-w-5xl px-2 pb-16 pt-2 sm:px-3 sm:pt-3">
      {compactIntro ? (
        <header className="mb-3 border-b border-zinc-200 pb-2.5">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
            {pageTitle}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{pageSubtitle}</p>
        </header>
      ) : (
        <header className="mb-3 border-b border-zinc-200 pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            PAN
          </p>
          <h1 className="mt-1 text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
            {pageTitle}
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-snug text-zinc-500 sm:text-sm">
            {pageSubtitle}
          </p>
        </header>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-zinc-100 pb-2">
        <Link
          href={tagHref(basePath, null)}
          className={`px-2 py-0.5 text-[11px] font-medium no-underline sm:text-xs ${
            currentTag === null
              ? "bg-zinc-900 text-white"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          전체
        </Link>
        {filterTags.map((t) => (
          <Link
            key={t}
            href={tagHref(basePath, t)}
            className={`px-2 py-0.5 text-[11px] font-medium no-underline sm:text-xs ${
              currentTag === t
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] text-zinc-500 sm:px-2.5">
          <span>
            글 <strong className="font-semibold text-zinc-800">{totalCount}</strong>건
            {totalCount > 0 ? (
              <span className="ml-2 tabular-nums text-zinc-400">
                {fromItem}–{toItem}
              </span>
            ) : null}
          </span>
          <span className="hidden text-zinc-400 sm:inline">작성자 · 시각 · 반응</span>
        </div>

        {posts.length === 0 ? (
          <div className="px-3 py-12 text-center text-sm text-zinc-500">
            글이 없습니다.
          </div>
        ) : (
          <div>{posts.map((p) => <PostListRow key={p.id} p={p} />)}</div>
        )}

        <PostPagination
          basePath={basePath}
          currentPage={currentPage}
          totalPages={totalPages}
          tag={currentTag}
        />
      </div>
    </div>
  );
}
