import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFadeInOnScroll from "../hooks/useFadeInOnScroll";
import { fetchPosts } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";

const BlogSection = () => {
  const { ref, isVisible } = useFadeInOnScroll();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      ref={ref}
      className={`blog fade-in-section ${isVisible ? "is-visible" : ""}`}
      id="blog"
    >
      <div className="blog-inner">
        <h2 className="blog-title">Blog</h2>

        <div className="blog-list">
          {loading && <p>Loading posts...</p>}

          {posts.map((post, index) => (
            <article
              key={post.id}
              className={`blog-post delay-${index + 1} ${
                isVisible ? "visible" : ""
              }`}
              onClick={() => navigate(`/blog/${post.slug}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="blog-post-header">
                <h3 className="blog-post-title">{post.title}</h3>
                <span className="blog-post-date">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="blog-post-preview">
                {post.content.slice(0, 140)}…
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
