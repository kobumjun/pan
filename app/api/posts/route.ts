import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { hashPostPin, validatePostPin } from "@/lib/pin";
import { MAX_POST_IMAGES, normalizeTags, postImagesBucket } from "@/lib/postFormUtils";
import { isTrustedStoragePublicUrl } from "@/lib/validateStorageImageUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONTENT = 50_000;
const MAX_TITLE = 200;

function parseImageUrls(body: unknown): string[] {
  if (!body || typeof body !== "object" || !("image_urls" in body)) return [];
  const raw = (body as { image_urls: unknown }).image_urls;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, MAX_POST_IMAGES);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title =
      typeof body.title === "string" ? body.title.trim().slice(0, MAX_TITLE) : "";
    const content =
      typeof body.content === "string" ? body.content.trim().slice(0, MAX_CONTENT) : "";
    const author_name =
      typeof body.author_name === "string" ? body.author_name.trim().slice(0, 40) : "";
    const tags = normalizeTags(body.tags);
    const post_pin = typeof body.post_pin === "string" ? body.post_pin.trim() : "";
    const image_urls = parseImageUrls(body);

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

    const bucket = postImagesBucket();
    for (let i = 0; i < image_urls.length; i++) {
      if (!isTrustedStoragePublicUrl(image_urls[i])) {
        return NextResponse.json(
          {
            message: `허용되지 않은 이미지 주소입니다. (${bucket} 공개 URL만 사용할 수 있습니다.)`
          },
          { status: 400 }
        );
      }
    }

    const password_hash = await hashPostPin(post_pin);
    const supabase = getSupabaseServerService();

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

    for (let i = 0; i < image_urls.length; i++) {
      const { error: imgErr } = await supabase.from("post_images").insert({
        post_id: postId,
        image_url: image_urls[i],
        sort_order: i
      });
      if (imgErr) {
        console.error("post_images insert", imgErr);
        await supabase.from("posts").delete().eq("id", postId);
        return NextResponse.json(
          { message: "이미지 정보 저장에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ id: postId });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ message: "JSON 형식이 올바르지 않습니다." }, { status: 400 });
    }
    console.error("POST /api/posts", err);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
