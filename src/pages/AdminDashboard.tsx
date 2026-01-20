import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Post = {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  published: boolean;
};

const AdminDashboard = () => {
  const [adminToken, setAdminToken] = useState(
    sessionStorage.getItem("adminToken") || ""
  );
  const [inputToken, setInputToken] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adminToken) {
      return;
    }

    fetch("/api/admin/posts", {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then(setPosts)
      .catch(() => setError("Failed to load posts"));
  }, [adminToken]);

  if (!adminToken) {
    return (
      <div style={{ maxWidth: 400, margin: "6rem auto", textAlign: "center" }}>
        <h2>Admin Access</h2>
        <input
          type="password"
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

  return (
    <div style={{ maxWidth: 900, margin: "4rem auto", padding: "2rem" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: "2rem" }}>
        <Link to="/admin/new">Create New Post</Link>
      </div>

      {error && <p>{error}</p>}

      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: "1rem" }}>
            <strong>{post.title}</strong>{" "}
            {post.published ? "(published)" : "(draft)"}{" "}
            <Link to={`/admin/edit/${post.id}`}>Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
