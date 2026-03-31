"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function BoardTabs() {
  const pathname = usePathname();
  const isBest = pathname.startsWith("/best");

  return (
    <div className="flex text-sm border-b border-boardBorder bg-boardHeader">
      <Link
        href="/"
        className={clsx(
          "px-3 py-2 border-r border-boardBorder",
          !isBest ? "bg-white font-semibold" : "text-gray-600"
        )}
      >
        인증 게시판
      </Link>
      <Link
        href="/best"
        className={clsx(
          "px-3 py-2",
          isBest ? "bg-white font-semibold" : "text-gray-600"
        )}
      >
        추천글 (15↑)
      </Link>
    </div>
  );
}

