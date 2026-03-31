import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import { Comment } from "@/lib/types";

async function fetchComment(id: string): Promise<Comment | null> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, content, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as Comment;
}

export default async function EditCommentPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { mode?: string };
}) {
  const comment = await fetchComment(params.id);
  if (!comment) {
    return (
      <div className="board-container">
        <div className="board-header">
          <span>댓글 수정</span>
        </div>
        <div className="p-3 text-sm text-gray-500">존재하지 않는 댓글입니다.</div>
      </div>
    );
  }

  const isDelete = searchParams.mode === "delete";

  async function handleSubmit(formData: FormData) {
    "use server";
  }

  return (
    <div className="board-container">
      <div className="board-header">
        <span>{isDelete ? "댓글 삭제" : "댓글 수정"}</span>
      </div>
      <div className="p-3 text-sm">
        {isDelete ? (
          <CommentDeleteForm commentId={comment.id} postId={comment.post_id} />
        ) : (
          <CommentEditForm comment={comment} />
        )}
      </div>
    </div>
  );
}

function CommentEditForm({ comment }: { comment: Comment }) {
  async function onSubmit(formData: FormData) {
    "use server";
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-gray-700 mb-1">댓글 내용</label>
        <textarea
          name="content"
          defaultValue={comment.content}
          rows={4}
          className="w-full border border-gray-300 px-2 py-1 text-sm resize-y"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-700 mb-1">
          숫자 비밀번호 (4~8자리)
        </label>
        <input
          type="password"
          name="password"
          maxLength={8}
          className="w-full border border-gray-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-2">
        <button type="submit" className="btn-primary">
          수정 완료
        </button>
      </div>
    </form>
  );
}

function CommentDeleteForm({ commentId, postId }: { commentId: string; postId: string }) {
  async function onSubmit(formData: FormData) {
    "use server";
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <p>이 댓글을 삭제하시겠습니까? 비밀번호 확인 후 삭제됩니다.</p>
      <div>
        <label className="block text-xs text-gray-700 mb-1">
          숫자 비밀번호 (4~8자리)
        </label>
        <input
          type="password"
          name="password"
          maxLength={8}
          className="w-full border border-gray-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-2">
        <button type="submit" className="btn-danger">
          삭제 완료
        </button>
      </div>
    </form>
  );
}

