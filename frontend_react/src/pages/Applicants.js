import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function Applicants() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [slots, setSlots] = useState([{ scheduled_date: '', duration_minutes: 30, meeting_link: '', notes: '' }]);
  const [offerData, setOfferData] = useState({ offer_message: '', offer_letter: null });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/recruiter/applications/", { method: "GET" });
      if (res.ok) {
        setApplications(await res.json());
      }
    } catch (e) {
      console.error("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status, action) => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/recruiter/application/${appId}/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, action })
      });

      if (res.ok) {
        setSelectedApp(null);
        fetchApplications();
        alert(`Application ${action || status}!`);
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const sendInterviewSlots = async () => {
    const validSlots = slots.filter(s => s.scheduled_date);
    if (validSlots.length === 0) {
      alert("Please add at least one interview slot");
      return;
    }

    try {
      const res = await apiCall(`http://localhost:8000/api/auth/recruiter/application/${selectedApp.id}/schedule-interview/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: validSlots })
      });

      if (res.ok) {
        setShowSlotModal(false);
        setSlots([{ scheduled_date: '', duration_minutes: 30, meeting_link: '', notes: '' }]);
        fetchApplications();
        alert("Interview slots sent successfully!");
      }
    } catch (e) {
      alert("Error sending interview slots");
    }
  };

  const sendOfferLetter = async () => {
    try {
      const formData = new FormData();
      formData.append('offer_message', offerData.offer_message);
      if (offerData.offer_letter) {
        formData.append('offer_letter', offerData.offer_letter);
      }

      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/api/auth/recruiter/application/${selectedApp.id}/send-offer/`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setShowOfferModal(false);
        setOfferData({ offer_message: '', offer_letter: null });
        fetchApplications();
        alert("Offer letter sent successfully!");
      }
    } catch (e) {
      alert("Error sending offer letter");
    }
  };

  const addSlot = () => {
    setSlots([...slots, { scheduled_date: '', duration_minutes: 30, meeting_link: '', notes: '' }]);
  };

  const updateSlot = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(app => app.status === filter);

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
                  alignItems: 'center'
                }} onClick={() => setSelectedApp(app)}>
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
                      fontWeight: 'bold'
                    }}>
                      {app.freelancer.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{app.freelancer}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>{app.job}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${app.status}`}>{app.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No applicants found</p>
          )}
        </div>

        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
              <h2 style={{ marginBottom: '24px' }}>👤 {selectedApp.freelancer}</h2>
              
              <div>
                <p style={{ marginBottom: '16px' }}><strong>Job:</strong> {selectedApp.job}</p>
                <p style={{ marginBottom: '16px' }}><strong>Status:</strong> <span className={`status-badge ${selectedApp.status}`}>{selectedApp.status.replace('_', ' ')}</span></p>
                
                {selectedApp.bio && <><p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Bio:</strong></p><p style={{ color: '#64748b' }}>{selectedApp.bio}</p></>}
                {selectedApp.education && <><p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Education:</strong></p><p style={{ color: '#64748b' }}>{selectedApp.education}</p></>}
                {selectedApp.skills && <><p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Skills:</strong></p><p style={{ color: '#64748b' }}>{selectedApp.skills}</p></>}
                {selectedApp.experience && <><p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Experience:</strong></p><p style={{ color: '#64748b' }}>{selectedApp.experience}</p></>}
                
                {(selectedApp.resume_snapshot || selectedApp.resume) && (
                  <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '12px' }}><strong>📄 Resume:</strong></p>
                    <a 
                      href={`http://localhost:8000${selectedApp.resume_snapshot || selectedApp.resume}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      👁️ View Resume
                    </a>
                  </div>
                )}
                
                {selectedApp.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button className="btn btn-success" onClick={() => { setShowSlotModal(true); }}>✅ Accept & Send Interview Slots</button>
                    <button className="btn btn-danger" onClick={() => updateStatus(selectedApp.id, 'rejected', 'reject')}>❌ Reject</button>
                  </div>
                )}
                
                {selectedApp.status === 'interview_completed' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button className="btn btn-success" onClick={() => updateStatus(selectedApp.id, 'selected', 'select')}>✅ Selected</button>
                    <button className="btn btn-danger" onClick={() => updateStatus(selectedApp.id, 'interview_rejected', 'interview_reject')}>❌ Rejected</button>
                  </div>
                )}
                
                {selectedApp.status === 'selected' && (
                  <div style={{ marginTop: '32px' }}>
                    <button className="btn btn-primary" onClick={() => setShowOfferModal(true)}>📧 Send Offer Letter</button>
                  </div>
                )}
                
                {(selectedApp.status === 'rejected' || selectedApp.status === 'interview_rejected' || selectedApp.status === 'hired') && (
                  <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontWeight: '600' }}>
                      This application is {selectedApp.status.replace('_', ' ')}. Process completed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showSlotModal && (
          <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
              <button className="close-btn" onClick={() => setShowSlotModal(false)}>✕</button>
              <h2 style={{ marginBottom: '24px' }}>📅 Send Interview Slots</h2>
              
              {slots.map((slot, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4>Slot {index + 1}</h4>
                    {slots.length > 1 && <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => removeSlot(index)}>Remove</button>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date & Time</label>
                    <input type="datetime-local" className="form-input" value={slot.scheduled_date} onChange={(e) => updateSlot(index, 'scheduled_date', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input type="number" className="form-input" value={slot.duration_minutes} onChange={(e) => updateSlot(index, 'duration_minutes', parseInt(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meeting Link</label>
                    <input type="url" className="form-input" placeholder="https://meet.google.com/..." value={slot.meeting_link} onChange={(e) => updateSlot(index, 'meeting_link', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" rows="2" value={slot.notes} onChange={(e) => updateSlot(index, 'notes', e.target.value)} />
                  </div>
                </div>
              ))}
              
              <button className="btn btn-secondary" onClick={addSlot} style={{ marginBottom: '20px', width: '100%' }}>+ Add Another Slot</button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={sendInterviewSlots} style={{ flex: 1 }}>📤 Send Slots</button>
                <button className="btn btn-secondary" onClick={() => setShowSlotModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showOfferModal && (
          <div className="modal-overlay" onClick={() => setShowOfferModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <button className="close-btn" onClick={() => setShowOfferModal(false)}>✕</button>
              <h2 style={{ marginBottom: '24px' }}>📧 Send Offer Letter</h2>
              
              <div className="form-group">
                <label className="form-label">Offer Message</label>
                <textarea className="form-textarea" rows="5" placeholder="Congratulations! We are pleased to offer you..." value={offerData.offer_message} onChange={(e) => setOfferData({ ...offerData, offer_message: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Offer Letter (PDF)</label>
                <input type="file" className="form-input" accept=".pdf" onChange={(e) => setOfferData({ ...offerData, offer_letter: e.target.files[0] })} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={sendOfferLetter} style={{ flex: 1 }}>📤 Send Offer</button>
                <button className="btn btn-secondary" onClick={() => setShowOfferModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Applicants;
