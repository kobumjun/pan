import type { PlaylistCommentRow } from "@/lib/types";

export default function PlaylistCommentList({
  comments
}: {
  comments: PlaylistCommentRow[];
}) {
  if (comments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200/90 bg-zinc-50/30 py-10 text-center text-sm text-zinc-500">
        아직 댓글이 없어요. 첫 댓글을 남겨보세요.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-100 bg-white">
      {comments.map((c) => (
        <li key={c.id} className="px-4 py-4 first:rounded-t-lg last:rounded-b-lg sm:px-5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-zinc-800">
              {c.user_name?.trim() || "익명"}
            </span>
            <time className="shrink-0 text-xs tabular-nums text-zinc-400">
              {new Date(c.created_at).toLocaleString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
            {c.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
