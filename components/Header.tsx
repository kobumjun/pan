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
          "rounded-md px-3 py-1.5 text-xs font-medium no-underline transition sm:px-3.5 sm:py-2 sm:text-[13px]",
          active
            ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80"
            : "text-zinc-500 hover:text-zinc-800"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-pan-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-3.5 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-4">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-[17px] font-bold tracking-tight text-zinc-900 no-underline hover:text-pan-accent sm:text-lg"
          >
            PAN
          </Link>
          <p className="mt-1 max-w-md text-[11px] leading-snug text-zinc-500 sm:text-xs">
            Spotify · YouTube 플레이리스트를 공유하는 커뮤니티
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:justify-end">
          <nav
            className="inline-flex rounded-lg border border-zinc-200/90 bg-zinc-100/90 p-0.5"
            aria-label="주요 메뉴"
          >
            {tab("/", "홈")}
            {tab("/best", "추천")}
          </nav>

          <div className="flex items-center gap-2">
            {showProminentWrite ? (
              <Link
                href="/write"
                className="inline-flex items-center justify-center rounded-lg bg-pan-accent px-3.5 py-2 text-xs font-semibold text-white no-underline transition hover:bg-pan-accent-hover sm:px-4 sm:text-sm"
              >
                글쓰기
              </Link>
            ) : showSubtleWrite ? (
              <Link
                href="/write"
                className="text-xs font-semibold text-pan-accent no-underline hover:text-pan-accent-hover sm:text-sm"
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
