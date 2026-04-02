import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlaylistRow } from "@/lib/types";

export const PLAYLISTS_PAGE_SIZE = 25;

export const PLAYLIST_LIST_SELECT =
  "id, user_name, title, description, source_type, source_url, source_id, cover_image_url, author_name, track_count, tags, likes_count, comments_count, created_at";

export function parseListPage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function playlistListPath(
  basePath: string,
  page: number,
  tag: string | null
): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

type ListOptions = {
  recommendedOnly: boolean;
  tag: string | null;
  page: number;
};

export async function fetchPlaylistsListPage(
  supabase: SupabaseClient,
  opts: ListOptions
): Promise<{
  rows: PlaylistRow[];
  total: number;
  totalPages: number;
  safePage: number;
}> {
  const { recommendedOnly, tag, page } = opts;
  const size = PLAYLISTS_PAGE_SIZE;

  let countQ = supabase.from("playlists").select("*", { count: "exact", head: true });
  if (recommendedOnly) countQ = countQ.gte("likes_count", 15);
  if (tag) countQ = countQ.contains("tags", [tag]);

  const { count: rawCount, error: countErr } = await countQ;
  if (countErr) {
    console.error("playlists count", countErr);
    return { rows: [], total: 0, totalPages: 1, safePage: 1 };
  }

  const total = rawCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * size;
  const to = from + size - 1;

  let dataQ = supabase
    .from("playlists")
    .select(PLAYLIST_LIST_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (recommendedOnly) dataQ = dataQ.gte("likes_count", 15);
  if (tag) dataQ = dataQ.contains("tags", [tag]);

  const { data, error } = await dataQ;
  if (error) {
    console.error("playlists list", error);
    return { rows: [], total, totalPages, safePage };
  }

  const rows = ((data ?? []) as unknown as PlaylistRow[]).map((row) => ({
    ...row,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0
  }));

  return { rows, total, totalPages, safePage };
}

/** 태그 칩용: 최근 글에서 태그 수집 (대량 DB에서도 부담 적게) */
export async function fetchTagOptions(
  supabase: SupabaseClient,
  recommendedOnly: boolean,
  sampleLimit = 1000
): Promise<string[]> {
  let q = supabase
    .from("playlists")
    .select("tags")
    .order("created_at", { ascending: false })
    .limit(sampleLimit);
  if (recommendedOnly) q = q.gte("likes_count", 15);

  const { data, error } = await q;
  if (error || !data) return [];
  const set = new Set<string>();
  for (const row of data) {
    const tags = row.tags as string[] | null;
    if (Array.isArray(tags)) tags.forEach((t) => set.add(t));
  }
  return Array.from(set).sort();
}

export async function fetchAnyPlaylistExists(supabase: SupabaseClient): Promise<boolean> {
  const { count, error } = await supabase
    .from("playlists")
    .select("*", { count: "exact", head: true });
  if (error) return false;
  return (count ?? 0) > 0;
}
