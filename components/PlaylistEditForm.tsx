"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  playlistId: string;
  initialTitle: string;
  initialDescription: string;
  initialTags: string[];
};

export default function PlaylistEditForm({
  playlistId,
  initialTitle,
  initialDescription,
  initialTags
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [postPin, setPostPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!/^\d{4,6}$/.test(postPin)) {
      alert("글 비밀번호 4~6자리를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags,
          post_pin: postPin
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "수정에 실패했습니다.");
        return;
      }
      router.push(`/playlists/${playlistId}`);
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
      className="mx-auto max-w-lg space-y-5 rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          maxLength={5000}
          className="w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          태그 (쉼표)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
        <label className="mb-1.5 block text-xs font-semibold text-amber-900">
          글 비밀번호 (수정 확인)
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={postPin}
          onChange={(e) => setPostPin(e.target.value.replace(/\D/g, ""))}
          placeholder="4~6자리 숫자"
          className="w-full rounded-lg border border-amber-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 disabled:opacity-50"
      >
        {loading ? "저장 중…" : "수정 저장"}
      </button>
    </form>
  );
}
