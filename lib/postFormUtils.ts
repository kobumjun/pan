export function normalizeTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  if (typeof input === "string") {
    return input
      .split(/[,#]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

export const MAX_POST_IMAGES = 12;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function isAllowedImageFile(f: File): boolean {
  return ALLOWED_IMAGE_TYPES.has(f.type) && f.size > 0 && f.size <= MAX_IMAGE_BYTES;
}

export function postImagesBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_POST_IMAGES_BUCKET?.trim() || "post-images";
}
