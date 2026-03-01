import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function Notifications() {
  const [notes, setNotes] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const endpoint = role === "freelancer"
        ? "http://localhost:8000/api/auth/freelancer/notifications/"
        : "http://localhost:8000/api/auth/notifications/";
      
      const res = await apiCall(endpoint, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notifications);
        setUnread(data.unread);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const endpoint = role === "freelancer"
        ? "http://localhost:8000/api/auth/freelancer/notifications/"
        : "http://localhost:8000/api/auth/notifications/";
      
      const res = await apiCall(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
      
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnread((u) => Math.max(0, u - 1));
        window.dispatchEvent(new Event('countsUpdated'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="app">
      <Sidebar role={role} />
      <div className="main"><div className="loading-spinner">Loading...</div></div>
    </div>
  );

  return (
    <div className="app">
      <Sidebar role={role} />
      <div className="main">
        <div className="page-header">
          <h1>🔔 Notifications</h1>
          <p>Stay updated with your latest activities</p>
        </div>

        <div className="section-card">
          <h3>All Notifications ({unread} unread)</h3>
          {notes.length === 0 ? (
            <p className="empty-state">No notifications yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
              {notes.map((n) => (
                <div key={n.id} style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: n.is_read ? 'white' : '#fef3c7',
                  borderLeft: n.is_read ? '4px solid #e2e8f0' : '4px solid #f59e0b'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#f59e0b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {n.notif_type.replace('_', ' ')}
                      </span>
                      <p style={{ marginTop: '8px', color: '#1e293b' }}>
                        {n.data.job_title && `Job: ${n.data.job_title}`}
                        {n.data.applicant && ` - Applicant: ${n.data.applicant}`}
                        {n.data.status && ` - Status: ${n.data.status}`}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button 
                        onClick={() => markRead(n.id)} 
                        className="btn btn-primary"
                        style={{ padding: '4px 12px', fontSize: '13px' }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  <small style={{ color: '#94a3b8' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
