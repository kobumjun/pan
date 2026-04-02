"use client";

import { useMemo, useState } from "react";
import type { PlaylistRow } from "@/lib/types";
import PlaylistCard from "./PlaylistCard";

type Props = {
  playlists: PlaylistRow[];
  pageTitle?: string;
  pageSubtitle?: string;
  /** 추천 페이지 등에서 히어로를 줄일 때 */
  compactHero?: boolean;
};

export default function PlaylistExplore({
  playlists,
  pageTitle = "Discover",
  pageSubtitle = "Spotify · YouTube 플레이리스트를 공유하는 커뮤니티",
  compactHero = false
}: Props) {
  const allTags = useMemo(() => {
    const s = new Set<string>();
    playlists.forEach((p) => (p.tags ?? []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [playlists]);

  const [tag, setTag] = useState<string | null>(null);

  const filtered =
    tag === null
      ? playlists
      : playlists.filter((p) => (p.tags ?? []).includes(tag));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-2">
      {!compactHero ? (
        <section className="mb-10 overflow-hidden rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 p-8 text-white shadow-lg shadow-violet-500/20 sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
            PAN
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            {pageSubtitle}
          </p>
        </section>
      ) : (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{pageSubtitle}</p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTag(null)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            tag === null
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          전체
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              tag === t
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            #{t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 px-6 py-20 text-center">
          <p className="text-base font-medium text-zinc-800">
            이 필터에 맞는 플레이리스트가 아직 없어요.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            태그를 바꾸거나, 직접 공유해 분위기를 만들어보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PlaylistCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
