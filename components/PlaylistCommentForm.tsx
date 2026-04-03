"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PlaylistCommentForm({ playlistId }: { playlistId: string }) {
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
      const res = await fetch(`/api/playlists/${playlistId}/comments`, {
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
      className="space-y-3 rounded-lg border border-zinc-200/90 bg-zinc-50/40 p-4 sm:p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        새 댓글
      </p>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="닉네임 (선택)"
        maxLength={40}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="이 플레이리스트에 대한 생각을 남겨보세요."
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "등록 중…" : "댓글 남기기"}
      </button>
    </form>
  );
}
