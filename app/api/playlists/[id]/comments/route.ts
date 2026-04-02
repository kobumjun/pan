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
    const playlistId = params.id;

    const supabase = getSupabaseServerService();
    const { error } = await supabase.from("playlist_comments").insert({
      playlist_id: playlistId,
      user_name: user_name || null,
      content
    });

    if (error) {
      console.error("playlist_comments insert", error);
      return NextResponse.json(
        { message: "댓글 등록에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: rpcErr } = await supabase.rpc("increment_playlist_comments", {
      p_playlist_id: playlistId
    });
    if (rpcErr) console.error("increment_playlist_comments", rpcErr);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST playlist comment", e);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
