import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        form
      );

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", form.username);

      if (res.data.role === "freelancer") {
        window.location.href = "/freelancer";
      } else {
        window.location.href = "/recruiter";
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to WorkLink</h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "15px" }}>
          Connect your skills with real opportunities.  
          Log in to continue your professional journey.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button className="auth-button" type="submit">
            Login
          </button>
        </form>

        <div className="auth-link">
          Don’t have an account?{" "}
          <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
