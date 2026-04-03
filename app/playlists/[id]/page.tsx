import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import type { PlaylistCommentRow, PlaylistRow } from "@/lib/types";
import PlaylistLikeButton from "@/components/PlaylistLikeButton";
import PlaylistCommentForm from "@/components/PlaylistCommentForm";
import PlaylistCommentList from "@/components/PlaylistCommentList";
import PlaylistDetailActions from "@/components/PlaylistDetailActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SELECT_FIELDS =
  "id, user_name, title, description, source_type, source_url, source_id, cover_image_url, author_name, track_count, tags, likes_count, comments_count, created_at";

async function fetchOne(id: string): Promise<PlaylistRow | null> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("playlists")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const row = data as unknown as PlaylistRow;
  return {
    ...row,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0
  };
}

async function fetchComments(playlistId: string): Promise<PlaylistCommentRow[]> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("playlist_comments")
    .select("id, playlist_id, user_name, content, created_at")
    .eq("playlist_id", playlistId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as unknown as PlaylistCommentRow[];
}

export default async function PlaylistDetailPage({
  params
}: {
  params: { id: string };
}) {
  const p = await fetchOne(params.id);
  if (!p) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-zinc-500">
        플레이리스트를 찾을 수 없습니다.
      </div>
    );
  }

  const comments = await fetchComments(p.id);
  const tags = p.tags ?? [];
  const platform = p.source_type === "spotify" ? "Spotify" : "YouTube";

  return (
    <div className="mx-auto max-w-3xl px-3 pb-20 pt-5 sm:px-4 sm:pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 no-underline hover:text-zinc-800"
      >
        <span aria-hidden className="text-zinc-400">
          ←
        </span>
        목록으로
      </Link>

      <article className="mt-5 overflow-hidden rounded-xl border border-zinc-200/90 bg-pan-card shadow-sm sm:mt-6">
        <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-start sm:gap-8 sm:p-6">
          <div className="relative mx-auto aspect-square w-full max-w-[13rem] shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200/80 sm:mx-0 sm:max-w-[15rem]">
            {p.cover_image_url ? (
              <Image
                src={p.cover_image_url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 240px"
                unoptimized
              />
            ) : (
              <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-zinc-400">
                No cover
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-md border border-zinc-200/90 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              {platform}
            </span>
            <h1 className="mt-3 text-xl font-bold leading-snug tracking-tight text-zinc-900 sm:text-2xl">
              {p.title}
            </h1>
            {p.description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                {p.description}
              </p>
            ) : null}

            {tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-zinc-200/90 bg-zinc-50/80 px-2 py-0.5 text-[11px] font-medium text-zinc-500"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 sm:text-[13px]">
              <span className="font-medium text-zinc-600">{p.user_name}</span>
              {p.author_name ? (
                <>
                  <span className="text-zinc-300">·</span>
                  <span>{p.author_name}</span>
                </>
              ) : null}
              {typeof p.track_count === "number" ? (
                <>
                  <span className="text-zinc-300">·</span>
                  <span>{p.track_count}곡</span>
                </>
              ) : null}
              <span className="text-zinc-300">·</span>
              <span>댓글 {p.comments_count ?? 0}</span>
              <span className="text-zinc-300">·</span>
              <span>좋아요 {p.likes_count ?? 0}</span>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <PlaylistLikeButton playlistId={p.id} initialLikes={p.likes_count} />
                <a
                  href={p.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 no-underline transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  원본 열기
                </a>
              </div>
              <PlaylistDetailActions playlistId={p.id} />
            </div>
          </div>
        </div>

        {p.source_type === "spotify" && p.source_id ? (
          <div className="border-t border-zinc-100 bg-zinc-50/50 px-3 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
            <div className="overflow-hidden rounded-lg border border-zinc-200/90 bg-black/[0.03]">
              <iframe
                title={`Spotify ${p.title}`}
                src={`https://open.spotify.com/embed/playlist/${p.source_id}`}
                width="100%"
                height="380"
                allow="encrypted-media; autoplay; clipboard-write"
                className="border-0"
              />
            </div>
          </div>
        ) : p.source_type === "youtube" && p.source_id ? (
          <div className="border-t border-zinc-100 bg-zinc-50/50 px-3 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
            <div className="overflow-hidden rounded-lg border border-zinc-200/90 bg-black/[0.03]">
              <iframe
                title={`YouTube ${p.title}`}
                src={`https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(p.source_id)}`}
                width="100%"
                height="380"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                className="border-0"
              />
            </div>
          </div>
        ) : null}
      </article>

      <section className="mt-8 rounded-xl border border-zinc-200/90 bg-pan-card p-4 shadow-sm sm:mt-9 sm:p-6">
        <h2 className="text-base font-bold text-zinc-900 sm:text-lg">댓글</h2>
        <div className="mt-5 space-y-6">
          <PlaylistCommentForm playlistId={p.id} />
          <PlaylistCommentList comments={comments} />
        </div>
      </section>
    </div>
  );
}
