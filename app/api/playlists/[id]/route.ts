import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { comparePostPin, validatePostPin } from "@/lib/pin";

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

async function verifyPin(
  supabase: ReturnType<typeof getSupabaseServerService>,
  playlistId: string,
  post_pin: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (!validatePostPin(post_pin)) {
    return { ok: false, status: 400, message: "숫자 비밀번호 4~6자리를 입력해주세요." };
  }
  const { data: row, error } = await supabase
    .from("playlists")
    .select("password_hash")
    .eq("id", playlistId)
    .single();

  if (error || !row) {
    return { ok: false, status: 404, message: "글을 찾을 수 없습니다." };
  }
  const hash = row.password_hash as string | null;
  if (!hash) {
    return {
      ok: false,
      status: 403,
      message: "이 글은 비밀번호가 없어 수정·삭제할 수 없습니다."
    };
  }
  const match = await comparePostPin(post_pin, hash);
  if (!match) {
    return { ok: false, status: 403, message: "비밀번호가 올바르지 않습니다." };
  }
  return { ok: true };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const post_pin =
      typeof body.post_pin === "string" ? body.post_pin.trim() : "";
    const title =
      typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
    const description =
      typeof body.description === "string" ? body.description.trim().slice(0, 5000) : "";
    const tags = normalizeTags(body.tags);

    if (!title) {
      return NextResponse.json({ message: "제목을 입력해주세요." }, { status: 400 });
    }

    const supabase = getSupabaseServerService();
    const v = await verifyPin(supabase, params.id, post_pin);
    if (!v.ok) {
      return NextResponse.json({ message: v.message }, { status: v.status });
    }

    const { error } = await supabase
      .from("playlists")
      .update({
        title,
        description: description || null,
        tags
      })
      .eq("id", params.id);

    if (error) {
      console.error("playlist patch", error);
      return NextResponse.json(
        { message: "수정에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH playlist", e);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let body: { post_pin?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const post_pin =
      typeof body.post_pin === "string" ? body.post_pin.trim() : "";

    const supabase = getSupabaseServerService();
    const v = await verifyPin(supabase, params.id, post_pin);
    if (!v.ok) {
      return NextResponse.json({ message: v.message }, { status: v.status });
    }

    const { error } = await supabase.from("playlists").delete().eq("id", params.id);
    if (error) {
      console.error("playlist delete", error);
      return NextResponse.json(
        { message: "삭제 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE playlist", e);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
