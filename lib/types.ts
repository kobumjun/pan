export type PlaylistSource = "spotify" | "youtube";

export interface PlaylistRow {
  id: string;
  user_name: string;
  title: string;
  description: string | null;
  source_type: PlaylistSource;
  source_url: string;
  source_id: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  track_count: number | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface PlaylistCommentRow {
  id: string;
  playlist_id: string;
  user_name: string | null;
  content: string;
  created_at: string;
}
