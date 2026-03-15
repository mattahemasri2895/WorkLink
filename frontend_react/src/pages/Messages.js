import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

const BASE = "http://localhost:8000/api/auth";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [thread, setThread] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const role = localStorage.getItem("role");
  const myUsername = localStorage.getItem("username");
  const location = useLocation();
  const navState = location.state;

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiCall(`${BASE}/messages/`, { method: "GET" });
      if (res.ok) setConversations(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThread = useCallback(async (partnerId) => {
    try {
      const res = await apiCall(`${BASE}/messages/thread/${partnerId}/`, { method: "GET" });
      if (res.ok) {
        setThread(await res.json());
        fetchConversations();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-open partner if navigated from Applicants page
  useEffect(() => {
    if (navState?.openPartnerId && !loading) {
      const existing = conversations.find((c) => c.partner_id === navState.openPartnerId);
      if (existing) {
        setActivePartner(existing);
      } else {
        // Partner not in list yet — create a stub so chat opens
        setActivePartner({ partner_id: navState.openPartnerId, partner_username: navState.openPartnerUsername || "User" });
      }
    }
  }, [navState, loading, conversations]);

  useEffect(() => {
    if (!activePartner) return;
    fetchThread(activePartner.partner_id);
    pollRef.current = setInterval(() => fetchThread(activePartner.partner_id), 3000);
    return () => clearInterval(pollRef.current);
  }, [activePartner, fetchThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const openConversation = (conv) => {
    setActivePartner(conv);
    setThread([]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activePartner) return;
    setSending(true);
    try {
      const res = await apiCall(`${BASE}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", recipient_id: activePartner.partner_id, body: newMsg.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setThread((prev) => [...prev, msg]);
        setNewMsg("");
        fetchConversations();
        window.dispatchEvent(new Event("countsUpdated"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
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
      <div className="main" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 30px 16px", borderBottom: "1px solid #e2e8f0", background: "white" }}>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#1e293b" }}>💬 Messages</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>Live chat with your contacts</p>
        </div>

        <div style={{ display: "flex", flex: 1, height: "calc(100vh - 120px)", overflow: "hidden" }}>
          {/* Conversation List */}
          <div style={{
            width: "300px", minWidth: "300px", borderRight: "1px solid #e2e8f0",
            background: "white", overflowY: "auto", display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <p style={{ margin: 0, fontWeight: "600", color: "#374151", fontSize: "14px" }}>
                Conversations ({conversations.length})
              </p>
            </div>
            {conversations.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>💬</div>
                <p style={{ margin: 0, fontSize: "14px" }}>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.partner_id} onClick={() => openConversation(conv)} style={{
                  padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid #f1f5f9",
                  background: activePartner?.partner_id === conv.partner_id ? "#eff6ff" : "white",
                  borderLeft: activePartner?.partner_id === conv.partner_id ? "3px solid #2563eb" : "3px solid transparent",
                  transition: "all 0.15s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      color: "white", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: "700", fontSize: "16px", flexShrink: 0
                    }}>
                      {conv.partner_username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "600", fontSize: "14px", color: "#1e293b" }}>
                          {conv.partner_username}
                        </span>
                        {conv.unread_count > 0 && (
                          <span style={{
                            background: "#2563eb", color: "white", borderRadius: "10px",
                            padding: "2px 7px", fontSize: "11px", fontWeight: "700"
                          }}>{conv.unread_count}</span>
                        )}
                      </div>
                      <p style={{
                        margin: "2px 0 0", fontSize: "12px", color: "#94a3b8",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {conv.last_message || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Window */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc" }}>
            {!activePartner ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>💬</div>
                <p style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 8px" }}>Select a conversation</p>
                <p style={{ fontSize: "14px", margin: 0 }}>Choose a contact from the left to start chatting</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: "16px 24px", background: "white", borderBottom: "1px solid #e2e8f0",
                  display: "flex", alignItems: "center", gap: "12px"
                }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: "700", fontSize: "17px"
                  }}>
                    {activePartner.partner_username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "#1e293b" }}>
                      {activePartner.partner_username}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#10b981" }}>● Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {thread.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px" }}>
                      <p>No messages yet. Say hello! 👋</p>
                    </div>
                  ) : (
                    thread.map((msg) => {
                      const isMine = msg.is_mine !== undefined ? msg.is_mine : msg.sender_username === myUsername;
                      return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                          <div style={{
                            maxWidth: "65%", padding: "10px 14px", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: isMine ? "linear-gradient(135deg, #667eea, #764ba2)" : "white",
                            color: isMine ? "white" : "#1e293b",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            fontSize: "14px", lineHeight: "1.5"
                          }}>
                            <p style={{ margin: "0 0 4px" }}>{msg.body}</p>
                            <p style={{ margin: 0, fontSize: "11px", opacity: 0.7, textAlign: "right" }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{
                  padding: "16px 24px", background: "white", borderTop: "1px solid #e2e8f0",
                  display: "flex", gap: "12px", alignItems: "center"
                }}>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1, padding: "12px 16px", borderRadius: "24px",
                      border: "1px solid #e2e8f0", fontSize: "14px", outline: "none",
                      background: "#f8fafc"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                  <button type="submit" disabled={sending || !newMsg.trim()} style={{
                    padding: "12px 20px", borderRadius: "24px", border: "none",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white", fontWeight: "600", cursor: "pointer",
                    fontSize: "14px", opacity: sending || !newMsg.trim() ? 0.6 : 1,
                    transition: "opacity 0.2s"
                  }}>
                    {sending ? "..." : "Send ➤"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
