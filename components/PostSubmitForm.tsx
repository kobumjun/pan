"use client";

import { FormEvent, useRef, useState } from "react";
import { createPostWithJson } from "@/lib/createPostApi";
import {
  isAllowedImageFile,
  MAX_IMAGE_BYTES,
  MAX_POST_IMAGES
} from "@/lib/postFormUtils";
import {
  PostImageUploadError,
  removePostImagesByPublicUrls,
  uploadPostImagesFromFiles
} from "@/lib/uploadPostImagesClient";

type Phase = "idle" | "uploading" | "posting";

function collectFiles(input: HTMLInputElement | null): File[] {
  if (!input?.files?.length) return [];
  const out: File[] = [];
  for (let i = 0; i < input.files.length; i++) {
    const f = input.files[i];
    if (f && f.size > 0) out.push(f);
  }
  return out.slice(0, MAX_POST_IMAGES);
}

function validateFilesBeforeUpload(files: File[]): { ok: true } | { ok: false; message: string } {
  if (files.length > MAX_POST_IMAGES) {
    return { ok: false, message: `이미지는 최대 ${MAX_POST_IMAGES}장까지 첨부할 수 있습니다.` };
  }
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const label = f.name?.trim() || `선택한 파일 ${i + 1}`;
    if (!isAllowedImageFile(f)) {
      return {
        ok: false,
        message: `「${label}」은(는) 사용할 수 없습니다. JPEG/PNG/WebP/GIF, ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB 이하만 가능합니다.`
      };
    }
  }
  return { ok: true };
}

export default function PostSubmitForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [tags, setTags] = useState("");
  const [postPin, setPostPin] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [statusLine, setStatusLine] = useState("");
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const busy = phase !== "idle";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorLine(null);
    setStatusLine("");

    const files = collectFiles(fileRef.current);
    const pre = validateFilesBeforeUpload(files);
    if (!pre.ok) {
      setErrorLine(pre.message);
      return;
    }

    let image_urls: string[] = [];

    try {
      setPhase("uploading");
      if (files.length > 0) {
        setStatusLine(`이미지 업로드 준비… (${files.length}장)`);
        image_urls = await uploadPostImagesFromFiles(files, (n, total, label) => {
          setStatusLine(`이미지 업로드 중 ${n}/${total} — ${label}`);
        });
        setStatusLine(`이미지 ${image_urls.length}장 업로드 완료`);
      }

      setPhase("posting");
      setStatusLine("글 등록 중…");

      const { id } = await createPostWithJson({
        title: title.trim(),
        content: content.trim(),
        author_name: authorName.trim(),
        tags,
        post_pin: postPin.trim(),
        image_urls
      });

      setStatusLine("등록 완료");
      window.location.href = `/posts/${id}`;
    } catch (err) {
      if (image_urls.length > 0) {
        await removePostImagesByPublicUrls(image_urls);
      }

      if (err instanceof PostImageUploadError) {
        const who = err.fileLabel ? `「${err.fileLabel}」 ` : "";
        setErrorLine(`${who}${err.message}`.trim());
      } else if (err instanceof Error) {
        setErrorLine(err.message);
      } else {
        setErrorLine("처리 중 오류가 발생했습니다.");
      }
      setPhase("idle");
      setStatusLine("");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 border border-zinc-200 bg-white p-4 sm:p-5"
    >
      {errorLine ? (
        <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {errorLine}
        </div>
      ) : null}
      {busy && statusLine ? (
        <div className="border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
          {statusLine}
        </div>
      ) : null}

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
          disabled={busy}
          className="w-full border border-zinc-200 px-2.5 py-2 text-sm outline-none focus:border-zinc-400 disabled:bg-zinc-50"
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
          disabled={busy}
          className="w-full resize-y border border-zinc-200 px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-zinc-400 disabled:bg-zinc-50"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          이미지 (최대 {MAX_POST_IMAGES}장, 각 {Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB 이하) — 브라우저가
          Supabase Storage에 직접 올린 뒤, URL만 서버로 전송합니다.
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={busy}
          className="w-full text-xs text-zinc-600 file:mr-2 file:border file:border-zinc-200 file:bg-zinc-50 file:px-2 file:py-1 file:text-xs disabled:opacity-50"
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
          disabled={busy}
          className="w-full border border-zinc-200 px-2.5 py-2 text-sm outline-none focus:border-zinc-400 disabled:bg-zinc-50"
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
          disabled={busy}
          className="w-full border border-zinc-200 px-2.5 py-2 text-sm outline-none focus:border-zinc-400 disabled:bg-zinc-50"
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
          disabled={busy}
          className="w-full border border-zinc-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-zinc-400 disabled:bg-zinc-50"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full border border-zinc-900 bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {phase === "uploading"
          ? "이미지 업로드 중…"
          : phase === "posting"
            ? "글 등록 중…"
            : "등록"}
      </button>
    </form>
  );
}
