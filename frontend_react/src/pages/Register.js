import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "freelancer",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        form
      );
      alert("Registration successful");
      window.location.href = "/";
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Join WorkLink</h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "15px" }}>
          Create your account to connect with top talent or discover exciting freelance opportunities.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            placeholder="Username"
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <input
            className="auth-input"
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <select
            className="auth-input"
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="freelancer">Freelancer</option>
            <option value="recruiter">Recruiter</option>
          </select>

          <button className="auth-button" type="submit">
            Register
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
