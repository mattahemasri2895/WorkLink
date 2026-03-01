import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../utils/apiClient";
import "./Auth.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);

        if (data.role === "freelancer") {
          navigate("/freelancer/dashboard");
        } else {
          navigate("/recruiter/dashboard");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-branding">
          <h1>💼 WorkLink</h1>
          <p className="tagline">Connect Talent with Opportunity</p>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">🚀</span>
              <div>
                <h3>Fast Hiring</h3>
                <p>Connect with top talent in minutes</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">💡</span>
              <div>
                <h3>Smart Matching</h3>
                <p>AI-powered job recommendations</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <div>
                <h3>Career Growth</h3>
                <p>Find opportunities that match your skills</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to WorkLink</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <a href="/register">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
