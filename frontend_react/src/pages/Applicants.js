import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

const BASE = "http://localhost:8000/api/auth";

function Applicants() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [slots, setSlots] = useState([{ scheduled_date: "", duration_minutes: 30, meeting_link: "", notes: "" }]);
  const [offerData, setOfferData] = useState({ offer_message: "", offer_letter: null });
  const navigate = useNavigate();

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiCall(`${BASE}/recruiter/applications/`, { method: "GET" });
      if (res.ok) setApplications(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status, action) => {
    try {
      const res = await apiCall(`${BASE}/recruiter/application/${appId}/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, action }),
      });
      if (res.ok) {
        setSelectedApp(null);
        fetchApplications();
      } else {
        alert("Error updating status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const sendInterviewSlots = async () => {
    const validSlots = slots.filter((s) => s.scheduled_date);
    if (validSlots.length === 0) { alert("Please add at least one interview slot with a date."); return; }
    try {
      const res = await apiCall(`${BASE}/recruiter/application/${selectedApp.id}/schedule-interview/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: validSlots }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowSlotModal(false);
        setSlots([{ scheduled_date: "", duration_minutes: 30, meeting_link: "", notes: "" }]);
        setSelectedApp(null);
        fetchApplications();
        alert(`✅ ${data.message}`);
      } else {
        const err = await res.json();
        alert(err.error || "Error sending slots");
      }
    } catch (e) {
      alert("Error sending interview slots");
    }
  };

  const sendOfferLetter = async () => {
    try {
      const formData = new FormData();
      formData.append("offer_message", offerData.offer_message);
      if (offerData.offer_letter) formData.append("offer_letter", offerData.offer_letter);
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const res = await fetch(`${BASE}/recruiter/application/${selectedApp.id}/send-offer/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setShowOfferModal(false);
        setOfferData({ offer_message: "", offer_letter: null });
        setSelectedApp(null);
        fetchApplications();
        alert("📧 Offer letter sent successfully!");
      }
    } catch (e) {
      alert("Error sending offer letter");
    }
  };

  const openChat = (app) => {
    // Navigate to messages — pass freelancer info via state
    navigate("/messages", { state: { openPartnerId: app.freelancer_id, openPartnerUsername: app.freelancer } });
  };

  const addSlot = () => setSlots([...slots, { scheduled_date: "", duration_minutes: 30, meeting_link: "", notes: "" }]);
  const updateSlot = (i, field, val) => { const s = [...slots]; s[i][field] = val; setSlots(s); };
  const removeSlot = (i) => setSlots(slots.filter((_, idx) => idx !== i));

  const filteredApps = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const statusColors = {
    pending: { bg: "#fef3c7", color: "#92400e" },
    accepted: { bg: "#d1fae5", color: "#065f46" },
    interview_scheduled: { bg: "#dbeafe", color: "#1e40af" },
    interview_completed: { bg: "#e0e7ff", color: "#3730a3" },
    selected: { bg: "#d1fae5", color: "#065f46" },
    offer_sent: { bg: "#dbeafe", color: "#1e40af" },
    hired: { bg: "#d1fae5", color: "#065f46" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
    interview_rejected: { bg: "#fee2e2", color: "#991b1b" },
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
          <h1>👥 Applicants</h1>
          <p>Review and manage job applications</p>
        </div>

        <div className="section-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <h3>All Applicants ({applications.length})</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["all", "pending", "accepted", "interview_scheduled", "selected", "offer_sent", "hired", "rejected"].map((s) => (
                <button key={s} className={`btn ${filter === s ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setFilter(s)} style={{ padding: "6px 12px", fontSize: "13px" }}>
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredApps.map((app) => {
                const sc = statusColors[app.status] || { bg: "#f1f5f9", color: "#475569" };
                return (
                  <div key={app.id} style={{
                    padding: "16px", border: "1px solid #e2e8f0", borderRadius: "10px",
                    background: "white", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "17px", fontWeight: "bold", flexShrink: 0
                      }}>
                        {app.freelancer.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "15px", marginBottom: "3px" }}>{app.freelancer}</h4>
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>{app.job}</p>
                        <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: sc.bg, color: sc.color }}>
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-secondary" style={{ padding: "7px 14px", fontSize: "13px" }}
                        onClick={() => openChat(app)}>
                        💬 Chat
                      </button>
                      <button className="btn btn-primary" style={{ padding: "7px 14px", fontSize: "13px" }}
                        onClick={() => setSelectedApp(app)}>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">No applicants found</p>
          )}
        </div>

        {/* Applicant Detail Modal */}
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>👤 {selectedApp.freelancer}</h2>
                <button className="btn btn-secondary" style={{ padding: "7px 14px", fontSize: "13px" }}
                  onClick={() => { setSelectedApp(null); openChat(selectedApp); }}>
                  💬 Chat
                </button>
              </div>

              <p><strong>Job:</strong> {selectedApp.job}</p>
              <p><strong>Status:</strong> <span style={{
                padding: "3px 10px", borderRadius: "12px", fontSize: "13px",
                background: (statusColors[selectedApp.status] || {}).bg || "#f1f5f9",
                color: (statusColors[selectedApp.status] || {}).color || "#475569"
              }}>{selectedApp.status.replace(/_/g, " ")}</span></p>

              {selectedApp.bio && <><p style={{ marginTop: "16px" }}><strong>Bio:</strong></p><p style={{ color: "#64748b" }}>{selectedApp.bio}</p></>}
              {selectedApp.skills && <><p style={{ marginTop: "12px" }}><strong>Skills:</strong></p><p style={{ color: "#64748b" }}>{selectedApp.skills}</p></>}
              {selectedApp.experience && <><p style={{ marginTop: "12px" }}><strong>Experience:</strong></p><p style={{ color: "#64748b" }}>{selectedApp.experience}</p></>}
              {selectedApp.education && <><p style={{ marginTop: "12px" }}><strong>Education:</strong></p><p style={{ color: "#64748b" }}>{selectedApp.education}</p></>}

              {(selectedApp.resume_snapshot || selectedApp.resume) && (
                <div style={{ marginTop: "20px", padding: "14px", background: "#f8fafc", borderRadius: "8px" }}>
                  <p style={{ marginBottom: "10px" }}><strong>📄 Resume:</strong></p>
                  <a href={`http://localhost:8000${selectedApp.resume_snapshot || selectedApp.resume}`}
                    target="_blank" rel="noopener noreferrer" className="btn btn-primary"
                    style={{ textDecoration: "none", display: "inline-block" }}>
                    👁️ View Resume
                  </a>
                </div>
              )}

              <div style={{ marginTop: "28px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {selectedApp.status === "pending" && (
                  <>
                    <button className="btn btn-success" onClick={() => { setShowSlotModal(true); }}>
                      ✅ Accept & Send Interview Slots
                    </button>
                    <button className="btn btn-danger" onClick={() => updateStatus(selectedApp.id, "rejected", "reject")}>
                      ❌ Reject
                    </button>
                  </>
                )}
                {selectedApp.status === "interview_completed" && (
                  <>
                    <button className="btn btn-success" onClick={() => updateStatus(selectedApp.id, "selected", "select")}>
                      🌟 Mark Selected
                    </button>
                    <button className="btn btn-danger" onClick={() => updateStatus(selectedApp.id, "interview_rejected", "interview_reject")}>
                      ❌ Not Selected
                    </button>
                  </>
                )}
                {selectedApp.status === "selected" && (
                  <button className="btn btn-primary" onClick={() => setShowOfferModal(true)}>
                    📧 Send Offer Letter
                  </button>
                )}
                {["rejected", "interview_rejected", "hired"].includes(selectedApp.status) && (
                  <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", width: "100%", textAlign: "center" }}>
                    <p style={{ color: "#64748b", fontWeight: "600", margin: 0 }}>
                      Process completed — {selectedApp.status.replace(/_/g, " ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interview Slots Modal */}
        {showSlotModal && (
          <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
              <button className="close-btn" onClick={() => setShowSlotModal(false)}>✕</button>
              <h2 style={{ marginBottom: "6px" }}>📅 Send Interview Slots</h2>
              <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "14px" }}>
                Add one or more time slots. The freelancer will pick their preferred slot.
              </p>

              {slots.map((slot, index) => (
                <div key={index} style={{ marginBottom: "16px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0 }}>Slot {index + 1}</h4>
                    {slots.length > 1 && (
                      <button className="btn btn-danger" style={{ padding: "3px 10px", fontSize: "12px" }} onClick={() => removeSlot(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input type="datetime-local" className="form-input" value={slot.scheduled_date}
                      onChange={(e) => updateSlot(index, "scheduled_date", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input type="number" className="form-input" value={slot.duration_minutes} min="15"
                      onChange={(e) => updateSlot(index, "duration_minutes", parseInt(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meeting Link</label>
                    <input type="url" className="form-input" placeholder="https://meet.google.com/..."
                      value={slot.meeting_link} onChange={(e) => updateSlot(index, "meeting_link", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" rows="2" value={slot.notes}
                      onChange={(e) => updateSlot(index, "notes", e.target.value)} />
                  </div>
                </div>
              ))}

              <button className="btn btn-secondary" onClick={addSlot} style={{ width: "100%", marginBottom: "16px" }}>
                + Add Another Slot
              </button>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn btn-primary" onClick={sendInterviewSlots} style={{ flex: 1 }}>📤 Send Slots to Freelancer</button>
                <button className="btn btn-secondary" onClick={() => setShowSlotModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Offer Letter Modal */}
        {showOfferModal && (
          <div className="modal-overlay" onClick={() => setShowOfferModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <button className="close-btn" onClick={() => setShowOfferModal(false)}>✕</button>
              <h2 style={{ marginBottom: "20px" }}>📧 Send Offer Letter</h2>
              <div className="form-group">
                <label className="form-label">Offer Message</label>
                <textarea className="form-textarea" rows="5" placeholder="Congratulations! We are pleased to offer you..."
                  value={offerData.offer_message} onChange={(e) => setOfferData({ ...offerData, offer_message: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Offer Letter (PDF, optional)</label>
                <input type="file" className="form-input" accept=".pdf"
                  onChange={(e) => setOfferData({ ...offerData, offer_letter: e.target.files[0] })} />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
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
