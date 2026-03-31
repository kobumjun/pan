import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerService();
    const clientKey = req.headers.get("x-client-key") ?? "";

    const { error: likeError } = await supabase.from("likes").insert({
      post_id: params.id,
      client_key: clientKey || null
    });
    if (likeError) {
      console.error(likeError);
    }

    const { error } = await supabase.rpc("increment_likes", { p_post_id: params.id });
    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "추천 처리에 실패했습니다." },
        { status: 500 }
      );
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

