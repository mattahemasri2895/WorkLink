import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";
import "./FreelancerProfile.css";

function FreelancerProfile() {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bio: "",
    education: "",
    skills: "",
    experience: "",
    resume: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch profile on component mount
  useEffect(() => {
    console.log("=== PROFILE COMPONENT MOUNTED ===");
    console.log("Username:", username);
    console.log("Token:", token);
    
    if (!token) {
      setError("Not authenticated. Please login first.");
      setLoading(false);
      return;
    }
    
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log("=== FETCH PROFILE ===");
      
      const response = await apiCall("http://localhost:8000/api/auth/freelancer/profile/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response Status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Profile Data:", data);
        if (Object.keys(data).length > 0) {
          setProfile(data);
          setFormData(data);
        } else {
          setProfile(null);
          setIsEditing(true);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log("=== SAVE PROFILE ===");
    console.log("Form Data:", formData);

    try {
      // if there's a file to upload, use FormData
      let response;
      if (formData.resume instanceof File) {
        const fd = new FormData();
        for (const key of ["bio", "education", "skills", "experience"]) {
          if (formData[key] !== undefined) fd.append(key, formData[key]);
        }
        fd.append("resume", formData.resume);
        response = await apiCall("http://localhost:8000/api/auth/freelancer/profile/", {
          method: "POST",
          body: fd,
        });
      } else {
        // if resume key exists but isn't a File (e.g. existing URL), remove it so
        // we don't send a string to the API which would trigger validation errors
        const payload = { ...formData };
        if (payload.resume && !(payload.resume instanceof File)) {
          delete payload.resume;
        }
        response = await apiCall("http://localhost:8000/api/auth/freelancer/profile/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      console.log("Response Status:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("Response Data:", data);
      } catch (parseErr) {
        console.error("Failed to parse JSON:", parseErr);
        const text = await response.text();
        console.log("Response Text:", text);
        setError(`Server error (${response.status}): ${text}`);
        return;
      }

      if (response.ok) {
        setProfile(data);
        setIsEditing(false);
        setSuccess("Profile saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        let errorMsg = "Failed to save profile";
        
        if (data.errors || data.error) {
          errorMsg = typeof data.errors === "object" 
            ? Object.entries(data.errors).map(([key, val]) => 
                `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
              ).join(" | ")
            : (data.error || errorMsg);
        }
        
        console.error("Error Message:", errorMsg);
        setError(`Status ${response.status}: ${errorMsg}`);
      }
    } catch (err) {
      console.error("Network/Fetch Error:", err);
      setError("Network error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Sidebar role="freelancer" />
        <div className="main">
          <div className="card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar role="freelancer" />

      <div className="main">
        <div className="card profile-card">
          {!profile && !isEditing && (
            <div className="empty-state">
              <h3>No Profile Yet</h3>
              <p>Create your profile to start applying for jobs</p>
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Create Profile
              </button>
            </div>
          )}

          {isEditing && (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <h3>{profile ? "Edit Profile" : "Create Profile"}</h3>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Education</label>
                <textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="Your educational background..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="List your skills (comma-separated)..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Describe your work experience..."
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="resume">Resume (PDF/DOCX)</label>
                <input
                  type="file"
                  id="resume"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
                  }}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Profile
                </button>
                {profile && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {profile && !isEditing && (
            <div className="profile-view">
              <h3>Your Profile</h3>

              <div className="profile-section">
                <h4>Bio</h4>
                <p>{profile.bio}</p>
              </div>

              <div className="profile-section">
                <h4>Education</h4>
                <p>{profile.education}</p>
              </div>

              <div className="profile-section">
                <h4>Skills</h4>
                <p>{profile.skills}</p>
              </div>

              <div className="profile-section">
                <h4>Experience</h4>
                <p>{profile.experience}</p>
              </div>

              {profile.resume && (
                <div className="profile-section">
                  <h4>Resume</h4>
                  <a
                    href="http://localhost:8000/api/auth/freelancer/resume/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View / Download Resume
                  </a>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsEditing(true);
                  setFormData(profile);
                }}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FreelancerProfile;
