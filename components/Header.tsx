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
          "px-2.5 py-1 text-xs font-medium no-underline sm:text-[13px]",
          active
            ? "bg-zinc-900 text-white"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-3 sm:py-2.5">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-zinc-900 no-underline sm:text-[17px]"
          >
            PAN
          </Link>
          <p className="mt-0.5 max-w-xl text-[10px] leading-snug text-zinc-500 sm:text-[11px]">
            실행·자기계발 정보 공유 · 기록과 팁을 빠르게
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <nav
            className="inline-flex border border-zinc-200"
            aria-label="주요 메뉴"
          >
            {tab("/", "홈")}
            {tab("/best", "추천")}
          </nav>

          <div className="flex items-center gap-2">
            {showProminentWrite ? (
              <Link
                href="/write"
                className="inline-flex items-center border border-zinc-900 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white no-underline hover:bg-zinc-800 sm:px-3 sm:text-sm"
              >
                글쓰기
              </Link>
            ) : showSubtleWrite ? (
              <Link
                href="/write"
                className="text-xs font-semibold text-zinc-700 no-underline hover:text-zinc-900 sm:text-sm"
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
