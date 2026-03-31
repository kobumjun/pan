import LikeButton from "@/components/LikeButton";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import { ImageGrid } from "@/components/ImageGrid";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import { Comment, Post, PostImage } from "@/lib/types";
import Link from "next/link";

async function fetchPost(id: string) {
  const supabase = getSupabaseServerAnon();
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, category, title, content, likes_count, comments_count, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !post) return null;

  const { data: images } = await supabase
    .from("post_images")
    .select("id, post_id, image_url, sort_order")
    .eq("post_id", id)
    .order("sort_order", { ascending: true });

  const { data: comments } = await supabase
    .from("comments")
    .select("id, post_id, content, created_at, updated_at")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return {
    post: post as Post,
    images: (images ?? []) as PostImage[],
    comments: (comments ?? []) as Comment[]
  };
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const data = await fetchPost(params.id);
  if (!data) {
    return (
      <div className="board-container">
        <div className="board-header">
          <span>글 상세</span>
        </div>
        <div className="p-3 text-sm text-gray-500">존재하지 않는 글입니다.</div>
      </div>
    );
  }

  const { post, images, comments } = data;

  return (
    <div className="board-container">
      <div className="board-header flex justify-between">
        <span>{post.title}</span>
        <div className="text-xs text-gray-600 space-x-2">
          <Link href={`/post/${post.id}/edit`} className="hover:underline">
            수정
          </Link>
          <Link href={`/post/${post.id}/edit?mode=delete`} className="hover:underline">
            삭제
          </Link>
        </div>
      </div>
      <div className="p-3 text-sm">
        <div className="text-xs text-gray-500 mb-2">익명</div>
        <div className="whitespace-pre-wrap text-gray-900">
          {post.content}
        </div>
        <ImageGrid images={images} />
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-2">
          <div className="text-xs text-gray-500">
            댓글 {post.comments_count} · 추천 {post.likes_count}
          </div>
          <LikeButton postId={post.id} initialLikes={post.likes_count} />
        </div>
        <CommentForm postId={post.id} />
        <CommentList comments={comments} />
      </div>
    </div>
  );
}

