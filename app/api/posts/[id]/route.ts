import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerService } from "@/lib/supabaseServer";
import { comparePassword } from "@/lib/password";
import { requireContent, requireTitle } from "@/lib/validation";

export const runtime = "nodejs";

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
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const password: string | undefined = body.password;

    if (!password || !/^\d{4,8}$/.test(password)) {
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

    // 3. 이미지 경로 조회
    const { data: images, error: imgSelectError } = await supabase
      .from("post_images")
      .select("image_url")
      .eq("post_id", params.id);
    if (imgSelectError) {
      console.error("post_images select error", imgSelectError);
    }

    // 4. 연관 댓글 삭제
    const { error: commentsError } = await supabase
      .from("comments")
      .delete()
      .eq("post_id", params.id);
    if (commentsError) {
      console.error("comments delete error", commentsError);
      return NextResponse.json(
        { message: "댓글 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 5. 연관 좋아요 삭제
    const { error: likesError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", params.id);
    if (likesError) {
      console.error("likes delete error", likesError);
      return NextResponse.json(
        { message: "추천 정보 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 6. 이미지 행 삭제
    const { error: postImagesError } = await supabase
      .from("post_images")
      .delete()
      .eq("post_id", params.id);
    if (postImagesError) {
      console.error("post_images delete error", postImagesError);
      return NextResponse.json(
        { message: "이미지 정보 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 7. 스토리지 이미지 삭제 (가능하면 시도, 실패해도 글 삭제는 진행)
    if (images && images.length > 0) {
      const paths = images
        .map((row: { image_url: string }) => {
          const url = row.image_url;
          const marker = "/storage/v1/object/public/post-images/";
          const idx = url.indexOf(marker);
          if (idx === -1) return null;
          return url.slice(idx + marker.length);
        })
        .filter((p): p is string => !!p);

      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("post-images")
          .remove(paths);
        if (storageError) {
          console.error("storage remove error", storageError);
        }
      }
    }

    // 8. 글 삭제
    const { error: postError } = await supabase
      .from("posts")
      .delete()
      .eq("id", params.id);
    if (postError) {
      console.error("posts delete error", postError);
      return NextResponse.json(
        { message: "글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    // 9. 목록 페이지 무효화
    try {
      revalidatePath("/");
      revalidatePath("/best");
    } catch (e) {
      console.error("revalidatePath error", e);
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

