import { useEffect, useState } from "react";
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

        {/*Work In Progress Notice */}
        <div className="blog-wip">
          <h3 className="blog-wip-title">Work in Progress</h3>
          <p className="blog-wip-text">
            This blog is powered by a custom Go + SQLite backend deployed on AWS.
            Frontend integration and routing are currently being finalized.
          </p>
          <p className="blog-wip-subtext">
            Full post pages and dynamic navigation coming soon.
          </p>
        </div>

        <div className="blog-list">
          {loading && <p>Loading posts...</p>}

          {posts.map((post, index) => (
            <article
              key={post.id}
              className={`blog-post delay-${index + 1} ${
                isVisible ? "visible" : ""
              } blog-post-disabled`}
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
