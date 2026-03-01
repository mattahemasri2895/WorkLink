import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function FreelancerProfile() {
  const [profile, setProfile] = useState({ bio: "", education: "", skills: "", experience: "" });
  const [editProfile, setEditProfile] = useState({ bio: "", education: "", skills: "", experience: "" });
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/profile/", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        const profileData = {
          bio: data.bio || "",
          education: data.education || "",
          skills: data.skills || "",
          experience: data.experience || ""
        };
        setProfile(profileData);
        setEditProfile(profileData);
        if (data.resume) {
          const fullUrl = data.resume.startsWith('http') ? data.resume : `http://localhost:8000${data.resume}`;
          setResumeUrl(fullUrl);
        }
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
        body: JSON.stringify(editProfile)
      });

      if (res.ok) {
        setProfile(editProfile);
        setEditMode(false);
        setMessage("✓ Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage("Failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      setMessage("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch("http://localhost:8000/api/auth/resume/", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = data.resume.startsWith('http') ? data.resume : `http://localhost:8000${data.resume}`;
        setResumeUrl(fullUrl);
        setResumeFile(null);
        setMessage("✓ Resume uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await res.json();
        setMessage("Failed to upload resume: " + (errorData.error || "Unknown error"));
      }
    } catch (e) {
      setMessage("Error uploading resume: " + e.message);
    } finally {
      setUploading(false);
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
          <div className={message.includes('✓') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>ℹ️ Professional Information</h3>
            {!editMode && (
              <button 
                className="btn btn-primary" 
                onClick={() => setEditMode(true)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Resume</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleResumeChange}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button"
                    className="btn btn-primary" 
                    onClick={handleResumeUpload}
                    disabled={!resumeFile || uploading}
                  >
                    {uploading ? "Uploading..." : "📤 Upload"}
                  </button>
                </div>
                {resumeFile && (
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                    Selected: {resumeFile.name}
                  </p>
                )}
                {resumeUrl && (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <strong>Current Resume:</strong> {resumeUrl.split('/').pop()}
                    </p>
                    <a 
                      href={resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-success"
                      style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}
                    >
                      👁️ View Resume
                    </a>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Education</label>
                <textarea
                  className="form-textarea"
                  value={editProfile.education}
                  onChange={(e) => setEditProfile({ ...editProfile, education: e.target.value })}
                  placeholder="Your educational background..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills</label>
                <textarea
                  className="form-textarea"
                  value={editProfile.skills}
                  onChange={(e) => setEditProfile({ ...editProfile, skills: e.target.value })}
                  placeholder="List your skills (e.g., JavaScript, Python, React...)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience</label>
                <textarea
                  className="form-textarea"
                  value={editProfile.experience}
                  onChange={(e) => setEditProfile({ ...editProfile, experience: e.target.value })}
                  placeholder="Describe your work experience..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setEditProfile(profile);
                    setEditMode(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              {resumeUrl && (
                <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>📄 Resume:</p>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>{resumeUrl.split('/').pop()}</p>
                  <a 
                    href={resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-success"
                    style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}
                  >
                    👁️ View Resume
                  </a>
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Bio:</p>
                <p style={{ color: '#64748b' }}>{profile.bio || "Not provided"}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Education:</p>
                <p style={{ color: '#64748b' }}>{profile.education || "Not provided"}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Skills:</p>
                <p style={{ color: '#64748b' }}>{profile.skills || "Not provided"}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Experience:</p>
                <p style={{ color: '#64748b' }}>{profile.experience || "Not provided"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FreelancerProfile;
