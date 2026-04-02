import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientKey = req.headers.get("x-playlist-client-key")?.trim() ?? "";
    if (clientKey.length < 8) {
      return NextResponse.json(
        { message: "클라이언트 키가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const playlistId = params.id;
    const supabase = getSupabaseServerService();

    const { data: existing, error: findErr } = await supabase
      .from("playlist_likes")
      .select("id")
      .eq("playlist_id", playlistId)
      .eq("client_key", clientKey)
      .maybeSingle();

    if (findErr) {
      console.error("playlist_likes find", findErr);
      return NextResponse.json(
        { message: "좋아요 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (existing?.id) {
      const { error: delErr } = await supabase
        .from("playlist_likes")
        .delete()
        .eq("id", existing.id);
      if (delErr) {
        console.error("playlist_likes delete", delErr);
        return NextResponse.json(
          { message: "좋아요 취소에 실패했습니다." },
          { status: 500 }
        );
      }
      const { error: rpcErr } = await supabase.rpc("decrement_playlist_likes", {
        p_playlist_id: playlistId
      });
      if (rpcErr) console.error("decrement_playlist_likes", rpcErr);
    } else {
      const { error: insErr } = await supabase.from("playlist_likes").insert({
        playlist_id: playlistId,
        client_key: clientKey
      });
      if (insErr) {
        console.error("playlist_likes insert", insErr);
        return NextResponse.json(
          { message: "좋아요 등록에 실패했습니다." },
          { status: 500 }
        );
      }
      const { error: rpcErr } = await supabase.rpc("increment_playlist_likes", {
        p_playlist_id: playlistId
      });
      if (rpcErr) console.error("increment_playlist_likes", rpcErr);
    }

    const { data: row, error: countErr } = await supabase
      .from("playlists")
      .select("likes_count")
      .eq("id", playlistId)
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
    console.error("POST playlist like", e);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
