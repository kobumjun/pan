"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "playlist_like_client_v1";
const LIKED_PREFIX = "playlist_liked_";

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

function isStoredLiked(playlistId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LIKED_PREFIX + playlistId) === "1";
}

function setStoredLiked(playlistId: string, liked: boolean) {
  if (typeof window === "undefined") return;
  if (liked) window.localStorage.setItem(LIKED_PREFIX + playlistId, "1");
  else window.localStorage.removeItem(LIKED_PREFIX + playlistId);
}

export default function PlaylistLikeButton({
  playlistId,
  initialLikes
}: {
  playlistId: string;
  initialLikes: number;
}) {
  const [count, setCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(isStoredLiked(playlistId));
  }, [playlistId]);

  useEffect(() => {
    setCount(initialLikes);
  }, [initialLikes]);

  async function toggle() {
    if (loading) return;
    const key = getClientKey();
    if (!key) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}/like`, {
        method: "POST",
        headers: { "x-playlist-client-key": key }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "좋아요 처리에 실패했습니다.");
        return;
      }
      setLiked(!!data.liked);
      setCount(typeof data.likes_count === "number" ? data.likes_count : count);
      setStoredLiked(playlistId, !!data.liked);
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
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        liked
          ? "border-rose-300 bg-rose-50 text-rose-700"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
      }`}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      <span>좋아요 {count}</span>
      {count >= 15 ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
          추천
        </span>
      ) : null}
    </button>
  );
}
