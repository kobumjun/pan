import Image from "next/image";
import Link from "next/link";
import type { PlaylistRow } from "@/lib/types";

function platformLabel(t: PlaylistRow["source_type"]) {
  return t === "spotify" ? "Spotify" : "YouTube";
}

export default function PlaylistCard({ p }: { p: PlaylistRow }) {
  const href = `/playlists/${p.id}`;
  const tags = p.tags?.length ? p.tags : [];
  const likes = p.likes_count ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/90 shadow-sm ring-1 ring-black/[0.02] transition hover:-translate-y-0.5 hover:border-violet-200/80 hover:shadow-md hover:shadow-violet-500/5">
      <Link href={href} className="relative aspect-[16/10] w-full bg-gradient-to-br from-zinc-100 to-zinc-200">
        {p.cover_image_url ? (
          <Image
            src={p.cover_image_url}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No cover
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {platformLabel(p.source_type)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 backdrop-blur-sm">
          ♥ {likes}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={href} className="no-underline">
          <h2 className="text-base font-semibold leading-snug text-zinc-900 line-clamp-2">
            {p.title}
          </h2>
        </Link>
        {p.description ? (
          <p className="text-sm text-zinc-600 line-clamp-2">{p.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700"
            >
              #{t}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">{p.user_name}</span>
          {p.author_name ? <span>· {p.author_name}</span> : null}
          {typeof p.track_count === "number" ? <span>· {p.track_count}곡</span> : null}
        </div>
      </div>
    </article>
  );
}
