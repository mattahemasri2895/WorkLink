import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/applications/", { method: "GET" });
      if (res.ok) {
        setApplications(await res.json());
      }
    } catch (e) {
      console.error("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (appId) => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/freelancer/application/${appId}/slots/`, { method: "GET" });
      if (res.ok) {
        setSlots(await res.json());
        setShowSlotModal(true);
      }
    } catch (e) {
      alert("Error fetching interview slots");
    }
  };

  const selectSlot = async (slotId) => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/freelancer/slot/${slotId}/select/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setShowSlotModal(false);
        fetchApplications();
        alert("Interview slot confirmed! You will receive a confirmation message.");
      }
    } catch (e) {
      alert("Error selecting slot");
    }
  };

  const acceptOffer = async (appId) => {
    if (!window.confirm("Are you sure you want to accept this offer?")) return;
    
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/freelancer/application/${appId}/accept-offer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        fetchApplications();
        alert("Congratulations! You have accepted the offer.");
      }
    } catch (e) {
      alert("Error accepting offer");
    }
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(app => app.status === filter);

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
          <p>Track all your job applications</p>
        </div>

        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h3>All Applications ({applications.length})</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'pending', 'accepted', 'interview_scheduled', 'interview_completed', 'selected', 'offer_sent', 'hired', 'rejected'].map(status => (
                <button 
                  key={status}
                  className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(status)}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredApps.map(app => (
                <div key={app.id} className="list-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{app.job_title}</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      <span className={`status-badge ${app.status}`}>{app.status.replace('_', ' ')}</span>
                      
                      {app.status === 'accepted' && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#d1fae5', borderRadius: '8px' }}>
                          <p style={{ color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                            🎉 You have been selected for the interview round!
                          </p>
                          <button className="btn btn-success" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => fetchSlots(app.id)}>
                            📅 Select Interview Slot
                          </button>
                        </div>
                      )}
                      
                      {app.status === 'offer_sent' && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#dbeafe', borderRadius: '8px' }}>
                          <p style={{ color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                            🎊 Congratulations! You have received a job offer!
                          </p>
                          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setSelectedApp(app)}>
                            📄 View Offer Letter
                          </button>
                        </div>
                      )}
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setSelectedApp(app)}>
                      View Details
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
              <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>{selectedApp.job_title}</h2>
              
              <div style={{ lineHeight: '1.8' }}>
                <p style={{ marginBottom: '16px' }}>
                  <strong>Status:</strong> <span className={`status-badge ${selectedApp.status}`}>{selectedApp.status.replace('_', ' ')}</span>
                </p>
                <p style={{ marginBottom: '16px' }}>
                  <strong>Applied on:</strong> {new Date(selectedApp.applied_at).toLocaleDateString()}
                </p>
                
                {/* Workflow Status Messages */}
                {selectedApp.status === 'pending' && (
                  <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: '#92400e', fontWeight: '600' }}>⏳ Your application is under review.</p>
                  </div>
                )}
                
                {selectedApp.status === 'accepted' && (
                  <div style={{ padding: '16px', background: '#d1fae5', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: '#065f46', fontWeight: '600', marginBottom: '12px' }}>
                      🎉 Congratulations! You have been selected for the interview round.
                    </p>
                    <button className="btn btn-success" onClick={() => fetchSlots(selectedApp.id)}>
                      📅 Select Interview Slot
                    </button>
                  </div>
                )}
                
                {selectedApp.status === 'interview_scheduled' && (
                  <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: '#1e40af', fontWeight: '600' }}>📅 Your interview has been scheduled. Check your messages for details.</p>
                  </div>
                )}
                
                {selectedApp.status === 'selected' && (
                  <div style={{ padding: '16px', background: '#d1fae5', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: '#065f46', fontWeight: '600' }}>🎊 Congratulations! You are selected for the job. Offer letter will be shared soon.</p>
                  </div>
                )}
                
                {selectedApp.status === 'offer_sent' && (
                  <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: '#1e40af', fontWeight: '600', marginBottom: '12px' }}>
                      📧 You have received a job offer!
                    </p>
                    {selectedApp.offer_message && (
                      <p style={{ marginBottom: '12px', color: '#1e293b' }}>{selectedApp.offer_message}</p>
                    )}
                    {selectedApp.offer_letter && (
                      <a 
                        href={`http://localhost:8000${selectedApp.offer_letter}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ textDecoration: 'none', display: 'inline-block', marginRight: '12px' }}
                      >
                        📄 View Offer Letter
                      </a>
                    )}
                    <button className="btn btn-success" onClick={() => acceptOffer(selectedApp.id)}>
                      ✅ Accept Offer
                    </button>
                  </div>
                )}
                
                {selectedApp.status === 'hired' && (
                  <div style={{ padding: '16px', background: '#d1fae5', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: '#065f46', fontWeight: '600' }}>🎉 Congratulations! You are hired!</p>
                  </div>
                )}
                
                {(selectedApp.status === 'rejected' || selectedApp.status === 'interview_rejected') && (
                  <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: '#991b1b', fontWeight: '600' }}>❌ Unfortunately, your application was not selected.</p>
                  </div>
                )}
                
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

        {showSlotModal && (
          <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <button className="close-btn" onClick={() => setShowSlotModal(false)}>✕</button>
              <h2 style={{ marginBottom: '24px' }}>📅 Select Interview Slot</h2>
              
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                Please select your preferred interview slot from the options below:
              </p>
              
              {slots.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {slots.map(slot => (
                    <div key={slot.id} style={{
                      padding: '16px',
                      border: slot.is_selected ? '2px solid #10b981' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: slot.is_selected ? '#d1fae5' : 'white',
                      cursor: slot.is_selected ? 'default' : 'pointer'
                    }} onClick={() => !slot.is_selected && selectSlot(slot.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontWeight: '600', marginBottom: '8px' }}>
                            📅 {new Date(slot.scheduled_date).toLocaleString()}
                          </p>
                          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                            ⏱️ Duration: {slot.duration_minutes} minutes
                          </p>
                          {slot.meeting_link && (
                            <p style={{ fontSize: '14px', color: '#2563eb', marginBottom: '4px' }}>
                              🔗 Meeting Link Available
                            </p>
                          )}
                          {slot.notes && (
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                              📝 {slot.notes}
                            </p>
                          )}
                        </div>
                        {slot.is_selected && (
                          <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No interview slots available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
