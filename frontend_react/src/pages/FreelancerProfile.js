import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function FreelancerProfile() {
  const [profile, setProfile] = useState({ bio: "", education: "", skills: "", experience: "", resume: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/profile/", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/profile/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update profile");
      }
    } catch (e) {
      setMessage("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await apiCall("http://localhost:8000/api/auth/resume/", {
        method: "POST",
        body: formData,
        headers: {}
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, resume: data.resume });
        setMessage("Resume uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      setMessage("Error uploading resume");
    }
  };

  if (loading) return (
    <div className="app">
      <Sidebar role="freelancer" />
      <div className="main"><div className="loading-spinner">Loading...</div></div>
    </div>
  );

  return (
    <div className="app">
      <Sidebar role="freelancer" />
      <div className="main">
        <div className="page-header">
          <h1>👤 My Profile</h1>
          <p>Manage your professional information and resume</p>
        </div>

        {message && (
          <div className={message.includes('success') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <div className="section-card">
          <h3>📄 Resume</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              📤 Upload Resume
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
            </label>
            {profile.resume && (
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                👁️ View Resume
              </a>
            )}
            {!profile.resume && <p style={{ color: '#64748b' }}>No resume uploaded yet</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="section-card">
            <h3>ℹ️ Professional Information</h3>
            
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Education</label>
              <textarea
                className="form-textarea"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                placeholder="Your educational background..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills</label>
              <textarea
                className="form-textarea"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                placeholder="List your skills (e.g., JavaScript, Python, React...)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience</label>
              <textarea
                className="form-textarea"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                placeholder="Describe your work experience..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FreelancerProfile;
