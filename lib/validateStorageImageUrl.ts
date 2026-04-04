import { postImagesBucket } from "@/lib/postFormUtils";

/**
 * 우리 프로젝트 Storage 공개 객체 URL만 허용 (임의 URL 삽입 방지)
 */
export function isTrustedStoragePublicUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const bucket = postImagesBucket();
  if (!supabaseUrl) return false;
  try {
    const u = new URL(url);
    const base = new URL(supabaseUrl);
    if (u.origin !== base.origin) return false;
    const prefix = `/storage/v1/object/public/${bucket}/`;
    if (!u.pathname.startsWith(prefix)) return false;
    // 경로 조작 방지: bucket 이름 이후에만 허용
    const rest = u.pathname.slice(prefix.length);
    if (!rest || rest.includes("..")) return false;
    return true;
  } catch {
    return false;
  }
}
