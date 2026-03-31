"use client";

import { FormEvent, useState } from "react";

interface Props {
  postId: string;
  onSubmitted?: () => void;
}

export default function CommentForm({ postId, onSubmitted }: Props) {
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    if (!/^\d{4,8}$/.test(password)) {
      alert("숫자 비밀번호 4~8자리를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content, password })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "댓글 작성에 실패했습니다.");
        return;
      }
      setContent("");
      setPassword("");
      if (onSubmitted) onSubmitted();
      else window.location.reload();
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-sm mt-4">
      <div>
        <label className="block text-xs text-gray-700 mb-1">댓글</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={1000}
          className="resize-y"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-700 mb-1">
            숫자 비밀번호 (4~8자리)
          </label>
          <input
            type="password"
            value={password}
            maxLength={8}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-secondary mt-5">
          등록
        </button>
      </div>
    </form>
  );
}

