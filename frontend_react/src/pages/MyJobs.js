import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/jobs/", { method: "GET" });
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (e) {
      console.error("Error fetching jobs:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/recruiter/job/${jobId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchJobs();
        alert(`Job ${newStatus}!`);
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const startEdit = (job) => {
    setEditData({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      job_type: job.job_type,
      duration: job.duration
    });
    setSelectedJob(job);
    setEditMode(true);
  };

  const saveEdit = async () => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/recruiter/job/${selectedJob.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        fetchJobs();
        setEditMode(false);
        setSelectedJob(null);
        alert("Job updated!");
      } else {
        alert("Failed to update job");
      }
    } catch (e) {
      alert("Error updating job");
    }
  };

  if (loading) return (
    <div className="app">
      <Sidebar role="recruiter" />
      <div className="main"><div className="loading-spinner">Loading...</div></div>
    </div>
  );

  return (
    <div className="app">
      <Sidebar role="recruiter" />
      <div className="main">
        <div className="page-header">
          <h1>💼 My Jobs</h1>
          <p>Manage your job postings</p>
        </div>

        <div className="section-card">
          <h3 style={{ marginBottom: '20px' }}>Posted Jobs ({jobs.length})</h3>

          {jobs.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {jobs.map(job => (
                <div key={job.id} style={{
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '20px', marginBottom: '8px', color: '#2563eb' }}>{job.title}</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                        {job.description.substring(0, 150)}...
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <span className={`status-badge ${job.status}`}>{job.status}</span>
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '20px', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {job.job_type}
                        </span>
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#fef3c7', 
                          color: '#92400e', 
                          borderRadius: '20px', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {job.duration}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#64748b' }}>
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        className={`btn ${job.status === 'open' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleStatus(job.id, job.status)}
                        style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
                      >
                        {job.status === 'open' ? '🔒 Close' : '🔓 Open'}
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => startEdit(job)}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No jobs posted yet</p>
          )}
        </div>

        {editMode && selectedJob && (
          <div className="modal-overlay" onClick={() => { setEditMode(false); setSelectedJob(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <button className="close-btn" onClick={() => { setEditMode(false); setSelectedJob(null); }}>✕</button>
              <h2 style={{ marginBottom: '24px' }}>✏️ Edit Job</h2>
              
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements</label>
                <textarea
                  className="form-textarea"
                  value={editData.requirements}
                  onChange={(e) => setEditData({ ...editData, requirements: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salary</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.salary}
                  onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select
                  className="form-select"
                  value={editData.job_type}
                  onChange={(e) => setEditData({ ...editData, job_type: e.target.value })}
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <select
                  className="form-select"
                  value={editData.duration}
                  onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                >
                  <option value="short">Short-term</option>
                  <option value="medium">Medium-term</option>
                  <option value="long">Long-term</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={saveEdit} style={{ flex: 1 }}>
                  💾 Save Changes
                </button>
                <button className="btn btn-secondary" onClick={() => { setEditMode(false); setSelectedJob(null); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyJobs;
