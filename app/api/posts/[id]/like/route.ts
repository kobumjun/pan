import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientKey = req.headers.get("x-post-client-key")?.trim() ?? "";
    if (clientKey.length < 8) {
      return NextResponse.json(
        { message: "클라이언트 키가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const postId = params.id;
    const supabase = getSupabaseServerService();

    const { data: existing, error: findErr } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("client_key", clientKey)
      .maybeSingle();

    if (findErr) {
      console.error("likes find", findErr);
      return NextResponse.json(
        { message: "좋아요 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (existing?.id) {
      const { error: delErr } = await supabase.from("likes").delete().eq("id", existing.id);
      if (delErr) {
        console.error("likes delete", delErr);
        return NextResponse.json(
          { message: "좋아요 취소에 실패했습니다." },
          { status: 500 }
        );
      }
      const { error: rpcErr } = await supabase.rpc("decrement_likes", {
        p_post_id: postId
      });
      if (rpcErr) console.error("decrement_likes", rpcErr);
    } else {
      const { error: insErr } = await supabase.from("likes").insert({
        post_id: postId,
        client_key: clientKey
      });
      if (insErr) {
        console.error("likes insert", insErr);
        return NextResponse.json(
          { message: "좋아요 등록에 실패했습니다." },
          { status: 500 }
        );
      }
      const { error: rpcErr } = await supabase.rpc("increment_likes", {
        p_post_id: postId
      });
      if (rpcErr) console.error("increment_likes", rpcErr);
    }

    const { data: row, error: countErr } = await supabase
      .from("posts")
      .select("likes_count")
      .eq("id", postId)
      .single();

    if (countErr || !row) {
      return NextResponse.json(
        { message: "좋아요 수를 불러오지 못했습니다." },
        { status: 500 }
      );
    }

    const liked = !existing?.id;
    return NextResponse.json({
      liked,
      likes_count: row.likes_count as number
    });
  } catch (e) {
    console.error("POST post like", e);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
