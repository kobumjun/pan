"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface Props {
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  onSuccess?: (postId: string) => void;
}

export default function PostForm({
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
  onSuccess
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [password, setPassword] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const merged = [...images, ...files].slice(0, MAX_IMAGES);

    for (const file of merged) {
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert("이미지는 파일당 최대 5MB 까지만 허용됩니다.");
        return;
      }
    }

    setImages(merged);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (!/^\d{4,8}$/.test(password)) {
      alert("숫자 비밀번호 4~8자리를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const imageUrls: string[] = [];

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { data, error } = await supabase.storage
            .from("post-images")
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false
            });
          if (error) {
            console.error(error);
            throw new Error("이미지 업로드에 실패했습니다.");
          }
          const publicUrl = supabase.storage.from("post-images").getPublicUrl(data.path).data.publicUrl;
          imageUrls.push(publicUrl);
        }
      }

      const body = {
        title,
        content,
        password,
        images: imageUrls.map((url, idx) => ({ url, sort_order: idx }))
      };

      const url = mode === "create" ? "/api/posts" : `/api/posts/${postId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "요청에 실패했습니다.");
        return;
      }

      if (onSuccess) {
        onSuccess(data.id);
      } else {
        window.location.href = `/post/${data.id}`;
      }
    } catch (err: any) {
      alert(err?.message ?? "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <div>
        <label className="block text-xs text-gray-700 mb-1">제목</label>
        <input
          type="text"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-700 mb-1">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          maxLength={4000}
          className="resize-y"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-700 mb-1">
          숫자 비밀번호 (4~8자리, 수정/삭제용)
        </label>
        <input
          type="password"
          value={password}
          maxLength={8}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-700 mb-1">
          이미지 업로드 (최대 4장, 파일당 5MB)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        {images.length > 0 && (
          <div className="mt-1 text-xs text-gray-600">
            선택된 파일 {images.length}개
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button type="submit" disabled={loading} className="btn-primary">
          {mode === "create" ? "작성 완료" : "수정 완료"}
        </button>
      </div>
    </form>
  );
}

