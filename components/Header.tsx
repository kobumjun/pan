"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isWrite = pathname === "/write";
  const showProminentWrite = isHome;
  const showSubtleWrite = !isHome && !isWrite;

  const tab = (href: string, label: string) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={clsx(
          "rounded-lg px-3 py-2 text-sm font-medium no-underline transition",
          active
            ? "bg-violet-100 text-violet-900"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-zinc-900 no-underline"
          >
            PAN
          </Link>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 sm:text-xs">
            Spotify · YouTube 플레이리스트를 공유하는 커뮤니티
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <nav className="flex items-center gap-1 rounded-xl bg-zinc-50/80 p-1 ring-1 ring-zinc-200/60">
            {tab("/", "홈")}
            {tab("/best", "추천")}
          </nav>

          <div className="flex items-center gap-2">
            {showProminentWrite ? (
              <Link
                href="/write"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-md shadow-violet-500/25 transition hover:opacity-95"
              >
                글쓰기
              </Link>
            ) : showSubtleWrite ? (
              <Link
                href="/write"
                className="text-xs font-medium text-violet-700 no-underline hover:underline sm:text-sm"
              >
                글쓰기
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
