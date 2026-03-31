import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { hashPassword } from "@/lib/password";
import { requireContent } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServerService();
    const body = await req.json();
    const postId: string = body.postId;
    const content = requireContent(body.content);
    const password: string = body.password;

    if (!postId) {
      return NextResponse.json(
        { message: "잘못된 요청입니다." },
        { status: 400 }
      );
    }
    if (!/^\d{4,8}$/.test(password)) {
      return NextResponse.json(
        { message: "숫자 비밀번호 4~8자리를 입력해주세요." },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(password);

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        content,
        password_hash
      })
      .select("id")
      .single();

    if (error || !comment) {
      console.error(error);
      return NextResponse.json(
        { message: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: countError } = await supabase.rpc("increment_comments", {
      p_post_id: postId
    });
    if (countError) {
      console.error(countError);
    }

    return NextResponse.json({ id: comment.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

