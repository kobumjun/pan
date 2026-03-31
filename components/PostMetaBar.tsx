interface Props {
  commentsCount: number;
  likesCount: number;
  createdAt: string;
}

export function PostMetaBar({ commentsCount, likesCount, createdAt }: Props) {
  const date = new Date(createdAt);
  const display = date.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="board-meta">
      <span>댓글 {commentsCount}</span>
      <span>추천 {likesCount}</span>
      <span>{display}</span>
    </div>
  );
}

