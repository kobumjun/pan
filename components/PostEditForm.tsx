"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  postId: string;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
};

export default function PostEditForm({
  postId,
  initialTitle,
  initialContent,
  initialTags
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [postPin, setPostPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("본문을 입력해주세요.");
      return;
    }
    if (!/^\d{4,6}$/.test(postPin)) {
      alert("글 비밀번호 4~6자리를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
          post_pin: postPin
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "수정에 실패했습니다.");
        return;
      }
      router.push(`/posts/${postId}`);
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
      className="space-y-4 border border-zinc-200 bg-white p-4 sm:p-5"
    >
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full border border-zinc-200 px-2.5 py-2 text-sm outline-none focus:border-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          본문
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          maxLength={50000}
          className="w-full resize-y border border-zinc-200 px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          태그 (쉼표)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border border-zinc-200 px-2.5 py-2 text-sm outline-none focus:border-zinc-400"
        />
      </div>
      <div className="border border-zinc-200 bg-zinc-50 p-3">
        <label className="mb-1 block text-[11px] font-semibold text-zinc-700">
          글 비밀번호 (수정 확인)
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={postPin}
          onChange={(e) => setPostPin(e.target.value.replace(/\D/g, ""))}
          className="w-full border border-zinc-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-zinc-400"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full border border-zinc-900 bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
