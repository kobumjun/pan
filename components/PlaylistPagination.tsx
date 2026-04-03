import Link from "next/link";
import { getPaginationItems } from "@/lib/paginationPages";

function buildHref(
  basePath: string,
  page: number,
  tag: string | null
): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

type Props = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  tag: string | null;
};

export default function PlaylistPagination({
  basePath,
  currentPage,
  totalPages,
  tag
}: Props) {
  if (totalPages <= 1) return null;

  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;
  const items = getPaginationItems(currentPage, totalPages);

  const linkClass = (active: boolean) =>
    `inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-sm font-medium no-underline transition sm:min-h-10 sm:min-w-10 ${
      active
        ? "border-zinc-900 bg-zinc-900 text-white"
        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
    }`;

  const navClass =
    "inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 no-underline hover:border-zinc-300 hover:bg-zinc-50 sm:min-h-10";

  return (
    <nav
      className="mt-2 flex flex-wrap items-center justify-center gap-1.5 border-t border-zinc-100 bg-zinc-50/40 px-3 py-5 sm:gap-2 sm:px-4"
      aria-label="페이지"
    >
      {prev ? (
        <Link href={buildHref(basePath, prev, tag)} className={navClass}>
          이전
        </Link>
      ) : (
        <span className={`${navClass} pointer-events-none opacity-40`}>이전</span>
      )}

      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="px-1 text-sm text-zinc-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildHref(basePath, item, tag)}
              className={linkClass(item === currentPage)}
            >
              {item}
            </Link>
          )
        )}
      </div>

      {next ? (
        <Link href={buildHref(basePath, next, tag)} className={navClass}>
          다음
        </Link>
      ) : (
        <span className={`${navClass} pointer-events-none opacity-40`}>다음</span>
      )}
    </nav>
  );
}
