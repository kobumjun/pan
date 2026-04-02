import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { parsePlaylistUrl } from "@/lib/playlistUrl";
import {
  fetchSpotifyPlaylistMeta,
  getSpotifyAccessToken
} from "@/lib/spotify";
import { fetchYouTubePlaylistMeta } from "@/lib/youtube";
import { hashPostPin, validatePostPin } from "@/lib/pin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  if (typeof input === "string") {
    return input
      .split(/[,#]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source_url = typeof body.source_url === "string" ? body.source_url.trim() : "";
    const user_name = typeof body.user_name === "string" ? body.user_name.trim() : "";
    const titleInput = typeof body.title === "string" ? body.title.trim() : "";
    const descriptionInput =
      typeof body.description === "string" ? body.description.trim() : "";
    const tags = normalizeTags(body.tags);
    const post_pin_raw =
      typeof body.post_pin === "string" ? body.post_pin.trim() : "";

    if (!validatePostPin(post_pin_raw)) {
      return NextResponse.json(
        { message: "글 비밀번호는 숫자 4~6자리로 설정해주세요." },
        { status: 400 }
      );
    }

    if (!user_name) {
      return NextResponse.json({ message: "닉네임을 입력해주세요." }, { status: 400 });
    }
    if (!source_url) {
      return NextResponse.json({ message: "플레이리스트 링크를 입력해주세요." }, { status: 400 });
    }

    const parsed = parsePlaylistUrl(source_url);
    if (!parsed) {
      return NextResponse.json(
        { message: "지원하는 Spotify 또는 YouTube 플레이리스트 링크가 아닙니다." },
        { status: 400 }
      );
    }

    let title = titleInput;
    let description: string | null = descriptionInput || null;
    let cover_image_url: string | null = null;
    let author_name: string | null = null;
    let track_count: number | null = null;
    const source_type = parsed.source_type;
    const source_id = parsed.source_id;

    if (source_type === "youtube") {
      if (!source_id) {
        return NextResponse.json(
          {
            message:
              "YouTube 플레이리스트 ID를 URL에서 찾을 수 없습니다. playlist?list= 형식 링크를 사용해주세요."
          },
          { status: 400 }
        );
      }
      try {
        const meta = await fetchYouTubePlaylistMeta(source_id);
        title = titleInput || meta.title;
        description = descriptionInput || meta.description;
        cover_image_url = meta.cover_image_url;
        author_name = meta.author_name;
        track_count = meta.track_count;
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "YouTube 정보를 가져오지 못했습니다.";
        console.error("YouTube metadata error", e);
        return NextResponse.json({ message: msg }, { status: 502 });
      }
    }

    if (source_type === "spotify") {
      if (!source_id) {
        return NextResponse.json(
          { message: "Spotify 플레이리스트 ID를 추출할 수 없습니다." },
          { status: 400 }
        );
      }
      try {
        const token = await getSpotifyAccessToken();
        const meta = await fetchSpotifyPlaylistMeta(source_id, token);
        title = titleInput || meta.title;
        description = descriptionInput || meta.description;
        cover_image_url = meta.cover_image_url;
        author_name = meta.author_name;
        track_count = meta.track_count;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Spotify 정보를 가져오지 못했습니다.";
        console.error("Spotify metadata error", e);
        return NextResponse.json({ message: msg }, { status: 502 });
      }
    }

    if (!title) {
      return NextResponse.json({ message: "제목이 필요합니다." }, { status: 400 });
    }

    const password_hash = await hashPostPin(post_pin_raw);
    const supabase = getSupabaseServerService();
    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_name,
        title,
        description,
        source_type,
        source_url,
        source_id,
        cover_image_url,
        author_name,
        track_count,
        tags,
        password_hash
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("playlists insert error", error);
      return NextResponse.json(
        { message: "저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("POST /api/playlists", err);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
