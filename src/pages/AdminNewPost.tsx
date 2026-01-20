import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AdminNewPost = () => {
  const [adminToken, setAdminToken] = useState(
    sessionStorage.getItem("adminToken") || ""
  );
  const [inputToken, setInputToken] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [status, setStatus] = useState("");


  if (!adminToken) {
    return (
      <div style={{ maxWidth: 400, margin: "6rem auto", textAlign: "center" }}>
        <h2>Admin Access</h2>

        <input
          type="password"
          placeholder="Enter admin token"
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <button
          onClick={() => {
            sessionStorage.setItem("adminToken", inputToken);
            setAdminToken(inputToken);
          }}
        >
          Unlock
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setStatus("Saving...");

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          published,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("Post created successfully!");
      setTitle("");
      setSlug("");
      setContent("");
    } catch {
      setStatus("Error creating post");
    }
  };


  return (
    <div style={{ maxWidth: 900, margin: "4rem auto", padding: "2rem" }}>
      <h1>New Blog Post</h1>

      <button
        style={{ marginBottom: "1rem" }}
        onClick={() => {
          sessionStorage.removeItem("adminToken");
          setAdminToken("");
        }}
      >
        Logout
      </button>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => {
          const value = e.target.value;
          setTitle(value);
          setSlug(
            value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          );
        }}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        <textarea
          placeholder="Write Markdown here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          style={{ width: "100%", fontFamily: "monospace" }}
        />

        <div
          className="blog-post"
          style={{
            border: "1px solid #333",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || "*Live preview*"}
          </ReactMarkdown>
        </div>
      </div>

      <button onClick={handleSubmit} style={{ marginTop: "1rem" }}>
        Publish
      </button>

      <p>{status}</p>
    </div>
  );
};

export default AdminNewPost;
