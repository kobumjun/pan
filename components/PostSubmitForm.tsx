"use client";

import { FormEvent, useRef, useState } from "react";
import { MAX_POST_IMAGES } from "@/lib/postFormUtils";

export default function PostSubmitForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [tags, setTags] = useState("");
  const [postPin, setPostPin] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.set("title", title.trim());
      form.set("content", content.trim());
      form.set("author_name", authorName.trim());
      form.set("tags", tags);
      form.set("post_pin", postPin.trim());
      const files = fileRef.current?.files;
      if (files) {
        for (let i = 0; i < Math.min(files.length, MAX_POST_IMAGES); i++) {
          form.append("images", files[i]);
        }
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "등록에 실패했습니다.");
        return;
      }
      window.location.href = `/posts/${data.id}`;
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
          required
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
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full resize-y border border-zinc-200 px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          이미지 (최대 {MAX_POST_IMAGES}장, 각 4MB 이하)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="w-full text-xs text-zinc-600 file:mr-2 file:border file:border-zinc-200 file:bg-zinc-50 file:px-2 file:py-1 file:text-xs"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          작성자
        </label>
        <input
          type="text"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={40}
          className="w-full border border-zinc-200 px-2.5 py-2 text-sm outline-none focus:border-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          태그 (쉼표로 구분 · 예: 돈, 루틴, AI)
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
          글 비밀번호 (숫자 4~6자리, 수정·삭제)
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          required
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
        {loading ? "등록 중…" : "등록"}
      </button>
    </form>
  );
}
