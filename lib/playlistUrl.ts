export type ParsedPlaylistUrl =
  | { source_type: "spotify"; source_id: string }
  | { source_type: "youtube"; source_id: string | null };

export function parsePlaylistUrl(raw: string): ParsedPlaylistUrl | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("spotify:playlist:")) {
    const id = trimmed.replace("spotify:playlist:", "").split("?")[0];
    if (id) return { source_type: "spotify", source_id: id };
  }

  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();

    if (host.includes("spotify.com")) {
      const m = u.pathname.match(/\/playlist\/([a-zA-Z0-9]+)/);
      if (m?.[1]) return { source_type: "spotify", source_id: m[1] };
    }

    if (
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const list = u.searchParams.get("list");
      if (list) return { source_type: "youtube", source_id: list };
    }

    if (host === "youtu.be") {
      const list = u.searchParams.get("list");
      if (list) return { source_type: "youtube", source_id: list };
    }
  } catch {
    return null;
  }

  return null;
}
