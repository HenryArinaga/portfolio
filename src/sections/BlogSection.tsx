import useFadeInOnScroll from "../hooks/useFadeInOnScroll";

type BlogPost = {
  title: string;
  date: string;
  preview: string;
};

const posts: BlogPost[] = [
  {
    title: "Building RSAlite: Learning C Through Cryptography",
    date: "Nov 2025",
    preview:
      "How I turned my curiosity about prime numbers and RSA into an educational tool written in C.",
  },
  {
    title: "From Classroom to Odin: What OS Labs Taught Me",
    date: "Nov 2025",
    preview:
      "A reflection on debugging race conditions, semaphores, and why low-level work is strangely fun.",
  },
  {
    title: "Shooting for the Stars: Why I Want to Work in Game/Cloud Backend",
    date: "Nov 2025",
    preview:
      "Putting together my background, goals, and the kind of problems I want to solve professionally.",
  },
];

const BlogSection = () => {
  const { ref, isVisible } = useFadeInOnScroll();
  return (
    <section
      ref={ref}
      className={`blog fade-in-section ${isVisible ? "is-visible" : ""}`}
      id="blog"
    >
      <div className="blog-inner">
        <h2 className="blog-title">Blog</h2>

        <div className="blog-list">
          {posts.map((post, index) => (
            <article
              key={post.title}
              className={`blog-post delay-${index + 1} ${
                isVisible ? "visible" : ""
              }`}
            >
              <div className="blog-post-header">
                <h3 className="blog-post-title">{post.title}</h3>
                <span className="blog-post-date">{post.date}</span>
              </div>
              <p className="blog-post-preview">{post.preview}</p>
            </article>
          ))}
        </div>
        <div className="blog-footer">
          <button className="blog-all-button">Read all posts</button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
