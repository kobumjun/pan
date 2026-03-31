import { Post } from "@/lib/types";
import PostListItem from "./PostListItem";

interface Props {
  posts: Post[];
  emptyMessage?: string;
}

export default function PostList({ posts, emptyMessage = "등록된 글이 없습니다." }: Props) {
  if (posts.length === 0) {
    return (
      <div className="board-row text-center text-sm text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </>
  );
}

