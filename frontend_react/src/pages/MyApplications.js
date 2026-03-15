import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

const BASE = "http://localhost:8000/api/auth";

const STATUS_META = {
  pending:              { bg: "#fef3c7", color: "#92400e",  label: "⏳ Pending" },
  accepted:             { bg: "#d1fae5", color: "#065f46",  label: "✅ Shortlisted" },
  interview_scheduled:  { bg: "#dbeafe", color: "#1e40af",  label: "📅 Interview Scheduled" },
  interview_completed:  { bg: "#e0e7ff", color: "#3730a3",  label: "✔️ Interview Completed" },
  selected:             { bg: "#d1fae5", color: "#065f46",  label: "🌟 Selected" },
  offer_sent:           { bg: "#dbeafe", color: "#1e40af",  label: "📧 Offer Sent" },
  hired:                { bg: "#d1fae5", color: "#065f46",  label: "🎉 Hired" },
  rejected:             { bg: "#fee2e2", color: "#991b1b",  label: "❌ Rejected" },
  interview_rejected:   { bg: "#fee2e2", color: "#991b1b",  label: "❌ Not Selected" },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { bg: "#f1f5f9", color: "#475569", label: status };
  return (
    <span style={{
      padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
      fontWeight: "700", background: m.bg, color: m.color, display: "inline-block"
    }}>{m.label}</span>
  );
}

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Slot modal state
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotAppId, setSlotAppId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectingSlot, setSelectingSlot] = useState(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiCall(`${BASE}/freelancer/applications/`, { method: "GET" });
      if (res.ok) {
        setApplications(await res.json());
      } else {
        console.error("Failed to fetch applications:", res.status);
      }
    } catch (e) {
      console.error("fetchApplications error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openSlotModal = async (appId) => {
    setSlotAppId(appId);
    setSlots([]);
    setSlotsError("");
    setSlotsLoading(true);
    setShowSlotModal(true);

    try {
      const res = await apiCall(`${BASE}/freelancer/application/${appId}/slots/`, { method: "GET" });
      const data = await res.json();
      if (res.ok) {
        setSlots(Array.isArray(data) ? data : []);
        if (!Array.isArray(data) || data.length === 0) {
          setSlotsError("No interview slots have been added by the recruiter yet. Please check back later.");
        }
      } else {
        setSlotsError(data.error || `Error ${res.status}: Could not load slots.`);
      }
    } catch (e) {
      setSlotsError("Network error while loading slots. Please try again.");
      console.error("openSlotModal error:", e);
    } finally {
      setSlotsLoading(false);
    }
  };

  const selectSlot = async (slotId) => {
    setSelectingSlot(slotId);
    try {
      const res = await apiCall(`${BASE}/freelancer/slot/${slotId}/select/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setShowSlotModal(false);
        setSelectedApp(null);
        await fetchApplications();
        alert(`✅ Interview confirmed for ${data.slot_time}!\n\nThe recruiter has been notified. Check Messages for meeting details.`);
      } else {
        alert(`❌ Failed to select slot: ${data.error || "Unknown error"}`);
      }
    } catch (e) {
      alert("Network error while selecting slot. Please try again.");
      console.error("selectSlot error:", e);
    } finally {
      setSelectingSlot(null);
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
        await fetchApplications();
        setSelectedApp(null);
        alert("🎉 Congratulations! You have accepted the offer.");
      } else {
        const d = await res.json();
        alert(d.error || "Failed to accept offer.");
      }
    } catch (e) {
      alert("Network error. Please try again.");
    }
  };

  const filteredApps = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter);

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

        {/* Filter tabs */}
        <div className="section-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0 }}>Applications ({applications.length})</h3>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["all", "pending", "accepted", "interview_scheduled", "selected", "offer_sent", "hired", "rejected"].map((s) => (
                <button key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "5px 12px", fontSize: "12px", fontWeight: "600",
                    borderRadius: "20px", border: "none", cursor: "pointer",
                    background: filter === s ? "linear-gradient(135deg,#667eea,#764ba2)" : "#f1f5f9",
                    color: filter === s ? "white" : "#64748b",
                    transition: "all 0.2s",
                  }}>
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <p>No applications found</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {filteredApps.map((app) => (
                <div key={app.id} style={{
                  background: "white", border: "1px solid #e5e7eb", borderRadius: "12px",
                  padding: "18px", transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "17px", margin: "0 0 6px", color: "#1e293b" }}>{app.job_title}</h4>
                      <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 10px" }}>
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      <StatusBadge status={app.status} />

                      {/* CTA for accepted — show slot button */}
                      {app.status === "accepted" && (
                        <div style={{
                          marginTop: "14px", padding: "14px 16px",
                          background: "linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.08))",
                          borderRadius: "10px", border: "1px solid rgba(102,126,234,0.2)"
                        }}>
                          <p style={{ margin: "0 0 10px", fontWeight: "700", color: "#667eea", fontSize: "14px" }}>
                            🎉 You've been shortlisted! Select your interview slot.
                          </p>
                          <button onClick={() => openSlotModal(app.id)} style={{
                            padding: "9px 18px", background: "linear-gradient(135deg,#667eea,#764ba2)",
                            color: "white", border: "none", borderRadius: "8px",
                            fontWeight: "700", fontSize: "13px", cursor: "pointer",
                          }}>
                            📅 Select Interview Slot
                          </button>
                        </div>
                      )}

                      {app.status === "offer_sent" && (
                        <div style={{
                          marginTop: "14px", padding: "14px 16px",
                          background: "#dbeafe", borderRadius: "10px", border: "1px solid #93c5fd"
                        }}>
                          <p style={{ margin: "0 0 10px", fontWeight: "700", color: "#1e40af", fontSize: "14px" }}>
                            🎊 You received a job offer!
                          </p>
                          <button onClick={() => setSelectedApp(app)} style={{
                            padding: "9px 18px", background: "linear-gradient(135deg,#667eea,#764ba2)",
                            color: "white", border: "none", borderRadius: "8px",
                            fontWeight: "700", fontSize: "13px", cursor: "pointer",
                          }}>
                            📄 View & Accept Offer
                          </button>
                        </div>
                      )}
                    </div>

                    <button onClick={() => setSelectedApp(app)} style={{
                      padding: "8px 16px", background: "white", color: "#667eea",
                      border: "1.5px solid #667eea", borderRadius: "8px",
                      fontWeight: "600", fontSize: "13px", cursor: "pointer",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Detail Modal ── */}
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
              <h2 style={{ marginBottom: "4px", paddingRight: "32px" }}>{selectedApp.job_title}</h2>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>
                Applied {new Date(selectedApp.applied_at).toLocaleDateString()}
              </p>
              <StatusBadge status={selectedApp.status} />

              <div style={{ marginTop: "20px" }}>
                {selectedApp.status === "accepted" && (
                  <div style={{ padding: "16px", background: "rgba(102,126,234,0.08)", borderRadius: "10px", border: "1px solid rgba(102,126,234,0.2)", marginBottom: "16px" }}>
                    <p style={{ margin: "0 0 12px", fontWeight: "700", color: "#667eea" }}>
                      🎉 You've been shortlisted! Please select an interview slot.
                    </p>
                    <button onClick={() => { setSelectedApp(null); openSlotModal(selectedApp.id); }} style={{
                      padding: "9px 18px", background: "linear-gradient(135deg,#667eea,#764ba2)",
                      color: "white", border: "none", borderRadius: "8px",
                      fontWeight: "700", fontSize: "13px", cursor: "pointer",
                    }}>
                      📅 Select Interview Slot
                    </button>
                  </div>
                )}

                {selectedApp.status === "interview_scheduled" && (
                  <div style={{ padding: "16px", background: "#dbeafe", borderRadius: "10px", marginBottom: "16px" }}>
                    <p style={{ margin: 0, fontWeight: "700", color: "#1e40af" }}>
                      📅 Your interview is scheduled. Check Messages for meeting details.
                    </p>
                  </div>
                )}

                {selectedApp.status === "offer_sent" && (
                  <div style={{ padding: "16px", background: "#dbeafe", borderRadius: "10px", marginBottom: "16px" }}>
                    <p style={{ margin: "0 0 12px", fontWeight: "700", color: "#1e40af" }}>📧 You have received a job offer!</p>
                    {selectedApp.offer_message && <p style={{ margin: "0 0 12px", color: "#374151" }}>{selectedApp.offer_message}</p>}
                    {selectedApp.offer_letter && (
                      <a href={`http://localhost:8000${selectedApp.offer_letter}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-block", marginRight: "10px", padding: "8px 16px", background: "#1e40af", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}>
                        📄 View Offer Letter
                      </a>
                    )}
                    <button onClick={() => acceptOffer(selectedApp.id)} style={{
                      padding: "8px 16px", background: "linear-gradient(135deg,#10b981,#059669)",
                      color: "white", border: "none", borderRadius: "8px",
                      fontWeight: "700", fontSize: "13px", cursor: "pointer",
                    }}>✅ Accept Offer</button>
                  </div>
                )}

                {selectedApp.status === "hired" && (
                  <div style={{ padding: "16px", background: "#d1fae5", borderRadius: "10px", marginBottom: "16px" }}>
                    <p style={{ margin: 0, fontWeight: "700", color: "#065f46" }}>🎉 Congratulations! You are hired!</p>
                  </div>
                )}

                {(selectedApp.status === "rejected" || selectedApp.status === "interview_rejected") && (
                  <div style={{ padding: "16px", background: "#fee2e2", borderRadius: "10px", marginBottom: "16px" }}>
                    <p style={{ margin: 0, fontWeight: "700", color: "#991b1b" }}>❌ Unfortunately, your application was not selected.</p>
                  </div>
                )}

                {selectedApp.job_details && (
                  <div style={{ marginTop: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                    <p style={{ fontWeight: "700", marginBottom: "6px" }}>Job Description</p>
                    <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>{selectedApp.job_details.description}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[
                        ["💰 Salary", selectedApp.job_details.salary || "N/A"],
                        ["📍 Type", selectedApp.job_details.job_type],
                        ["⏱️ Duration", selectedApp.job_details.duration],
                        ["👤 Recruiter", selectedApp.job_details.recruiter_username],
                      ].map(([label, val]) => (
                        <div key={label} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px" }}>
                          <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>{label}</p>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#374151" }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Slot Selection Modal ── */}
        {showSlotModal && (
          <div className="modal-overlay" onClick={() => setShowSlotModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
              <button className="close-btn" onClick={() => setShowSlotModal(false)}>✕</button>
              <h2 style={{ marginBottom: "6px" }}>📅 Select Interview Slot</h2>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                Choose your preferred time. The recruiter will be notified automatically.
              </p>

              {slotsLoading ? (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏳</div>
                  <p style={{ color: "#64748b", fontWeight: "600" }}>Loading available slots...</p>
                </div>
              ) : slotsError ? (
                <div style={{ padding: "20px", background: "#fef3c7", borderRadius: "10px", border: "1px solid #fcd34d", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>📭</div>
                  <p style={{ color: "#92400e", fontWeight: "600", margin: "0 0 6px" }}>No slots available yet</p>
                  <p style={{ color: "#92400e", fontSize: "13px", margin: 0 }}>{slotsError}</p>
                </div>
              ) : slots.length === 0 ? (
                <div style={{ padding: "20px", background: "#fef3c7", borderRadius: "10px", border: "1px solid #fcd34d", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>📭</div>
                  <p style={{ color: "#92400e", fontWeight: "600", margin: "0 0 6px" }}>No slots available yet</p>
                  <p style={{ color: "#92400e", fontSize: "13px", margin: 0 }}>The recruiter hasn't added interview slots yet. Check back soon.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {slots.map((slot, idx) => {
                    const isSelecting = selectingSlot === slot.id;
                    const dateObj = new Date(slot.scheduled_date);
                    const dateStr = dateObj.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                    const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div key={slot.id}
                        onClick={() => !slot.is_selected && !selectingSlot && selectSlot(slot.id)}
                        style={{
                          padding: "16px 18px",
                          border: slot.is_selected ? "2px solid #10b981" : "1.5px solid #e5e7eb",
                          borderRadius: "12px",
                          background: slot.is_selected ? "#d1fae5" : "white",
                          cursor: slot.is_selected || selectingSlot ? "default" : "pointer",
                          transition: "all 0.2s",
                          opacity: isSelecting ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if (!slot.is_selected && !selectingSlot) e.currentTarget.style.borderColor = "#667eea"; }}
                        onMouseLeave={(e) => { if (!slot.is_selected) e.currentTarget.style.borderColor = "#e5e7eb"; }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1e293b" }}>
                              Slot {idx + 1} — {dateStr}
                            </p>
                            <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#667eea", fontWeight: "600" }}>
                              🕐 {timeStr} &nbsp;·&nbsp; ⏱️ {slot.duration_minutes} min
                            </p>
                            {slot.meeting_link && (
                              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#10b981", fontWeight: "600" }}>
                                🔗 Meeting link provided
                              </p>
                            )}
                            {slot.notes && (
                              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                                📝 {slot.notes}
                              </p>
                            )}
                          </div>
                          <div style={{ flexShrink: 0, marginLeft: "12px" }}>
                            {slot.is_selected ? (
                              <span style={{ color: "#10b981", fontWeight: "800", fontSize: "14px" }}>✓ Selected</span>
                            ) : isSelecting ? (
                              <span style={{ color: "#667eea", fontSize: "13px" }}>Selecting...</span>
                            ) : (
                              <span style={{
                                padding: "7px 16px",
                                background: "linear-gradient(135deg,#667eea,#764ba2)",
                                color: "white", borderRadius: "20px",
                                fontSize: "13px", fontWeight: "700",
                              }}>Select</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
