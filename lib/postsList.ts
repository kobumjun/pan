import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostListRow } from "@/lib/types";
import { RECOMMENDED_MIN_LIKES } from "@/lib/topics";

export const POSTS_PAGE_SIZE = 35;

export const POST_LIST_SELECT = `
  id,
  title,
  author_name,
  tags,
  likes_count,
  comments_count,
  created_at,
  updated_at,
  post_images ( image_url, sort_order )
`;

function mapListRow(raw: Record<string, unknown>): PostListRow {
  const imgs = raw.post_images as { image_url: string; sort_order: number | null }[] | null;
  const sorted = Array.isArray(imgs)
    ? [...imgs].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )
    : [];
  const first = sorted[0];
  return {
    id: raw.id as string,
    title: raw.title as string,
    author_name: (raw.author_name as string) || "익명",
    tags: (raw.tags as string[] | null) ?? [],
    likes_count: (raw.likes_count as number) ?? 0,
    comments_count: (raw.comments_count as number) ?? 0,
    created_at: raw.created_at as string,
    updated_at: (raw.updated_at as string | null) ?? null,
    thumb_url: first?.image_url ?? null,
    has_images: sorted.length > 0
  };
}

export function parseListPage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function postListPath(
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

export async function fetchPostsListPage(
  supabase: SupabaseClient,
  opts: ListOptions
): Promise<{
  rows: PostListRow[];
  total: number;
  totalPages: number;
  safePage: number;
}> {
  const { recommendedOnly, tag, page } = opts;
  const size = POSTS_PAGE_SIZE;

  let countQ = supabase.from("posts").select("*", { count: "exact", head: true });
  if (recommendedOnly) countQ = countQ.gte("likes_count", RECOMMENDED_MIN_LIKES);
  if (tag) countQ = countQ.contains("tags", [tag]);

  const { count: rawCount, error: countErr } = await countQ;
  if (countErr) {
    console.error("posts count", countErr);
    return { rows: [], total: 0, totalPages: 1, safePage: 1 };
  }

  const total = rawCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * size;
  const to = from + size - 1;

  let dataQ = supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (recommendedOnly) dataQ = dataQ.gte("likes_count", RECOMMENDED_MIN_LIKES);
  if (tag) dataQ = dataQ.contains("tags", [tag]);

  const { data, error } = await dataQ;
  if (error) {
    console.error("posts list", error);
    return { rows: [], total, totalPages, safePage };
  }

  const rows = ((data ?? []) as unknown as Record<string, unknown>[]).map(mapListRow);

  return { rows, total, totalPages, safePage };
}

export async function fetchTagOptions(
  supabase: SupabaseClient,
  recommendedOnly: boolean,
  sampleLimit = 800
): Promise<string[]> {
  let q = supabase
    .from("posts")
    .select("tags")
    .order("created_at", { ascending: false })
    .limit(sampleLimit);
  if (recommendedOnly) q = q.gte("likes_count", RECOMMENDED_MIN_LIKES);

  const { data, error } = await q;
  if (error || !data) return [];
  const set = new Set<string>();
  for (const row of data) {
    const tags = row.tags as string[] | null;
    if (Array.isArray(tags)) tags.forEach((t) => set.add(t));
  }
  return Array.from(set).sort();
}

export async function fetchAnyPostExists(supabase: SupabaseClient): Promise<boolean> {
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });
  if (error) return false;
  return (count ?? 0) > 0;
}
