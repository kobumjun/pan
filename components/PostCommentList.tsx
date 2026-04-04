import type { PostCommentRow } from "@/lib/types";

export default function PostCommentList({
  comments
}: {
  comments: PostCommentRow[];
}) {
  if (comments.length === 0) {
    return (
      <p className="border border-dashed border-zinc-200 py-6 text-center text-xs text-zinc-400">
        댓글이 없습니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 border border-zinc-200">
      {comments.map((c) => (
        <li key={c.id} className="px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-800">
              {c.user_name?.trim() || "익명"}
            </span>
            <time className="shrink-0 text-[10px] tabular-nums text-zinc-400">
              {new Date(c.created_at).toLocaleString("ko-KR", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-zinc-600">
            {c.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
