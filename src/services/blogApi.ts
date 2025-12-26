const API_BASE = import.meta.env.VITE_API_BASE;

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  published: boolean;
};

export async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/api/posts`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/posts/${slug}`);
  if (!res.ok) {
    throw new Error("Post not found");
  }
  return res.json();
}
