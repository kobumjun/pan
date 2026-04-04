import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireContent(value: unknown): string {
  if (typeof value !== "string") throw new Error("invalid");
  const t = value.trim();
  if (t.length < 1) throw new Error("empty");
  if (t.length > 2000) throw new Error("long");
  return t;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    let content: string;
    try {
      content = requireContent(body.content);
    } catch {
      return NextResponse.json(
        { message: "댓글 내용을 1~2000자로 입력해주세요." },
        { status: 400 }
      );
    }

    const user_name =
      typeof body.user_name === "string" ? body.user_name.trim().slice(0, 40) : "";
    const postId = params.id;

    const supabase = getSupabaseServerService();
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_name: user_name || null,
      content,
      password_hash: null
    });

    if (error) {
      console.error("comments insert", error);
      return NextResponse.json(
        { message: "댓글 등록에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: rpcErr } = await supabase.rpc("increment_comments", {
      p_post_id: postId
    });
    if (rpcErr) console.error("increment_comments", rpcErr);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST post comment", e);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
