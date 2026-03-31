import PostForm from "@/components/PostForm";

export default function WritePage() {
  return (
    <div className="board-container">
      <div className="board-header">
        <span>글쓰기</span>
      </div>
      <div className="p-3">
        <PostForm mode="create" />
      </div>
    </div>
  );
}

