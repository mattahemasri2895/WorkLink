import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { apiCall } from "../utils/apiClient";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function FreelancerDashboard() {
  const [stats, setStats] = useState({ total_applications: 0, accepted: 0, rejected: 0, pending: 0, profile_completion: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeUrl, setResumeUrl] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appsRes, wishRes, profileRes] = await Promise.all([
        apiCall("http://localhost:8000/api/auth/freelancer/stats/", { method: "GET" }),
        apiCall("http://localhost:8000/api/auth/freelancer/applications/", { method: "GET" }),
        apiCall("http://localhost:8000/api/auth/wishlist/", { method: "GET" }),
        apiCall("http://localhost:8000/api/auth/freelancer/profile/", { method: "GET" })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (appsRes.ok) setRecentApps(await appsRes.json());
      if (wishRes.ok) setWishlist(await wishRes.json());
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile.resume) setResumeUrl(profile.resume);
      }
    } catch (e) {
      console.error("Error loading dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (jobId) => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/wishlist/${jobId}/`, { method: "DELETE" });
      if (res.ok) setWishlist(wishlist.filter(w => w.job !== jobId));
    } catch (e) {
      alert("Failed to remove from wishlist");
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
        setResumeUrl(data.resume);
        alert("Resume uploaded successfully!");
        fetchData();
      } else {
        alert("Failed to upload resume");
      }
    } catch (e) {
      alert("Error uploading resume");
    }
  };

  if (loading) return (
    <div className="app">
      <Sidebar role="freelancer" />
      <div className="main"><div className="loading-spinner">Loading...</div></div>
    </div>
  );

  const barData = {
    labels: ['Applied', 'Accepted', 'Rejected', 'Pending'],
    datasets: [{
      label: 'Applications',
      data: [stats.total_applications, stats.accepted, stats.rejected, stats.pending],
      backgroundColor: ['#2563eb', '#10b981', '#ef4444', '#f59e0b'],
      borderRadius: 8,
    }]
  };

  const pieData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [stats.profile_completion, 100 - stats.profile_completion],
      backgroundColor: ['#10b981', '#e5e7eb'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="app">
      <Sidebar role="freelancer" />
      <div className="main">
        <div className="page-header">
          <h1>📊 Freelancer Dashboard</h1>
          <p>Track your applications, manage your profile, and explore opportunities</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.total_applications}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.accepted}</h3>
              <p>Accepted</p>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>{stats.profile_completion}%</h3>
              <p>Profile Complete</p>
            </div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>📈 Application Statistics</h3>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="chart-card">
            <h3>📊 Profile Completion</h3>
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: true }} />
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.profile_completion}%
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3>📄 Resume Management</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              📤 Upload Resume
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
            </label>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                👁️ View Resume
              </a>
            )}
            {!resumeUrl && <p style={{ color: '#64748b' }}>No resume uploaded yet</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="section-card">
            <h3>📝 Recent Applications</h3>
            {recentApps.length > 0 ? (
              <div>
                {recentApps.slice(0, 5).map(app => (
                  <div key={app.id} className="list-item" onClick={() => setSelectedJob(app.job_details)}>
                    <h4>{app.job_title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span className={`status-badge ${app.status}`}>{app.status}</span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="empty-state">No applications yet</p>}
          </div>

          <div className="section-card">
            <h3>⭐ Job Wishlist</h3>
            {wishlist.length > 0 ? (
              <div>
                {wishlist.map(w => (
                  <div key={w.id} className="list-item">
                    <div onClick={() => w.job_details && setSelectedJob(w.job_details)}>
                      <h4>{w.job_details?.title || 'Job'}</h4>
                      <p>{w.job_details?.salary || 'Salary not specified'}</p>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      style={{ marginTop: '8px', padding: '6px 12px', fontSize: '13px' }}
                      onClick={(e) => { e.stopPropagation(); removeFromWishlist(w.job); }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : <p className="empty-state">No saved jobs</p>}
          </div>
        </div>

        {selectedJob && (
          <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedJob(null)}>✕</button>
              <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>{selectedJob.title}</h2>
              <div style={{ lineHeight: '1.8' }}>
                <p style={{ marginBottom: '16px' }}><strong>Description:</strong></p>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>{selectedJob.description}</p>
                
                <p style={{ marginBottom: '16px' }}><strong>Requirements:</strong></p>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>{selectedJob.requirements || "Not specified"}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                  <div>
                    <p><strong>💰 Salary:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedJob.salary || "Not specified"}</p>
                  </div>
                  <div>
                    <p><strong>📍 Type:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedJob.job_type}</p>
                  </div>
                  <div>
                    <p><strong>⏱️ Duration:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedJob.duration}</p>
                  </div>
                  <div>
                    <p><strong>👤 Recruiter:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedJob.recruiter_username}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FreelancerDashboard;
