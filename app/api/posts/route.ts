import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { hashPostPin, validatePostPin } from "@/lib/pin";
import {
  isAllowedImageFile,
  MAX_POST_IMAGES,
  normalizeTags,
  postImagesBucket
} from "@/lib/postFormUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONTENT = 50_000;
const MAX_TITLE = 200;

async function parseBody(req: NextRequest): Promise<{
  title: string;
  content: string;
  author_name: string;
  tags: string[];
  post_pin: string;
  files: File[];
}> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim().slice(0, MAX_TITLE);
    const content = String(form.get("content") ?? "").trim().slice(0, MAX_CONTENT);
    const author_name = String(form.get("author_name") ?? "").trim().slice(0, 40);
    const tags = normalizeTags(String(form.get("tags") ?? ""));
    const post_pin = String(form.get("post_pin") ?? "").trim();
    const files: File[] = [];
    for (const v of form.getAll("images")) {
      if (v instanceof File && v.size > 0) {
        if (files.length >= MAX_POST_IMAGES) break;
        files.push(v);
      }
    }
    return { title, content, author_name, tags, post_pin, files };
  }

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim().slice(0, MAX_TITLE) : "";
  const content =
    typeof body.content === "string" ? body.content.trim().slice(0, MAX_CONTENT) : "";
  const author_name =
    typeof body.author_name === "string" ? body.author_name.trim().slice(0, 40) : "";
  const tags = normalizeTags(body.tags);
  const post_pin = typeof body.post_pin === "string" ? body.post_pin.trim() : "";
  return { title, content, author_name, tags, post_pin, files: [] };
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, author_name, tags, post_pin, files } = await parseBody(req);

    if (!validatePostPin(post_pin)) {
      return NextResponse.json(
        { message: "글 비밀번호는 숫자 4~6자리로 설정해주세요." },
        { status: 400 }
      );
    }
    if (!author_name) {
      return NextResponse.json({ message: "작성자(닉네임)를 입력해주세요." }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ message: "제목을 입력해주세요." }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ message: "본문을 입력해주세요." }, { status: 400 });
    }

    for (const f of files) {
      if (!isAllowedImageFile(f)) {
        return NextResponse.json(
          { message: "이미지는 JPEG/PNG/WebP/GIF, 파일당 4MB 이하만 가능합니다." },
          { status: 400 }
        );
      }
    }

    const password_hash = await hashPostPin(post_pin);
    const supabase = getSupabaseServerService();
    const bucket = postImagesBucket();

    const { data: inserted, error: insErr } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        author_name,
        tags,
        password_hash,
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      console.error("posts insert", insErr);
      return NextResponse.json({ message: "저장에 실패했습니다." }, { status: 500 });
    }

    const postId = inserted.id as string;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : file.type === "image/gif"
              ? "gif"
              : "jpg";
      const path = `${postId}/${randomUUID()}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
        contentType: file.type,
        upsert: false
      });
      if (upErr) {
        console.error("storage upload", upErr);
        await supabase.from("posts").delete().eq("id", postId);
        return NextResponse.json(
          { message: "이미지 업로드에 실패했습니다. Storage 버킷 설정을 확인해주세요." },
          { status: 500 }
        );
      }
      const {
        data: { publicUrl }
      } = supabase.storage.from(bucket).getPublicUrl(path);
      const { error: imgErr } = await supabase.from("post_images").insert({
        post_id: postId,
        image_url: publicUrl,
        sort_order: i
      });
      if (imgErr) {
        console.error("post_images insert", imgErr);
      }
    }

    return NextResponse.json({ id: postId });
  } catch (err) {
    console.error("POST /api/posts", err);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
