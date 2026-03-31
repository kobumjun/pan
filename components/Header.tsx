"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-boardBorder bg-white">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-3 py-2">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          PAN
        </Link>
        <nav className="flex gap-2 text-sm">
          <Link
            href="/"
            className={clsx(
              "px-2 py-1 border",
              isActive("/")
                ? "bg-gray-800 text-white border-gray-900"
                : "bg-gray-100 text-gray-800 border-gray-300"
            )}
          >
            인증
          </Link>
          <Link
            href="/best"
            className={clsx(
              "px-2 py-1 border",
              isActive("/best")
                ? "bg-gray-800 text-white border-gray-900"
                : "bg-gray-100 text-gray-800 border-gray-300"
            )}
          >
            추천글
          </Link>
          <Link
            href="/write"
            className={clsx(
              "px-2 py-1 border bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
            )}
          >
            글쓰기
          </Link>
        </nav>
      </div>
    </header>
  );
}

