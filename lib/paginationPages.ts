/** 디시형: 현재 주변 + 처음/끝 + 생략 표시 */
export type PageItem = number | "ellipsis";

export function getPaginationItems(current: number, total: number): PageItem[] {
  if (total <= 1) return [1];
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: PageItem[] = [];
  const windowHalf = 2;
  let start = Math.max(2, current - windowHalf);
  let end = Math.min(total - 1, current + windowHalf);

  if (current <= 3) {
    start = 2;
    end = Math.min(6, total - 1);
  }
  if (current >= total - 2) {
    end = total - 1;
    start = Math.max(2, total - 5);
  }

  items.push(1);
  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis");
  if (total > 1) items.push(total);

  return items;
}
