import Link from "next/link";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import PostEditForm from "@/components/PostEditForm";

export const dynamic = "force-dynamic";

const SELECT = "id, title, content, tags";

type EditRow = {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
};

async function fetchOne(id: string): Promise<EditRow | null> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase.from("posts").select(SELECT).eq("id", id).single();

  if (error || !data) return null;
  return data as unknown as EditRow;
}

export default async function PostEditPage({
  params
}: {
  params: { id: string };
}) {
  const p = await fetchOne(params.id);
  if (!p) {
    return (
      <div className="mx-auto max-w-lg px-3 py-16 text-center text-sm text-zinc-500">
        글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-2 pb-16 pt-2 sm:px-3 sm:pt-3">
      <Link
        href={`/posts/${p.id}`}
        className="text-xs font-medium text-zinc-500 no-underline hover:text-zinc-800"
      >
        ← 상세
      </Link>
      <h1 className="mt-3 text-lg font-bold text-zinc-900 sm:text-xl">수정</h1>
      <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
        제목·본문·태그만 수정합니다. 이미지는 등록 시점 기준으로 유지됩니다.
      </p>
      <div className="mt-4">
        <PostEditForm
          postId={p.id}
          initialTitle={p.title}
          initialContent={p.content}
          initialTags={p.tags ?? []}
        />
      </div>
    </div>
  );
}
