import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { hashPassword } from "@/lib/password";
import { requireContent, requireTitle } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServerService();
    const body = await req.json();
    const title = requireTitle(body.title);
    const content = requireContent(body.content);
    const password: string = body.password;
    const images: { url: string; sort_order: number }[] = body.images ?? [];

    if (!/^\d{4,8}$/.test(password)) {
      return NextResponse.json(
        { message: "숫자 비밀번호 4~8자리를 입력해주세요." },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(password);

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        category: "cert",
        title,
        content,
        password_hash
      })
      .select("id")
      .single();

    if (error || !post) {
      console.error(error);
      return NextResponse.json(
        { message: "글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    const postId = post.id as string;

    if (images.length > 0) {
      const rows = images.map((img) => ({
        post_id: postId,
        image_url: img.url,
        sort_order: img.sort_order
      }));
      const { error: imgError } = await supabase.from("post_images").insert(rows);
      if (imgError) {
        console.error(imgError);
      }
    }

    return NextResponse.json({ id: postId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

