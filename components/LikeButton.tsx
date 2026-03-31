"use client";

import { useEffect, useState } from "react";

interface Props {
  postId: string;
  initialLikes: number;
}

const STORAGE_KEY = "liked_posts_v1";

export default function LikeButton({ postId, initialLikes }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const ids: string[] = JSON.parse(raw);
      if (ids.includes(postId)) setLiked(true);
    } catch {
      // ignore
    }
  }, [postId]);

  async function handleLike() {
    if (liked || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "추천에 실패했습니다.");
      } else {
        setCount((c) => c + 1);
        setLiked(true);
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          let ids: string[] = [];
          try {
            if (raw) ids = JSON.parse(raw);
          } catch {
            ids = [];
          }
          if (!ids.includes(postId)) {
            ids.push(postId);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
          }
        }
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked || loading}
      className={`btn-secondary inline-flex items-center gap-1 ${
        liked ? "bg-blue-50 border-blue-400 text-blue-700" : ""
      }`}
    >
      <span>추천</span>
      <span className="font-semibold">{count}</span>
      {liked && <span className="text-xs text-blue-700">(완료)</span>}
    </button>
  );
}

