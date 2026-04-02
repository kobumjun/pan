import Image from "next/image";
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
      className="group flex gap-3 py-3.5 no-underline transition hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-fuchsia-50/30 sm:gap-4 sm:px-3 sm:py-4"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200/80 sm:h-12 sm:w-12">
        {p.cover_image_url ? (
          <Image
            src={p.cover_image_url}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-semibold leading-snug text-zinc-900 group-hover:text-violet-800 sm:text-base">
          <span className="line-clamp-2">{p.title}</span>
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500 sm:text-xs">
          {tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-md bg-violet-100/80 px-1.5 py-0.5 font-medium text-violet-800"
            >
              #{t}
            </span>
          ))}
          {tags.length > 4 ? <span className="text-zinc-400">+{tags.length - 4}</span> : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500 sm:gap-x-3 sm:text-xs">
          <span className="font-medium text-zinc-600">{p.user_name}</span>
          <span className="text-zinc-300">|</span>
          <span>{typeof p.track_count === "number" ? `${p.track_count}곡` : "—"}</span>
          <span className="text-zinc-300">|</span>
          <span>댓글 {p.comments_count ?? 0}</span>
          <span className="text-zinc-300">|</span>
          <span>♥ {p.likes_count ?? 0}</span>
          <span className="text-zinc-300">|</span>
          <span
            className={
              p.source_type === "spotify"
                ? "text-emerald-700 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {platform}
          </span>
          <span className="text-zinc-300">|</span>
          <time dateTime={p.created_at} className="text-zinc-400">
            {formatDate(p.created_at)}
          </time>
        </div>
      </div>
    </Link>
  );
}
