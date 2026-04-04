import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import {
  isAllowedImageFile,
  MAX_IMAGE_BYTES,
  MAX_POST_IMAGES,
  postImagesBucket
} from "@/lib/postFormUtils";

export class PostImageUploadError extends Error {
  constructor(
    message: string,
    public readonly fileLabel: string
  ) {
    super(message);
    this.name = "PostImageUploadError";
  }
}

function extForMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export function publicUrlToStoragePath(publicUrl: string, bucket: string): string | null {
  try {
    const u = new URL(publicUrl);
    const prefix = `/storage/v1/object/public/${bucket}/`;
    if (!u.pathname.startsWith(prefix)) return null;
    return decodeURIComponent(u.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

/** 글 등록 실패 시 업로드만 된 객체 정리 */
export async function removePostImagesByPublicUrls(publicUrls: string[]): Promise<void> {
  if (publicUrls.length === 0) return;
  const supabase = getSupabaseBrowser();
  const bucket = postImagesBucket();
  const paths = publicUrls
    .map((u) => publicUrlToStoragePath(u, bucket))
    .filter((p): p is string => !!p);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) console.error("removePostImagesByPublicUrls", error);
}

export type UploadProgressFn = (
  completed: number,
  total: number,
  currentFileLabel: string
) => void;

/**
 * 브라우저에서 Supabase Storage `incoming/` 경로로 직접 업로드.
 * 하나라도 실패하면 이미 성공한 객체는 best-effort로 삭제 후 에러 throw.
 */
export async function uploadPostImagesFromFiles(
  files: File[],
  onProgress?: UploadProgressFn
): Promise<string[]> {
  if (files.length > MAX_POST_IMAGES) {
    throw new PostImageUploadError(
      `이미지는 최대 ${MAX_POST_IMAGES}장까지 첨부할 수 있습니다.`,
      ""
    );
  }

  const supabase = getSupabaseBrowser();
  const bucket = postImagesBucket();
  const uploadedUrls: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const label = file.name?.trim() || `이미지 ${i + 1}`;

      if (!isAllowedImageFile(file)) {
        throw new PostImageUploadError(
          `형식 또는 크기가 맞지 않습니다. (JPEG/PNG/WebP/GIF, ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB 이하)`,
          label
        );
      }

      const ext = extForMime(file.type);
      const path = `incoming/${crypto.randomUUID()}.${ext}`;

      onProgress?.(i + 1, files.length, label);

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type,
        upsert: false
      });

      if (error) {
        throw new PostImageUploadError(
          error.message || "Storage 업로드에 실패했습니다.",
          label
        );
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(bucket).getPublicUrl(path);
      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  } catch (e) {
    if (uploadedUrls.length > 0) {
      const paths = uploadedUrls
        .map((u) => publicUrlToStoragePath(u, bucket))
        .filter((p): p is string => !!p);
      if (paths.length > 0) {
        const { error: rmErr } = await supabase.storage.from(bucket).remove(paths);
        if (rmErr) console.error("upload rollback remove", rmErr);
      }
    }
    throw e;
  }
}
