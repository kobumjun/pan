import { BoardTabs } from "@/components/BoardTabs";
import PostList from "@/components/PostList";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";
import { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchPosts(): Promise<Post[]> {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, category, title, content, likes_count, comments_count, created_at, updated_at"
    )
    .eq("category", "cert")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to load posts", error);
    return [];
  }
  if (!data) return [];
  return data as unknown as Post[];
}

export default async function HomePage() {
  const posts = await fetchPosts();

  return (
    <div className="board-container">
      <BoardTabs />
      <div className="board-header">
        <span>PAN 인증 게시판</span>
      </div>
      <PostList posts={posts} />
    </div>
  );
}

