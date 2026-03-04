const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ADMIN_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
};

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

export async function fetchAdminPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/posts`, {
    headers: ADMIN_HEADERS,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin posts");
  }

  return res.json();
}

export async function createAdminPost(data: {
  title: string;
  content: string;
  published: boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/api/admin/posts`, {
    method: "POST",
    headers: ADMIN_HEADERS,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create post");
  }
}

export async function updateAdminPost(
  id: number,
  data: {
    title: string;
    content: string;
    published: boolean;
  }
) {
  const res = await fetch(`${API_BASE_URL}/api/admin/posts/${id}`, {
    method: "PUT",
    headers: ADMIN_HEADERS,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update post");
  }
}

