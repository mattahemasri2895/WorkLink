import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";
import "./Notifications.css";

function Notifications() {
  const [notes, setNotes] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/notifications/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notifications);
        setUnread(data.unread);
      } else {
        setError("Failed to load notifications");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/notifications/", {
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

  return (
    <div className="app">
      <Sidebar role="freelancer" />
      <div className="main">
        <div className="card">
          <h2>Notifications</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && notes.length === 0 && <p>No notifications.</p>}
          <ul className="notif-list">
            {notes.map((n) => (
              <li key={n.id} className={n.is_read ? "read" : "unread"}>
                <div className="notif-header">
                  <span>{n.notif_type.replace('_',' ').toUpperCase()}</span>
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="mark-btn">
                      Mark read
                    </button>
                  )}
                </div>
                <p>{JSON.stringify(n.data)}</p>
                <small>{new Date(n.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
