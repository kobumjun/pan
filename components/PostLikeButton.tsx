"use client";

import { useEffect, useState } from "react";
import { RECOMMENDED_MIN_LIKES } from "@/lib/topics";

const STORAGE_KEY = "post_like_client_v1";
const LIKED_PREFIX = "post_liked_";

function getClientKey(): string {
  if (typeof window === "undefined") return "";
  let k = window.localStorage.getItem(STORAGE_KEY);
  if (!k || k.length < 16) {
    k =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, k);
  }
  return k;
}

function isStoredLiked(postId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LIKED_PREFIX + postId) === "1";
}

function setStoredLiked(postId: string, liked: boolean) {
  if (typeof window === "undefined") return;
  if (liked) window.localStorage.setItem(LIKED_PREFIX + postId, "1");
  else window.localStorage.removeItem(LIKED_PREFIX + postId);
}

export default function PostLikeButton({
  postId,
  initialLikes
}: {
  postId: string;
  initialLikes: number;
}) {
  const [count, setCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(isStoredLiked(postId));
  }, [postId]);

  useEffect(() => {
    setCount(initialLikes);
  }, [initialLikes]);

  async function toggle() {
    if (loading) return;
    const key = getClientKey();
    if (!key) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "x-post-client-key": key }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "좋아요 처리에 실패했습니다.");
        return;
      }
      setLiked(!!data.liked);
      setCount(typeof data.likes_count === "number" ? data.likes_count : count);
      setStoredLiked(postId, !!data.liked);
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex h-8 items-center gap-1.5 border px-3 text-xs font-medium ${
        liked
          ? "border-zinc-700 bg-zinc-100 text-zinc-900"
          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      <span>좋아요 {count}</span>
      {count >= RECOMMENDED_MIN_LIKES ? (
        <span className="border border-zinc-200 bg-zinc-50 px-1 text-[10px] text-zinc-500">
          추천
        </span>
      ) : null}
    </button>
  );
}
