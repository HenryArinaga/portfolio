import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";
import { BlogCard } from "../components/BlogCard";

const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
};

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
    return (
      <section className="blog-page-shell">
        <div className="blog-page-backdrop" aria-hidden="true" />
        <div className="blog-page-container">
          <div className="blog-page-status-card">
            <p>Loading posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="blog-page-shell">
        <div className="blog-page-backdrop" aria-hidden="true" />
        <div className="blog-page-container">
          <div className="blog-page-hero">
            <span className="blog-page-eyebrow">Notebook</span>
            <h1 className="blog-page-title">Blog</h1>
            <p className="blog-page-subtitle">
              Long-form notes on backend systems, tools, and things worth
              building carefully.
            </p>
          </div>

          <div className="blog-page-status-card">
            <p>{error}</p>
          </div>

          <footer className="blog-page-footer">
            <Link to="/" className="blog-home-link" aria-label="Return to home page">
              Return to home
            </Link>
          </footer>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-page-shell">
      <div className="blog-page-backdrop" aria-hidden="true" />
      <div className="blog-page-container">
        <header className="blog-page-hero">
          <span className="blog-page-eyebrow">Notebook</span>
          <h1 className="blog-page-title">Blog</h1>
          <p className="blog-page-subtitle">
            Long-form notes on backend systems, development workflows, and
            practical lessons from building on the web.
          </p>

          <div className="blog-page-meta">
            <div className="blog-page-stat">
              <strong>{posts.length}</strong>
              <span>{posts.length === 1 ? "Published post" : "Published posts"}</span>
            </div>
            <div className="blog-page-stat">
              <strong>Go + React</strong>
              <span>Custom publishing stack</span>
            </div>
          </div>
        </header>

        {posts.length > 0 ? (
          <nav aria-label="Blog posts">
            <div className="blog-page-grid">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  date={post.created_at}
                  preview={
                    post.excerpt ||
                    (post.content.length > 160
                      ? `${post.content.slice(0, 160)}…`
                      : post.content)
                  }
                  slug={post.slug}
                  readTime={calculateReadTime(post.content)}
                  imageUrl={post.image_url}
                />
              ))}
            </div>
          </nav>
        ) : (
          <div className="blog-page-status-card">
            <p>No posts yet. Check back soon.</p>
          </div>
        )}

        <footer className="blog-page-footer">
          <Link to="/" className="blog-home-link" aria-label="Return to home page">
            Return to home
          </Link>
        </footer>
      </div>
    </section>
  );
}
