import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { comparePassword, hashPassword } from "@/lib/password";
import { requireContent, requireTitle } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerService();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error || !data) {
      return NextResponse.json(
        { message: "글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const supabase = getSupabaseServerService();
    const { data: existing, error: fetchError } = await supabase
      .from("posts")
      .select("password_hash")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "글을 찾을 수 없습니다." },
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

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title,
        content
      })
      .eq("id", params.id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { message: "글 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    await supabase.from("post_images").delete().eq("post_id", params.id);

    if (images.length > 0) {
      const rows = images.map((img) => ({
        post_id: params.id,
        image_url: img.url,
        sort_order: img.sort_order
      }));
      const { error: imgError } = await supabase.from("post_images").insert(rows);
      if (imgError) {
        console.error(imgError);
      }
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
    const body = await req.json();
    const password: string = body.password;

    if (!/^\d{4,8}$/.test(password)) {
      return NextResponse.json(
        { message: "숫자 비밀번호 4~8자리를 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerService();
    const { data: existing, error: fetchError } = await supabase
      .from("posts")
      .select("password_hash")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "글을 찾을 수 없습니다." },
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

    const { error } = await supabase.from("posts").delete().eq("id", params.id);
    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "글 삭제에 실패했습니다." },
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

