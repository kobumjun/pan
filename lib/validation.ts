export function requireString(value: unknown, min = 1, max = 5000): string {
  if (typeof value !== "string") throw new Error("잘못된 요청입니다.");
  const trimmed = value.trim();
  if (trimmed.length < min) throw new Error("내용을 입력해주세요.");
  if (trimmed.length > max) throw new Error("내용이 너무 깁니다.");
  return trimmed;
}

export function requireTitle(value: unknown): string {
  return requireString(value, 1, 100);
}

export function requireContent(value: unknown): string {
  return requireString(value, 1, 4000);
}

