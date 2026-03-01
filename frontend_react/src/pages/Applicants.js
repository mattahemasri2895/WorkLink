import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function Applicants() {
  const [applications, setApplications] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/recruiter/applications/", { method: "GET" });
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

  const updateStatus = async (appId, status) => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/recruiter/application/${appId}/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setSelectedApplicant(null);
        fetchApplications();
        alert(`Application ${status}!`);
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

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
          <h1>👥 Applicants</h1>
          <p>Review and manage job applications</p>
        </div>

        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h3>All Applicants ({applications.length})</h3>
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
            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredApps.map(app => (
                <div key={app.id} style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }} onClick={() => setSelectedApplicant(app)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {app.freelancer.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '15px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.freelancer}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.job}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className={`status-badge ${app.status}`}>{app.status}</span>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedApplicant(app); }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No applicants found</p>
          )}
        </div>

        {selectedApplicant && (
          <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedApplicant(null)}>✕</button>
              <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>👤 {selectedApplicant.freelancer}</h2>
              
              <div style={{ lineHeight: '1.8' }}>
                <p style={{ marginBottom: '16px' }}><strong>Applied for:</strong> {selectedApplicant.job}</p>
                <p style={{ marginBottom: '16px' }}><strong>Status:</strong> <span className={`status-badge ${selectedApplicant.status}`}>{selectedApplicant.status}</span></p>
                
                {selectedApplicant.bio && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Bio:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.bio}</p>
                  </>
                )}
                
                {selectedApplicant.education && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Education:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.education}</p>
                  </>
                )}
                
                {selectedApplicant.skills && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Skills:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.skills}</p>
                  </>
                )}
                
                {selectedApplicant.experience && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Experience:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.experience}</p>
                  </>
                )}
                
                {(selectedApplicant.resume_snapshot || selectedApplicant.resume) && (
                  <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '12px' }}><strong>📄 Resume:</strong></p>
                    {selectedApplicant.resume_snapshot && (
                      <a 
                        href={selectedApplicant.resume_snapshot} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-success"
                        style={{ marginRight: '8px', textDecoration: 'none', display: 'inline-block' }}
                      >
                        👁️ View Application Resume
                      </a>
                    )}
                    {selectedApplicant.resume && (
                      <a 
                        href={selectedApplicant.resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                        👁️ View Current Resume
                      </a>
                    )}
                  </div>
                )}
                
                {selectedApplicant.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button 
                      className="btn btn-success"
                      onClick={() => updateStatus(selectedApplicant.id, 'hired')}
                    >
                      ✅ Hire
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => updateStatus(selectedApplicant.id, 'rejected')}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
                
                {(selectedApplicant.status === 'hired' || selectedApplicant.status === 'rejected') && (
                  <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontWeight: '600' }}>
                      This application has been {selectedApplicant.status}. Status is permanent.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Applicants;
