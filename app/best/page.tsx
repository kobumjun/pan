import { BoardTabs } from "@/components/BoardTabs";
import PostList from "@/components/PostList";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import { Post } from "@/lib/types";

async function fetchBestPosts(): Promise<Post[]> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("posts")
    .select("id, category, title, content, likes_count, comments_count, created_at, updated_at")
    .gte("likes_count", 15)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as unknown as Post[];
}

export default async function BestPage() {
  const posts = await fetchBestPosts();

  return (
    <div className="board-container">
      <BoardTabs />
      <div className="board-header">
        <span>추천글 게시판 (15 추천 이상)</span>
      </div>
      <PostList posts={posts} emptyMessage="아직 추천글이 없습니다." />
    </div>
  );
}

