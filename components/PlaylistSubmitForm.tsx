"use client";

import { FormEvent, useState } from "react";

export default function PlaylistSubmitForm() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userName.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    if (!sourceUrl.trim()) {
      alert("플레이리스트 링크를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_url: sourceUrl,
          user_name: userName,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          tags
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "등록에 실패했습니다.");
        return;
      }
      window.location.href = `/playlists/${data.id}`;
    } catch (err) {
      console.error(err);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-5 rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          플레이리스트 URL
        </label>
        <input
          type="url"
          required
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="Spotify 또는 YouTube (playlist?list=)"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
          Spotify·YouTube는 제목·설명·썸네일·작성자·곡 수를 서버에서 자동으로
          가져옵니다. YouTube는 Data API 키가 필요합니다.
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          닉네임
        </label>
        <input
          type="text"
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          제목 덮어쓰기 (선택)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="비우면 플랫폼 메타데이터 사용"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          설명 덮어쓰기 (선택)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="비우면 플랫폼 설명 사용"
          className="w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          태그
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="쉼표로 구분 · 예: 힙합, 운동, 밤"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "등록 중…" : "공유하기"}
      </button>
    </form>
  );
}
