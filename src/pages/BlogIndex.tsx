import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  return (
    <div className="blog-index">
      <h1>Blog</h1>

      <ul className="blog-index-list">
        {posts.map((post) => (
          <li key={post.id} className="blog-index-item">
            <Link to={`/blog/${post.slug}`} className="blog-index-link">
              {post.title}
            </Link>
            <span className="blog-index-date">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>

      <div className="blog-index-footer">
        <Link to="/" className="blog-home-link">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
