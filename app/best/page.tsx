import { redirect } from "next/navigation";
import PostExplore from "@/components/PostExplore";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import {
  fetchPostsListPage,
  fetchTagOptions,
  parseListPage,
  postListPath
} from "@/lib/postsList";
import { RECOMMENDED_MIN_LIKES } from "@/lib/topics";

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

  const { rows, total, totalPages, safePage } = await fetchPostsListPage(supabase, {
    recommendedOnly: true,
    tag,
    page
  });

  if (page !== safePage) {
    redirect(postListPath("/best", safePage, tag));
  }

  if (total === 0 && !tag) {
    return (
      <div className="mx-auto max-w-5xl px-2 pb-16 pt-4 sm:px-3">
        <header className="mb-4 border-b border-zinc-200 pb-3">
          <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">추천</h1>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
            좋아요 {RECOMMENDED_MIN_LIKES}개 이상 받은 글만 모아 보여줍니다.
          </p>
        </header>
        <div className="border border-dashed border-zinc-300 bg-white px-4 py-14 text-center">
          <p className="text-sm font-semibold text-zinc-800">아직 추천 글이 없습니다</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            마음에 드는 글에 좋아요를 눌러 추천 탭에 올려 보세요.
          </p>
        </div>
      </div>
    );
  }

  const allTags = await fetchTagOptions(supabase, true);

  return (
    <PostExplore
      posts={rows}
      allTags={allTags}
      totalCount={total}
      currentPage={safePage}
      totalPages={totalPages}
      currentTag={tag}
      basePath="/best"
      pageTitle="추천"
      pageSubtitle={`반응이 좋은 글(좋아요 ${RECOMMENDED_MIN_LIKES}+)만 모았습니다.`}
      compactIntro
    />
  );
}
