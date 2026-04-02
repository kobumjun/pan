import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import type { PlaylistCommentRow, PlaylistRow } from "@/lib/types";
import PlaylistLikeButton from "@/components/PlaylistLikeButton";
import PlaylistCommentForm from "@/components/PlaylistCommentForm";
import PlaylistCommentList from "@/components/PlaylistCommentList";

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
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 no-underline hover:text-violet-700"
      >
        ← 목록으로
      </Link>

      <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="relative mx-auto h-56 w-full max-w-[14rem] shrink-0 overflow-hidden rounded-2xl bg-zinc-100 shadow-lg ring-1 ring-black/5 sm:mx-0">
          {p.cover_image_url ? (
            <Image
              src={p.cover_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="224px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No cover
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-800">
            {platform}
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {p.title}
          </h1>
          {p.description ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
              {p.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700"
              >
                #{t}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-500">
            <span>
              공유 <span className="font-medium text-zinc-800">{p.user_name}</span>
            </span>
            {p.author_name ? <span>· {p.author_name}</span> : null}
            {typeof p.track_count === "number" ? <span>· {p.track_count}곡</span> : null}
            <span>· 댓글 {p.comments_count ?? 0}</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PlaylistLikeButton playlistId={p.id} initialLikes={p.likes_count} />
            <a
              href={p.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 no-underline hover:border-zinc-300"
            >
              원본에서 열기
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12">
        {p.source_type === "spotify" && p.source_id ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-black/[0.02] shadow-inner">
            <iframe
              title={`Spotify ${p.title}`}
              src={`https://open.spotify.com/embed/playlist/${p.source_id}`}
              width="100%"
              height="380"
              allow="encrypted-media; autoplay; clipboard-write"
              className="border-0"
            />
          </div>
        ) : p.source_type === "youtube" && p.source_id ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-black/[0.02] shadow-inner">
            <iframe
              title={`YouTube ${p.title}`}
              src={`https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(p.source_id)}`}
              width="100%"
              height="380"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              className="border-0"
            />
          </div>
        ) : null}
      </div>

      <section className="mt-14 border-t border-zinc-100 pt-10">
        <h2 className="text-lg font-semibold text-zinc-900">댓글</h2>
        <div className="mt-6 space-y-8">
          <PlaylistCommentForm playlistId={p.id} />
          <PlaylistCommentList comments={comments} />
        </div>
      </section>
    </div>
  );
}
