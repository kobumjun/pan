import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import type { PostCommentRow, PostImageRow, PostRow } from "@/lib/types";
import PostLikeButton from "@/components/PostLikeButton";
import PostCommentForm from "@/components/PostCommentForm";
import PostCommentList from "@/components/PostCommentList";
import PostDetailActions from "@/components/PostDetailActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const POST_SELECT = `
  id,
  title,
  content,
  author_name,
  tags,
  likes_count,
  comments_count,
  created_at,
  updated_at,
  post_images ( id, image_url, sort_order )
`;

async function fetchPost(id: string): Promise<{
  post: PostRow;
  images: PostImageRow[];
} | null> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).single();

  if (error || !data) return null;
  const raw = data as unknown as Record<string, unknown>;
  const imgs = raw.post_images as PostImageRow[] | null;
  const sorted = Array.isArray(imgs)
    ? [...imgs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];
  const post: PostRow = {
    id: raw.id as string,
    title: raw.title as string,
    content: raw.content as string,
    author_name: (raw.author_name as string) || "익명",
    tags: (raw.tags as string[] | null) ?? [],
    likes_count: (raw.likes_count as number) ?? 0,
    comments_count: (raw.comments_count as number) ?? 0,
    created_at: raw.created_at as string,
    updated_at: (raw.updated_at as string | null) ?? null
  };
  return { post, images: sorted };
}

async function fetchComments(postId: string): Promise<PostCommentRow[]> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, user_name, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as unknown as PostCommentRow[];
}

export default async function PostDetailPage({
  params
}: {
  params: { id: string };
}) {
  const result = await fetchPost(params.id);
  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-16 text-center text-sm text-zinc-500">
        글을 찾을 수 없습니다.
      </div>
    );
  }

  const { post: p, images } = result;
  const comments = await fetchComments(p.id);
  const tags = p.tags ?? [];

  return (
    <div className="mx-auto max-w-3xl px-2 pb-16 pt-2 sm:px-3 sm:pt-3">
      <Link
        href="/"
        className="text-xs font-medium text-zinc-500 no-underline hover:text-zinc-800"
      >
        ← 목록
      </Link>

      <article className="mt-3 border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-3 py-3 sm:px-4 sm:py-4">
          <h1 className="text-lg font-bold leading-snug tracking-tight text-zinc-900 sm:text-xl">
            {p.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-600">{p.author_name}</span>
            <span>·</span>
            <time dateTime={p.created_at}>
              {new Date(p.created_at).toLocaleString("ko-KR")}
            </time>
            <span>·</span>
            <span>좋아요 {p.likes_count}</span>
            <span>·</span>
            <span>댓글 {p.comments_count}</span>
          </div>
          {tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-zinc-500">
              {tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PostLikeButton postId={p.id} initialLikes={p.likes_count} />
            <PostDetailActions postId={p.id} />
          </div>
        </div>

        {images.length > 0 ? (
          <div className="border-b border-zinc-200 bg-zinc-50 p-2">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {images.map((im) => (
                <a
                  key={im.id}
                  href={im.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-video overflow-hidden bg-zinc-200 ring-1 ring-zinc-200/80"
                >
                  <Image
                    src={im.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 50vw, 200px"
                    unoptimized
                  />
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="px-3 py-4 sm:px-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{p.content}</p>
        </div>
      </article>

      <section className="mt-4 border border-zinc-200 bg-white p-3 sm:p-4">
        <h2 className="text-sm font-bold text-zinc-900">댓글</h2>
        <div className="mt-3 space-y-3">
          <PostCommentForm postId={p.id} />
          <PostCommentList comments={comments} />
        </div>
      </section>
    </div>
  );
}
