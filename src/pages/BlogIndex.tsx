import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch(() => {
        setPosts([]);
        setError("Unable to load blog posts right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return (
      <div className="blog-index">
        <header>
          <h1>Blog</h1>
        </header>
        <p>{error}</p>
        <footer className="blog-index-footer">
          <Link to="/" className="blog-home-link" aria-label="Return to home page">
            ← Back to home
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="blog-index">
      <header>
        <h1>Blog</h1>
      </header>

      <nav aria-label="Blog posts">
        <ul className="blog-index-list">
          {posts.map((post) => (
            <li key={post.id} className="blog-index-item">
              <Link to={`/blog/${post.slug}`} className="blog-index-link">
                {post.title}
              </Link>
              <time className="blog-index-date" dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString()}
              </time>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="blog-index-footer">
        <Link to="/" className="blog-home-link" aria-label="Return to home page">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
