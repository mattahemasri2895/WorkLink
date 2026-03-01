import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/jobs/", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      console.error("Error fetching jobs:", e);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/jobs/${jobId}/apply/`, {
        method: "POST"
      });

      if (res.ok) {
        alert("Application submitted successfully!");
        setSelectedJob(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to apply");
      }
    } catch (e) {
      alert("Error applying to job");
    }
  };

  const addToWishlist = async (jobId) => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/wishlist/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId })
      });

      if (res.ok) {
        alert("Added to wishlist!");
      }
    } catch (e) {
      alert("Error adding to wishlist");
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1>🔍 Browse Jobs</h1>
          <p>Discover opportunities that match your skills</p>
        </div>

        <div className="section-card">
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search jobs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <h3 style={{ marginBottom: '20px' }}>Available Jobs ({filteredJobs.length})</h3>

          {filteredJobs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {filteredJobs.map(job => (
                <div key={job.id} style={{
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: 'white',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }} onClick={() => setSelectedJob(job)}>
                  <h4 style={{ fontSize: '20px', marginBottom: '12px', color: '#2563eb' }}>{job.title}</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>
                    {job.description.substring(0, 120)}...
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                      {job.salary || "Salary not specified"}
                    </p>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No jobs found</p>
          )}
        </div>

        {selectedJob && (
          <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <button className="close-btn" onClick={() => setSelectedJob(null)}>✕</button>
              <h2 style={{ marginBottom: '24px', fontSize: '32px', color: '#2563eb' }}>{selectedJob.title}</h2>
              
              <div style={{ lineHeight: '1.8' }}>
                <div style={{ 
                  padding: '16px', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>💰 Salary</p>
                    <p style={{ fontWeight: '600', color: '#10b981' }}>{selectedJob.salary || "Not specified"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>📍 Type</p>
                    <p style={{ fontWeight: '600' }}>{selectedJob.job_type}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>⏱️ Duration</p>
                    <p style={{ fontWeight: '600' }}>{selectedJob.duration}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>👤 Recruiter</p>
                    <p style={{ fontWeight: '600' }}>{selectedJob.recruiter_username}</p>
                  </div>
                </div>
                
                <p style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>📝 Description</p>
                <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.8' }}>{selectedJob.description}</p>
                
                <p style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>✅ Requirements</p>
                <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.8' }}>{selectedJob.requirements || "Not specified"}</p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => applyToJob(selectedJob.id)}
                    style={{ flex: 1 }}
                  >
                    ✅ Apply Now
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => addToWishlist(selectedJob.id)}
                  >
                    ⭐ Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseJobs;
