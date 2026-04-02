export interface SpotifyPlaylistMeta {
  title: string;
  description: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  track_count: number | null;
}

export async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID 또는 SPOTIFY_CLIENT_SECRET이 설정되지 않았습니다.");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`
    },
    body: "grant_type=client_credentials",
    cache: "no-store"
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Spotify token error", json);
    throw new Error("Spotify 인증에 실패했습니다.");
  }
  if (!json.access_token) {
    throw new Error("Spotify 토큰을 받지 못했습니다.");
  }
  return json.access_token as string;
}

export async function fetchSpotifyPlaylistMeta(
  playlistId: string,
  accessToken: string
): Promise<SpotifyPlaylistMeta> {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("Spotify playlist API error", data);
    const msg =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "플레이리스트를 불러오지 못했습니다.";
    throw new Error(msg);
  }

  const images = data.images as { url?: string }[] | undefined;
  const cover =
    Array.isArray(images) && images.length > 0 && images[0]?.url
      ? images[0].url
      : null;

  const owner = data.owner as { display_name?: string } | undefined;
  const tracks = data.tracks as { total?: number } | undefined;

  return {
    title: typeof data.name === "string" ? data.name : "Untitled playlist",
    description:
      typeof data.description === "string" && data.description.trim()
        ? data.description
        : null,
    cover_image_url: cover,
    author_name: owner?.display_name ?? null,
    track_count:
      typeof tracks?.total === "number" ? tracks.total : null
  };
}
