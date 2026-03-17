// src/pages/BlogPost.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPostBySlug, getImageUrl } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
};

const BlogPostPage = () => {
  const { slug } = useParams();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Post not found.");
      return;
    }

    fetchPostBySlug(slug)
      .then(setPost)
      .catch(() => {
        setPost(null);
        setError("Unable to load this post right now.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <section className="blog-page-shell">
        <div className="blog-page-backdrop" aria-hidden="true" />
        <div className="blog-page-container">
          <div className="blog-page-status-card">
            <p>Loading article...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="blog-page-shell">
        <div className="blog-page-backdrop" aria-hidden="true" />
        <div className="blog-page-container">
          <div className="blog-page-status-card">
            <p>{error || "Post not found."}</p>
          </div>
          <div className="blog-page-footer">
            <Link to="/blog" className="blog-home-link">
              Return to all posts
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-page-shell blog-article-shell">
      <div className="blog-page-backdrop" aria-hidden="true" />
      <article className="blog-article-layout">
        <div className="blog-article-nav">
          <Link
            to="/blog"
            className="blog-back-button"
            aria-label="Go back to blog listing"
          >
            Back to all posts
          </Link>
        </div>

        <header className="blog-article-hero">
          <div className="blog-article-meta">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="blog-article-meta-separator" aria-hidden="true">
              •
            </span>
            <span>{calculateReadTime(post.content)}</span>
          </div>

          <h1 className="blog-article-title">{post.title}</h1>

          {post.excerpt && (
            <p className="blog-article-excerpt">{post.excerpt}</p>
          )}
        </header>

        {post.image_url && (
          <div className="blog-article-image-frame">
            <img
              src={getImageUrl(post.image_url)}
              alt={post.title}
              className="blog-post-image"
            />
          </div>
        )}

        <div className="blog-article-body">
          <div className="blog-post">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </section>
  );
};

export default BlogPostPage;
