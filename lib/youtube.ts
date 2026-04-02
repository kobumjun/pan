export interface YouTubePlaylistMeta {
  title: string;
  description: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  track_count: number | null;
}

export async function fetchYouTubePlaylistMeta(
  playlistId: string
): Promise<YouTubePlaylistMeta> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY가 설정되지 않았습니다.");
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("id", playlistId);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) {
    console.error("YouTube playlists.list error", data);
    const msg =
      data?.error?.message && typeof data.error.message === "string"
        ? data.error.message
        : "YouTube 플레이리스트 정보를 가져오지 못했습니다.";
    throw new Error(msg);
  }

  const item = Array.isArray(data.items) ? data.items[0] : null;
  if (!item) {
    throw new Error("플레이리스트를 찾을 수 없거나 비공개일 수 있습니다.");
  }

  const sn = item.snippet ?? {};
  const cd = item.contentDetails ?? {};
  const thumbs = sn.thumbnails ?? {};
  const thumb =
    thumbs.maxres?.url ||
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    null;

  const title = typeof sn.title === "string" ? sn.title : "Untitled";
  const desc =
    typeof sn.description === "string" && sn.description.trim()
      ? sn.description
      : null;
  const channel =
    typeof sn.channelTitle === "string" ? sn.channelTitle : null;
  const count =
    typeof cd.itemCount === "string"
      ? parseInt(cd.itemCount, 10)
      : typeof cd.itemCount === "number"
        ? cd.itemCount
        : null;

  return {
    title,
    description: desc,
    cover_image_url: thumb,
    author_name: channel,
    track_count: Number.isFinite(count as number) ? (count as number) : null
  };
}
