// src/sections/BlogSection.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchPosts } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";
import { BlogCard } from "../components/BlogCard";
import { ScrollReveal } from "../components/ScrollReveal";

/**
 * Calculate estimated read time based on content length
 * Assumes average reading speed of 200 words per minute
 */
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

const BlogSection = () => {
  const location = useLocation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch(() => {
        setPosts([]);
        setError("Blog posts are temporarily unavailable.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state?.scrollToBlog) {
      const section = document.getElementById("blog");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.state]);

  return (
    <section className="blog" id="blog">
      <div className="container">
        <ScrollReveal threshold={0.2}>
          <h2 className="blog-title">Blog</h2>
        </ScrollReveal>

        <ScrollReveal delay={100} threshold={0.2}>
          <div className="blog-wip">
            <h3 className="blog-wip-title">Work in Progress</h3>
            <p className="blog-wip-text">
              This blog is powered by a custom Go + SQLite backend deployed on
              AWS. Frontend integration and routing are currently being finalized.
            </p>
          </div>
        </ScrollReveal>

        {loading && (
          <div className="blog-loading">
            <p>Loading posts...</p>
          </div>
        )}

        {!loading && error && (
          <div className="blog-loading" role="status">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="blog-grid">
            {posts.map((post, index) => (
              <ScrollReveal
                key={post.id}
                delay={100 + index * 100}
                threshold={0.2}
              >
                <BlogCard
                  title={post.title}
                  date={post.created_at}
                  preview={
                    post.excerpt || 
                    (post.content.length > 140
                      ? `${post.content.slice(0, 140)}…`
                      : post.content)
                  }
                  slug={post.slug}
                  readTime={calculateReadTime(post.content)}
                  imageUrl={post.image_url}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <ScrollReveal delay={200} threshold={0.2}>
            <div className="blog-view-all">
              <Link
                to="/blog"
                className="blog-view-all-button"
              >
                View all blog posts →
              </Link>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
