export type Category = "cert";

export interface Post {
  id: string;
  category: Category;
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string | null;
  images?: PostImage[];
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number | null;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

