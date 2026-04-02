"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Header() {
  const pathname = usePathname();

  const link = (href: string, label: string, primary?: boolean) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={clsx(
          "rounded-xl px-3 py-2 text-sm font-medium no-underline transition",
          primary
            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm shadow-violet-500/20 hover:opacity-95"
            : active
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-zinc-900 no-underline"
          >
            PAN
          </Link>
          <p className="hidden text-xs text-zinc-500 sm:block sm:max-w-[220px] sm:leading-snug">
            Spotify · YouTube 플레이리스트를 공유하는 커뮤니티
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {link("/", "홈")}
          {link("/best", "추천")}
          {link("/playlists/new", "공유", true)}
        </nav>
      </div>
    </header>
  );
}
