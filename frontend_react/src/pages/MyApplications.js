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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3>All Applications ({applications.length})</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`btn ${filter === 'hired' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('hired')}
              >
                Hired
              </button>
              <button 
                className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('rejected')}
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
                  onClick={() => setSelectedApp(app)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{app.job_title}</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      <span className={`status-badge ${app.status}`}>{app.status}</span>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
                      View Details →
                    </button>
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
