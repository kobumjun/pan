import Link from "next/link";
import { Comment } from "@/lib/types";

interface Props {
  comments: Comment[];
}

export default function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <div className="text-xs text-gray-500 py-3 border-t border-gray-200">
        아직 댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-gray-200 divide-y divide-gray-200">
      {comments.map((c) => {
        const date = new Date(c.created_at).toLocaleString("ko-KR", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
        return (
          <div key={c.id} className="py-2 text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">익명</span>
              <span className="text-xs text-gray-400">{date}</span>
            </div>
            <div className="whitespace-pre-wrap text-gray-900">
              {c.content}
            </div>
            <div className="mt-1 text-xs">
              <Link
                href={`/comment/${c.id}/edit`}
                className="text-gray-500 hover:underline mr-2"
              >
                수정
              </Link>
              <Link
                href={`/comment/${c.id}/edit?mode=delete`}
                className="text-gray-500 hover:underline"
              >
                삭제
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

