import PostForm from "@/components/PostForm";
import PostDeleteButton from "@/components/PostDeleteButton";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import { Post } from "@/lib/types";

async function fetchPost(id: string): Promise<Post | null> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("posts")
    .select("id, category, title, content, likes_count, comments_count, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as Post;
}

export default async function EditPostPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { mode?: string };
}) {
  const post = await fetchPost(params.id);
  if (!post) {
    return (
      <div className="board-container">
        <div className="board-header">
          <span>글 수정</span>
        </div>
        <div className="p-3 text-sm text-gray-500">존재하지 않는 글입니다.</div>
      </div>
    );
  }

  const isDelete = searchParams.mode === "delete";

  return (
    <div className="board-container">
      <div className="board-header flex justify-between">
        <span>{isDelete ? "글 삭제" : "글 수정"}</span>
      </div>
      <div className="p-3">
        {isDelete ? (
          <div className="space-y-3 text-sm">
            <p>이 글을 삭제하시겠습니까? 비밀번호 확인 후 삭제됩니다.</p>
            <PostDeleteButton postId={post.id} />
          </div>
        ) : (
          <PostForm
            mode="edit"
            postId={post.id}
            initialTitle={post.title}
            initialContent={post.content}
          />
        )}
      </div>
    </div>
  );
}

