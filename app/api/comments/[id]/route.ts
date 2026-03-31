import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { comparePassword, hashPassword } from "@/lib/password";
import { requireContent } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerService();
    const body = await req.json();
    const content = requireContent(body.content);
    const password: string = body.password;

    if (!/^\d{4,8}$/.test(password)) {
      return NextResponse.json(
        { message: "숫자 비밀번호 4~8자리를 입력해주세요." },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("comments")
      .select("password_hash")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const matched = await comparePassword(password, existing.password_hash);
    if (!matched) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", params.id);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "댓글 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: params.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerService();
    const body = await req.json();
    const password: string = body.password;

    if (!/^\d{4,8}$/.test(password)) {
      return NextResponse.json(
        { message: "숫자 비밀번호 4~8자리를 입력해주세요." },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("comments")
      .select("password_hash, post_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const matched = await comparePassword(password, existing.password_hash);
    if (!matched) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "댓글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: countError } = await supabase.rpc("decrement_comments", {
      p_post_id: existing.post_id
    });
    if (countError) {
      console.error(countError);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

