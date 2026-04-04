import Image from "next/image";
import Link from "next/link";
import type { PostListRow as PostListRowType } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function PostListRow({ p }: { p: PostListRowType }) {
  const tags = p.tags ?? [];

  return (
    <Link
      href={`/posts/${p.id}`}
      className="group flex items-start gap-2 border-b border-zinc-200/80 py-2 pl-1 pr-1 no-underline transition hover:bg-zinc-100/80 sm:gap-2.5 sm:py-1.5"
    >
      <div className="relative mt-0.5 h-7 w-7 shrink-0 overflow-hidden bg-zinc-100 ring-1 ring-zinc-200/80 sm:h-8 sm:w-8">
        {p.thumb_url ? (
          <Image
            src={p.thumb_url}
            alt=""
            fill
            className="object-cover"
            sizes="32px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-zinc-400">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[13px] font-semibold leading-tight text-zinc-900 group-hover:underline sm:text-sm">
            {p.title}
          </span>
        </div>
        {tags.length > 0 ? (
          <div className="mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] text-zinc-400 sm:text-[11px]">
            {tags.slice(0, 6).map((t) => (
              <span key={t}>#{t}</span>
            ))}
            {tags.length > 6 ? <span>+{tags.length - 6}</span> : null}
          </div>
        ) : null}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-zinc-400 sm:hidden">
          <span>{p.author_name}</span>
          <span className="tabular-nums">{formatDate(p.created_at)}</span>
        </div>
      </div>
      <div className="hidden shrink-0 text-right text-[11px] text-zinc-400 sm:block sm:w-[4.5rem]">
        <div className="truncate text-zinc-500">{p.author_name}</div>
      </div>
      <div className="hidden shrink-0 text-right text-[11px] tabular-nums text-zinc-400 sm:block sm:w-24">
        {formatDate(p.created_at)}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-[10px] tabular-nums text-zinc-400 sm:flex-row sm:items-center sm:gap-2 sm:text-[11px] sm:w-[4.5rem]">
        <span title="좋아요">♥{p.likes_count}</span>
        <span title="댓글">💬{p.comments_count}</span>
        {p.has_images ? (
          <span className="text-zinc-300" title="이미지 첨부">
            IMG
          </span>
        ) : (
          <span className="hidden sm:inline sm:w-6" />
        )}
      </div>
    </Link>
  );
}
