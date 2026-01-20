// src/pages/BlogPost.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostBySlug } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    fetchPostBySlug(slug)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Loading…</p>;
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
      >
        ← Back to blog
      </button>

      <h1>{post.title}</h1>

      <p style={{ opacity: 0.7 }}>
        {new Date(post.created_at).toLocaleDateString()}
      </p>
      <div style={{ marginTop: "2rem" }} className="blog-post">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogPostPage;
