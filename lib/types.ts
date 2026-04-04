export interface PostRow {
  id: string;
  title: string;
  content: string;
  author_name: string;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string | null;
}

/** 목록용(본문 미포함) */
export interface PostListRow {
  id: string;
  title: string;
  author_name: string;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string | null;
  thumb_url: string | null;
  has_images: boolean;
}

export interface PostImageRow {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number | null;
}

export interface PostCommentRow {
  id: string;
  post_id: string;
  user_name: string | null;
  content: string;
  created_at: string;
}
