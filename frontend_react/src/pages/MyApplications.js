import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/applications/", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

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
          <h1>📋 My Applications</h1>
          <p>Track all your job applications in one place</p>
        </div>

        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h3>All Applications ({applications.length})</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('all')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                All
              </button>
              <button 
                className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('pending')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Pending
              </button>
              <button 
                className={`btn ${filter === 'hired' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('hired')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Hired
              </button>
              <button 
                className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('rejected')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Rejected
              </button>
            </div>
          </div>

          {filteredApps.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredApps.map(app => (
                <div 
                  key={app.id} 
                  className="list-item"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{app.job_title}</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      {app.resume_snapshot && (
                        <p style={{ fontSize: '13px', color: '#10b981', marginBottom: '8px' }}>
                          📄 Resume: {app.resume_snapshot.split('/').pop()}
                        </p>
                      )}
                      <span className={`status-badge ${app.status}`}>{app.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {app.resume_snapshot && (
                        <a 
                          href={app.resume_snapshot} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-success"
                          style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none' }}
                        >
                          👁️ View Resume
                        </a>
                      )}
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                        onClick={() => setSelectedApp(app)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No applications found</p>
          )}
        </div>

        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
              <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>{selectedApp.job_title}</h2>
              
              <div style={{ lineHeight: '1.8' }}>
                <p style={{ marginBottom: '16px' }}>
                  <strong>Status:</strong> <span className={`status-badge ${selectedApp.status}`}>{selectedApp.status}</span>
                </p>
                <p style={{ marginBottom: '16px' }}>
                  <strong>Applied on:</strong> {new Date(selectedApp.applied_at).toLocaleDateString()}
                </p>
                
                {selectedApp.resume_snapshot && (
                  <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '8px' }}><strong>📄 Submitted Resume:</strong></p>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                      {selectedApp.resume_snapshot.split('/').pop()}
                    </p>
                    <a 
                      href={selectedApp.resume_snapshot} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-success"
                      style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}
                    >
                      👁️ View Resume
                    </a>
                  </div>
                )}
                
                {selectedApp.job_details && (
                  <>
                    <p style={{ marginTop: '24px', marginBottom: '8px' }}><strong>Job Description:</strong></p>
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>{selectedApp.job_details.description}</p>
                    
                    <p style={{ marginBottom: '8px' }}><strong>Requirements:</strong></p>
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>{selectedApp.job_details.requirements || "Not specified"}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                      <div>
                        <p><strong>💰 Salary:</strong></p>
                        <p style={{ color: '#64748b' }}>{selectedApp.job_details.salary || "Not specified"}</p>
                      </div>
                      <div>
                        <p><strong>📍 Type:</strong></p>
                        <p style={{ color: '#64748b' }}>{selectedApp.job_details.job_type}</p>
                      </div>
                      <div>
                        <p><strong>⏱️ Duration:</strong></p>
                        <p style={{ color: '#64748b' }}>{selectedApp.job_details.duration}</p>
                      </div>
                      <div>
                        <p><strong>👤 Recruiter:</strong></p>
                        <p style={{ color: '#64748b' }}>{selectedApp.job_details.recruiter_username}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
