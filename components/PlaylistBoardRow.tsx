import Link from "next/link";
import type { PlaylistRow } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function PlaylistBoardRow({ p }: { p: PlaylistRow }) {
  const tags = p.tags ?? [];
  const platform = p.source_type === "spotify" ? "Spotify" : "YouTube";

  return (
    <Link
      href={`/playlists/${p.id}`}
      className="group block rounded-xl border border-zinc-200/90 bg-pan-card px-4 py-4 no-underline shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-zinc-300 hover:bg-zinc-50/80 active:bg-zinc-50 sm:px-5 sm:py-5"
    >
      <h2 className="text-[15px] font-bold leading-snug tracking-tight text-zinc-900 group-hover:text-pan-accent sm:text-[17px]">
        <span className="line-clamp-2">{p.title}</span>
      </h2>

      {tags.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded border border-zinc-200/90 bg-zinc-50/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:text-[11px]"
            >
              #{t}
            </span>
          ))}
          {tags.length > 5 ? (
            <span className="self-center text-[10px] text-zinc-400 sm:text-[11px]">
              +{tags.length - 5}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-400 sm:text-xs">
          <span className="font-medium text-zinc-500">{p.user_name}</span>
          <span className="text-zinc-300" aria-hidden>
            ·
          </span>
          <span>{typeof p.track_count === "number" ? `${p.track_count}곡` : "—"}</span>
          <span className="text-zinc-300" aria-hidden>
            ·
          </span>
          <span className="text-zinc-500">{platform}</span>
          <span className="text-zinc-300" aria-hidden>
            ·
          </span>
          <time dateTime={p.created_at} className="tabular-nums text-zinc-400">
            {formatDate(p.created_at)}
          </time>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[11px] tabular-nums text-zinc-400 sm:text-xs">
          <span>
            좋아요 <span className="font-medium text-zinc-500">{p.likes_count ?? 0}</span>
          </span>
          <span>
            댓글 <span className="font-medium text-zinc-500">{p.comments_count ?? 0}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
