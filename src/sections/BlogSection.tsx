import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useFadeInOnScroll from "../hooks/useFadeInOnScroll";
import { fetchPosts } from "../services/blogApi";
import type { BlogPost } from "../services/blogApi";

const BlogSection = () => {
  const { ref, isVisible } = useFadeInOnScroll();

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

        <div className="blog-wip">
          <h3 className="blog-wip-title">Work in Progress</h3>
          <p className="blog-wip-text">
            This blog is powered by a custom Go + SQLite backend deployed on AWS.
            Frontend integration and routing are currently being finalized.
          </p>
        </div>

        <div className="blog-list">
          {loading && <p>Loading posts...</p>}

          {!loading &&
            posts.map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="blog-post-link"
              >
                <article
                  className={`blog-post delay-${index + 1} ${
                    isVisible ? "visible" : ""
                  }`}
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
              </Link>
            ))}
        </div>

        {!loading && (
          <div className="blog-view-all">
            <Link to="/blog">View all blog posts →</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
