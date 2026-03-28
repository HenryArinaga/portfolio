const API_BASE_URL =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? "http://localhost:8080" : "https://blog.arinaga.dev");

const BLOG_ORIGIN =
  import.meta.env.VITE_BLOG_ORIGIN || "https://blog.arinaga.dev";

export const BLOG_SITE_URL = `${BLOG_ORIGIN}/blog`;

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  created_at: string;
  published: boolean;
}

export async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE_URL}/api/posts`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${slug}`);
  if (!res.ok) {
    throw new Error("Post not found");
  }
  return res.json();
}

export async function fetchPostPreviews(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE_URL}/api/posts/previews`);
  if (!res.ok) {
    throw new Error("Failed to fetch previews");
  }
  return res.json();
}

export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
}
