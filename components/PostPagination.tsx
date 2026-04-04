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

export default function PostPagination({
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
    `inline-flex min-h-7 min-w-7 items-center justify-center border px-1.5 text-xs font-medium no-underline ${
      active
        ? "border-zinc-800 bg-zinc-800 text-white"
        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
    }`;

  const navClass =
    "inline-flex min-h-7 items-center border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-600 no-underline hover:bg-zinc-50";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 border-t border-zinc-200 bg-zinc-50/50 px-2 py-2.5"
      aria-label="페이지"
    >
      {prev ? (
        <Link href={buildHref(basePath, prev, tag)} className={navClass}>
          이전
        </Link>
      ) : (
        <span className={`${navClass} pointer-events-none opacity-40`}>이전</span>
      )}
      <div className="flex flex-wrap items-center justify-center gap-0.5">
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <span key={`e-${i}`} className="px-0.5 text-xs text-zinc-400" aria-hidden>
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
