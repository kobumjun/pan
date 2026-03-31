import Link from "next/link";
import { Post } from "@/lib/types";
import { PostMetaBar } from "./PostMetaBar";

interface Props {
  post: Post;
}

export default function PostListItem({ post }: Props) {
  const preview = post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content;

  return (
    <div className="board-row flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/post/${post.id}`} className="board-title line-clamp-1">
          {post.title}
        </Link>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="badge">댓글 {post.comments_count}</span>
          <span className="badge">추천 {post.likes_count}</span>
        </div>
      </div>
      <div className="text-xs text-gray-700 line-clamp-2">{preview}</div>
      <PostMetaBar
        commentsCount={post.comments_count}
        likesCount={post.likes_count}
        createdAt={post.created_at}
      />
    </div>
  );
}

