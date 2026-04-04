import Link from "next/link";
import { redirect } from "next/navigation";
import PostExplore from "@/components/PostExplore";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import {
  fetchAnyPostExists,
  fetchPostsListPage,
  fetchTagOptions,
  parseListPage,
  postListPath
} from "@/lib/postsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({
  searchParams
}: {
  searchParams: { page?: string; tag?: string };
}) {
  const supabase = getSupabaseServerAnon();
  const hasAny = await fetchAnyPostExists(supabase);

  if (!hasAny) {
    return (
      <div className="mx-auto max-w-5xl px-2 pb-16 pt-4 sm:px-3">
        <header className="border-b border-zinc-200 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            PAN
          </p>
          <h1 className="mt-1 text-lg font-bold text-zinc-900 sm:text-xl">
            실행하는 사람들의 정보 저장소
          </h1>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            자기계발 · 사업 · 돈 · 운동 · AI · 루틴 · 팁과 기록을 빠르게 남기고
            참고하세요.
          </p>
        </header>
        <div className="mt-8 border border-dashed border-zinc-300 bg-white px-4 py-14 text-center">
          <p className="text-sm font-semibold text-zinc-800">아직 글이 없습니다</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            첫 글을 올려 커뮤니티를 시작해 보세요.
          </p>
          <Link
            href="/write"
            className="mt-6 inline-block border border-zinc-900 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-zinc-800"
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

  const { rows, total, totalPages, safePage } = await fetchPostsListPage(supabase, {
    recommendedOnly: false,
    tag,
    page
  });

  if (page !== safePage) {
    redirect(postListPath("/", safePage, tag));
  }

  const allTags = await fetchTagOptions(supabase, false);

  return (
    <PostExplore
      posts={rows}
      allTags={allTags}
      totalCount={total}
      currentPage={safePage}
      totalPages={totalPages}
      currentTag={tag}
      basePath="/"
      pageTitle="최신 글"
      pageSubtitle="자기계발·실행 기록·생산성·사업·돈·운동·AI·책·루틴·마인드셋·작업환경 — 정보와 팁을 빠르게 올리고 스크랩하세요."
    />
  );
}
