import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const endpoint = role === "freelancer" 
        ? "http://localhost:8000/api/auth/freelancer/messages/"
        : "http://localhost:8000/api/auth/messages/";
      
      const res = await apiCall(endpoint, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const endpoint = role === "freelancer"
        ? "http://localhost:8000/api/auth/freelancer/messages/"
        : "http://localhost:8000/api/auth/messages/";
      
      const res = await apiCall(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
      
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
        );
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
          <h1>✉️ Messages</h1>
          <p>View and manage your messages</p>
        </div>

        <div className="section-card">
          <h3>Inbox ({messages.length})</h3>
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
              {messages.map((m) => (
                <div key={m.id} style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: m.is_read ? 'white' : '#f0f9ff',
                  borderLeft: m.is_read ? '4px solid #e2e8f0' : '4px solid #2563eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
                      {m.subject || "(No subject)"}
                    </h4>
                    {!m.is_read && (
                      <button 
                        onClick={() => markRead(m.id)} 
                        className="btn btn-primary"
                        style={{ padding: '4px 12px', fontSize: '13px' }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  <p style={{ color: '#64748b', marginBottom: '8px' }}>{m.body}</p>
                  <small style={{ color: '#94a3b8' }}>
                    From: {m.sender_username} • {new Date(m.created_at).toLocaleDateString()}
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

export default Messages;
