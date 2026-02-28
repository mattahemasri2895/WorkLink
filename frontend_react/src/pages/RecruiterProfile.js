import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";
import "./BrowseJobs.css"; // reuse card/button styles
import "./FreelancerProfile.css"; // form layout & alerts

function RecruiterProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ company: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "recruiter") {
      window.location.href = "/";
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/recruiter/profile/", {
        method: "GET",
      });
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setProfile(data);
          setFormData(data);
        } else {
          setIsEditing(true);
        }
      }
    } catch (err) {
      setError("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await apiCall("http://localhost:8000/api/auth/recruiter/profile/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setIsEditing(false);
        setSuccess("Profile saved successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to save profile");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <Sidebar role="recruiter" />

      <div className="main">
        <div className="card profile-card">
          <h2>Recruiter Profile</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="results-info">{success}</div>}

          {(!profile || isEditing) ? (
            <form className="profile-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
              <button className="submit-btn" type="submit">Save Profile</button>
            </form>
          ) : (
            <div className="profile-view">
              <p><strong>Company:</strong> {profile.company || "—"}</p>
              <p><strong>Description:</strong> {profile.description || "—"}</p>
              <button className="submit-btn" onClick={() => setIsEditing(true)}>Edit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterProfile;
