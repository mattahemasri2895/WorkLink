import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

const BASE = "http://localhost:8000/api/auth";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotAppId, setSlotAppId] = useState(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiCall(`${BASE}/freelancer/applications/`, { method: "GET" });
      if (res.ok) setApplications(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openSlots = async (appId) => {
    setSlotsLoading(true);
    setSlotAppId(appId);
    setSlots([]);
    setShowSlotModal(true);
    try {
      const res = await apiCall(`${BASE}/freelancer/application/${appId}/slots/`, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      } else {
        alert("Failed to load interview slots.");
        setShowSlotModal(false);
      }
    } catch (e) {
      alert("Error fetching interview slots.");
      setShowSlotModal(false);
    } finally {
      setSlotsLoading(false);
    }
  };

  const selectSlot = async (slotId) => {
    try {
      const res = await apiCall(`${BASE}/freelancer/slot/${slotId}/select/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setShowSlotModal(false);
        setSelectedApp(null);
        fetchApplications();
        alert(`✅ Interview slot confirmed for ${data.slot_time}! The recruiter has been notified.`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to select slot.");
      }
    } catch (e) {
      alert("Error selecting slot.");
    }
  };

  const acceptOffer = async (appId) => {
    if (!window.confirm("Are you sure you want to accept this offer?")) return;
    try {
      const res = await apiCall(`${BASE}/freelancer/application/${appId}/accept-offer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        fetchApplications();
        setSelectedApp(null);
        alert("🎉 Congratulations! You have accepted the offer.");
      }
    } catch (e) {
      alert("Error accepting offer.");
    }
  };

  const filteredApps = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const statusColors = {
    pending: { bg: "#fef3c7", color: "#92400e", label: "⏳ Pending" },
    accepted: { bg: "#d1fae5", color: "#065f46", label: "✅ Accepted" },
    interview_scheduled: { bg: "#dbeafe", color: "#1e40af", label: "📅 Interview Scheduled" },
    interview_completed: { bg: "#e0e7ff", color: "#3730a3", label: "✔️ Interview Completed" },
    selected: { bg: "#d1fae5", color: "#065f46", label: "🌟 Selected" },
    offer_sent: { bg: "#dbeafe", color: "#1e40af", label: "📧 Offer Sent" },
    hired: { bg: "#d1fae5", color: "#065f46", label: "🎉 Hired" },
    rejected: { bg: "#fee2e2", color: "#991b1b", label: "❌ Rejected" },
    interview_rejected: { bg: "#fee2e2", color: "#991b1b", label: "❌ Not Selected" },
  };

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <h3>All Applications ({applications.length})</h3>
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
            <div style={{ display: "grid", gap: "16px" }}>
              {filteredApps.map((app) => {
                const sc = statusColors[app.status] || { bg: "#f1f5f9", color: "#475569", label: app.status };
                return (
                  <div key={app.id} className="list-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "18px", marginBottom: "6px" }}>{app.job_title}</h4>
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>
                          Applied on {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                        <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>

                        {app.status === "accepted" && (
                          <div style={{ marginTop: "14px", padding: "14px", background: "#d1fae5", borderRadius: "10px", border: "1px solid #6ee7b7" }}>
                            <p style={{ color: "#065f46", fontWeight: "600", marginBottom: "10px" }}>
                              🎉 You've been shortlisted! Please select an interview slot.
                            </p>
                            <button className="btn btn-success" onClick={() => openSlots(app.id)}>
                              📅 Select Interview Slot
                            </button>
                          </div>
                        )}

                        {app.status === "offer_sent" && (
                          <div style={{ marginTop: "14px", padding: "14px", background: "#dbeafe", borderRadius: "10px", border: "1px solid #93c5fd" }}>
                            <p style={{ color: "#1e40af", fontWeight: "600", marginBottom: "10px" }}>
                              🎊 You received a job offer!
                            </p>
                            <button className="btn btn-primary" onClick={() => setSelectedApp(app)}>
                              📄 View & Accept Offer
                            </button>
                          </div>
                        )}
                      </div>
                      <button className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "13px", whiteSpace: "nowrap" }}
                        onClick={() => setSelectedApp(app)}>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">No applications found</p>
          )}
        </div>

        {/* Detail Modal */}
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
              <h2 style={{ marginBottom: "20px" }}>{selectedApp.job_title}</h2>
              <div style={{ lineHeight: "1.8" }}>
                <p><strong>Status:</strong> <span style={{
                  padding: "3px 10px", borderRadius: "12px", fontSize: "13px",
                  background: (statusColors[selectedApp.status] || {}).bg || "#f1f5f9",
                  color: (statusColors[selectedApp.status] || {}).color || "#475569"
                }}>{(statusColors[selectedApp.status] || {}).label || selectedApp.status}</span></p>
                <p><strong>Applied on:</strong> {new Date(selectedApp.applied_at).toLocaleDateString()}</p>

                {selectedApp.status === "accepted" && (
                  <div style={{ padding: "16px", background: "#d1fae5", borderRadius: "8px", margin: "16px 0" }}>
                    <p style={{ color: "#065f46", fontWeight: "600", marginBottom: "12px" }}>
                      🎉 You've been shortlisted for the interview round!
                    </p>
                    <button className="btn btn-success" onClick={() => { setSelectedApp(null); openSlots(selectedApp.id); }}>
                      📅 Select Interview Slot
                    </button>
                  </div>
                )}

                {selectedApp.status === "interview_scheduled" && (
                  <div style={{ padding: "16px", background: "#dbeafe", borderRadius: "8px", margin: "16px 0" }}>
                    <p style={{ color: "#1e40af", fontWeight: "600" }}>📅 Your interview is scheduled. Check Messages for details.</p>
                  </div>
                )}

                {selectedApp.status === "offer_sent" && (
                  <div style={{ padding: "16px", background: "#dbeafe", borderRadius: "8px", margin: "16px 0" }}>
                    <p style={{ color: "#1e40af", fontWeight: "600", marginBottom: "12px" }}>📧 You have received a job offer!</p>
                    {selectedApp.offer_message && <p style={{ marginBottom: "12px" }}>{selectedApp.offer_message}</p>}
                    {selectedApp.offer_letter && (
                      <a href={`http://localhost:8000${selectedApp.offer_letter}`} target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary" style={{ textDecoration: "none", display: "inline-block", marginRight: "12px" }}>
                        📄 View Offer Letter
                      </a>
                    )}
                    <button className="btn btn-success" onClick={() => acceptOffer(selectedApp.id)}>✅ Accept Offer</button>
                  </div>
                )}

                {selectedApp.status === "hired" && (
                  <div style={{ padding: "16px", background: "#d1fae5", borderRadius: "8px", margin: "16px 0" }}>
                    <p style={{ color: "#065f46", fontWeight: "600" }}>🎉 Congratulations! You are hired!</p>
                  </div>
                )}

                {(selectedApp.status === "rejected" || selectedApp.status === "interview_rejected") && (
                  <div style={{ padding: "16px", background: "#fee2e2", borderRadius: "8px", margin: "16px 0" }}>
                    <p style={{ color: "#991b1b", fontWeight: "600" }}>❌ Unfortunately, your application was not selected.</p>
                  </div>
                )}

                {selectedApp.job_details && (
                  <>
                    <p style={{ marginTop: "20px" }}><strong>Description:</strong></p>
                    <p style={{ color: "#64748b" }}>{selectedApp.job_details.description}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                      <div><strong>💰 Salary:</strong><p style={{ color: "#64748b" }}>{selectedApp.job_details.salary || "N/A"}</p></div>
                      <div><strong>📍 Type:</strong><p style={{ color: "#64748b" }}>{selectedApp.job_details.job_type}</p></div>
                      <div><strong>⏱️ Duration:</strong><p style={{ color: "#64748b" }}>{selectedApp.job_details.duration}</p></div>
                      <div><strong>👤 Recruiter:</strong><p style={{ color: "#64748b" }}>{selectedApp.job_details.recruiter_username}</p></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slot Selection Modal */}
        {showSlotModal && (
          <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
              <button className="close-btn" onClick={() => setShowSlotModal(false)}>✕</button>
              <h2 style={{ marginBottom: "8px" }}>📅 Select Interview Slot</h2>
              <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "14px" }}>
                Choose your preferred interview time. The recruiter will be notified automatically.
              </p>

              {slotsLoading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
                  <p>Loading available slots...</p>
                </div>
              ) : slots.length > 0 ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  {slots.map((slot, idx) => (
                    <div key={slot.id} style={{
                      padding: "18px", border: slot.is_selected ? "2px solid #10b981" : "1px solid #e2e8f0",
                      borderRadius: "10px", background: slot.is_selected ? "#d1fae5" : "white",
                      cursor: slot.is_selected ? "default" : "pointer",
                      transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                    }}
                      onClick={() => !slot.is_selected && selectSlot(slot.id)}
                      onMouseEnter={(e) => { if (!slot.is_selected) e.currentTarget.style.borderColor = "#667eea"; }}
                      onMouseLeave={(e) => { if (!slot.is_selected) e.currentTarget.style.borderColor = "#e2e8f0"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                          <p style={{ fontWeight: "700", marginBottom: "6px", fontSize: "15px", color: "#1e293b" }}>
                            Slot {idx + 1}: 📅 {new Date(slot.scheduled_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                            ⏱️ Duration: {slot.duration_minutes} minutes
                          </p>
                          {slot.meeting_link && (
                            <p style={{ fontSize: "13px", color: "#2563eb" }}>🔗 Meeting link provided</p>
                          )}
                          {slot.notes && (
                            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>📝 {slot.notes}</p>
                          )}
                        </div>
                        {slot.is_selected ? (
                          <span style={{ color: "#10b981", fontSize: "22px", fontWeight: "bold" }}>✓ Selected</span>
                        ) : (
                          <span style={{
                            padding: "6px 14px", background: "linear-gradient(135deg, #667eea, #764ba2)",
                            color: "white", borderRadius: "20px", fontSize: "13px", fontWeight: "600"
                          }}>Select</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                  <p style={{ fontWeight: "600", marginBottom: "6px" }}>No interview slots available yet</p>
                  <p style={{ fontSize: "13px" }}>The recruiter hasn't added slots yet. Check back soon or check your messages.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
