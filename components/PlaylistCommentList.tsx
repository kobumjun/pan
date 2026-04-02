import type { PlaylistCommentRow } from "@/lib/types";

export default function PlaylistCommentList({
  comments
}: {
  comments: PlaylistCommentRow[];
}) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        아직 댓글이 없어요. 첫 댓글을 남겨보세요.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {comments.map((c) => (
        <li key={c.id} className="py-4 first:pt-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-zinc-800">
              {c.user_name?.trim() || "익명"}
            </span>
            <time className="text-xs text-zinc-400">
              {new Date(c.created_at).toLocaleString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
