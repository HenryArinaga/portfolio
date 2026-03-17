// src/pages/BlogPost.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostBySlug, getImageUrl } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

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

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <article
      style={{
        maxWidth: "800px",
        margin: "4rem auto",
        padding: "0 2rem",
      }}
    >
      <button
        onClick={() => navigate("/", { state: { scrollToBlog: true } })}
        className="blog-back-button"
        aria-label="Go back to blog section"
      >
        ← Back to blog
      </button>

      <header>
        <h1>{post.title}</h1>

        <p style={{ opacity: 0.7 }}>
          {new Date(post.created_at).toLocaleDateString()}
        </p>

        {post.excerpt && (
          <p style={{ 
            fontSize: '1.2rem', 
            fontStyle: 'italic', 
            marginTop: '1rem',
            opacity: 0.8 
          }}>
            {post.excerpt}
          </p>
        )}
      </header>

      {post.image_url && (
        <div style={{ margin: '2rem 0' }}>
          <img 
            src={getImageUrl(post.image_url)} 
            alt={post.title}
            className="blog-post-image"
            style={{ 
              width: '100%', 
              height: 'auto',
              borderRadius: '8px' 
            }}
          />
        </div>
      )}

      <div style={{ marginTop: "2rem" }} className="blog-post">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogPostPage;
