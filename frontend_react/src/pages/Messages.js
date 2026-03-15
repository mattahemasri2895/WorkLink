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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchThread = useCallback(async (partnerId) => {
    try {
      const res = await apiCall(`${BASE}/messages/thread/${partnerId}/`, { method: "GET" });
      if (res.ok) {
        setThread(await res.json());
        fetchConversations();
      }
    } catch (e) { console.error(e); }
  }, [fetchConversations]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (navState?.openPartnerId && !loading) {
      const existing = conversations.find((c) => c.partner_id === navState.openPartnerId);
      setActivePartner(existing || { partner_id: navState.openPartnerId, partner_username: navState.openPartnerUsername || "User" });
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
    } catch (e) { console.error(e); }
    finally { setSending(false); }
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

      {/* Messages page takes full remaining height, no scroll on outer container */}
      <div style={{
        marginLeft: "260px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        background: "#f4f6fb",
        transition: "margin-left 0.3s",
      }}>
        {/* Top page header — fixed */}
        <div style={{
          padding: "18px 28px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
          }}>💬</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" }}>Messages</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Live chat with your contacts</p>
          </div>
        </div>

        {/* Body: left panel + chat — fills remaining height */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── LEFT PANEL (fixed, no scroll on panel itself) ── */}
          <div style={{
            width: "300px",
            minWidth: "300px",
            background: "white",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            {/* Panel header — sticky */}
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f1f5f9",
              background: "white",
              flexShrink: 0,
            }}>
              <p style={{ margin: 0, fontWeight: "700", color: "#374151", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Conversations ({conversations.length})
              </p>
            </div>

            {/* Scrollable conversation list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {conversations.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>💬</div>
                  <p style={{ margin: 0, fontSize: "13px" }}>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = activePartner?.partner_id === conv.partner_id;
                  return (
                    <div key={conv.partner_id} onClick={() => openConversation(conv)} style={{
                      padding: "13px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f8fafc",
                      background: isActive ? "rgba(102,126,234,0.08)" : "white",
                      borderLeft: isActive ? "3px solid #667eea" : "3px solid transparent",
                      transition: "all 0.15s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          color: "white", display: "flex", alignItems: "center",
                          justifyContent: "center", fontWeight: "800", fontSize: "15px", flexShrink: 0,
                        }}>
                          {conv.partner_username.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                            <span style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>
                              {conv.partner_username}
                            </span>
                            {conv.unread_count > 0 && (
                              <span style={{
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                color: "white", borderRadius: "10px",
                                padding: "2px 7px", fontSize: "11px", fontWeight: "700",
                              }}>{conv.unread_count}</span>
                            )}
                          </div>
                          <p style={{
                            margin: 0, fontSize: "12px", color: "#94a3b8",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {conv.last_message || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── CHAT AREA ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {!activePartner ? (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", color: "#94a3b8",
              }}>
                <div style={{ fontSize: "60px", marginBottom: "16px" }}>💬</div>
                <p style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px", color: "#64748b" }}>Select a conversation</p>
                <p style={{ fontSize: "14px", margin: 0 }}>Choose a contact from the left to start chatting</p>
              </div>
            ) : (
              <>
                {/* Chat header — sticky, never scrolls */}
                <div style={{
                  padding: "14px 24px",
                  background: "white",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: "800", fontSize: "17px",
                  }}>
                    {activePartner.partner_username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "800", fontSize: "16px", color: "#1e293b" }}>
                      {activePartner.partner_username}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#10b981", fontWeight: "600" }}>● Active now</p>
                  </div>
                </div>

                {/* Messages — ONLY this scrolls */}
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  background: "#f4f6fb",
                }}>
                  {thread.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "60px" }}>
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>👋</div>
                      <p style={{ fontWeight: "600" }}>No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    thread.map((msg) => {
                      const isMine = msg.is_mine !== undefined ? msg.is_mine : msg.sender_username === myUsername;
                      return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                          {!isMine && (
                            <div style={{
                              width: "30px", height: "30px", borderRadius: "50%",
                              background: "linear-gradient(135deg, #667eea, #764ba2)",
                              color: "white", display: "flex", alignItems: "center",
                              justifyContent: "center", fontWeight: "700", fontSize: "12px",
                              flexShrink: 0, marginRight: "8px", alignSelf: "flex-end",
                            }}>
                              {(msg.sender_username || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{
                            maxWidth: "62%",
                            padding: "10px 14px",
                            borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: isMine ? "linear-gradient(135deg, #667eea, #764ba2)" : "white",
                            color: isMine ? "white" : "#1e293b",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            fontSize: "14px",
                            lineHeight: "1.5",
                          }}>
                            <p style={{ margin: "0 0 4px", wordBreak: "break-word" }}>{msg.body}</p>
                            <p style={{ margin: 0, fontSize: "11px", opacity: 0.65, textAlign: "right" }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input bar — sticky at bottom, never scrolls */}
                <form onSubmit={sendMessage} style={{
                  padding: "14px 24px",
                  background: "white",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexShrink: 0,
                }}>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1, padding: "11px 18px", borderRadius: "24px",
                      border: "2px solid #e5e7eb", fontSize: "14px", outline: "none",
                      background: "#f4f6fb", fontFamily: "inherit", color: "#1e293b",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                  <button type="submit" disabled={sending || !newMsg.trim()} style={{
                    padding: "11px 22px", borderRadius: "24px", border: "none",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white", fontWeight: "700", cursor: "pointer",
                    fontSize: "14px", opacity: sending || !newMsg.trim() ? 0.55 : 1,
                    transition: "all 0.2s", flexShrink: 0,
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
