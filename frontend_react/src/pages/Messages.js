import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";
import "./Messages.css";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/messages/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        setError("Failed to load messages");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/messages/", {
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

  return (
    <div className="app">
      <Sidebar role="freelancer" />
      <div className="main">
        <div className="card">
          <h2>Messages</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && messages.length === 0 && <p>No messages.</p>}
          <ul className="message-list">
            {messages.map((m) => (
              <li key={m.id} className={m.is_read ? "read" : "unread"}>
                <div className="msg-header">
                  <strong>{m.subject || "(no subject)"}</strong>
                  {!m.is_read && (
                    <button onClick={() => markRead(m.id)} className="mark-btn">
                      Mark read
                    </button>
                  )}
                </div>
                <p>{m.body}</p>
                <small>From: {m.sender_username}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Messages;
