import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please login.");
        navigate("/");
      } else {
        setError(data.username?.[0] || data.email?.[0] || "Registration failed");
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
              <span className="feature-icon">👥</span>
              <div>
                <h3>Join Thousands</h3>
                <p>Be part of our growing community</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <div>
                <h3>Secure Platform</h3>
                <p>Your data is safe with us</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <div>
                <h3>Quick Setup</h3>
                <p>Get started in less than 2 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join WorkLink today</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label>I am a</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="freelancer">Freelancer</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <a href="/">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
