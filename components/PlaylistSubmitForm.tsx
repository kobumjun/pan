"use client";

import { FormEvent, useState } from "react";

export default function PlaylistSubmitForm() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [postPin, setPostPin] = useState("");
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
    if (!/^\d{4,6}$/.test(postPin)) {
      alert("글 비밀번호는 숫자 4~6자리로 설정해주세요.");
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
          tags,
          post_pin: postPin
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
      className="mx-auto max-w-lg space-y-5 rounded-xl border border-zinc-200/90 bg-pan-card p-6 shadow-sm sm:p-8"
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
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
        />
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
          Spotify·YouTube는 제목·설명·썸네일 등을 서버에서 자동으로 가져옵니다.
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
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
        />
      </div>
      <div className="rounded-lg border border-zinc-200/90 bg-zinc-50/50 p-4">
        <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
          글 비밀번호 (숫자 4~6자리)
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={postPin}
          onChange={(e) => setPostPin(e.target.value.replace(/\D/g, ""))}
          placeholder="수정·삭제 시 필요합니다"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
        />
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
          회원가입 없이 이 숫자만으로 글을 수정하거나 삭제할 수 있어요.
        </p>
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
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
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
          className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
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
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-pan-accent py-3.5 text-sm font-semibold text-white transition hover:bg-pan-accent-hover disabled:opacity-50"
      >
        {loading ? "등록 중…" : "등록하기"}
      </button>
    </form>
  );
}
