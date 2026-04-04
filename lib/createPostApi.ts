type CreatePostPayload = {
  title: string;
  content: string;
  author_name: string;
  tags: string;
  post_pin: string;
  image_urls: string[];
};

export async function createPostWithJson(payload: CreatePostPayload): Promise<{ id: string }> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = (await res.json()) as { message?: string; id?: string };
  if (!res.ok) {
    throw new Error(data.message ?? "등록에 실패했습니다.");
  }
  if (!data.id) {
    throw new Error("응답에 글 ID가 없습니다.");
  }
  return { id: data.id };
}
