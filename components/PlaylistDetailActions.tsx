"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PinModal from "./PinModal";

export default function PlaylistDetailActions({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete(pin: string) {
    const res = await fetch(`/api/playlists/${playlistId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_pin: pin })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? "삭제에 실패했습니다.");
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/playlists/${playlistId}/edit`}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 no-underline hover:border-violet-300 hover:text-violet-800 sm:text-sm"
        >
          수정
        </Link>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 sm:text-sm"
        >
          삭제
        </button>
      </div>
      <PinModal
        open={deleteOpen}
        title="삭제하려면 글 비밀번호를 입력하세요"
        confirmLabel="삭제"
        onClose={() => setDeleteOpen(false)}
        onSubmit={handleDelete}
      />
    </>
  );
}
