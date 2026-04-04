"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PostCommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = content.trim();
    if (!t) {
      alert("댓글을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: t,
          user_name: userName.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "등록에 실패했습니다.");
        return;
      }
      setContent("");
      router.refresh();
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-2 border border-zinc-200 bg-zinc-50/50 p-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        댓글 쓰기
      </p>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="닉네임 (선택)"
        maxLength={40}
        className="w-full border border-zinc-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="내용"
        className="w-full resize-y border border-zinc-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "등록 중…" : "등록"}
      </button>
    </form>
  );
}
