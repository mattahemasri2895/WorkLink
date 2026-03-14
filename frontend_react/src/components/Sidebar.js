import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiCall } from "../utils/apiClient";

function Sidebar({ role }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let interval;
    const listener = () => fetchCounts();
    fetchCounts();
    interval = setInterval(fetchCounts, 30000);
    window.addEventListener('countsUpdated', listener);
    return () => {
      clearInterval(interval);
      window.removeEventListener('countsUpdated', listener);
    };
  }, [role]);

  const fetchCounts = async () => {
    try {
      const msgEndpoint = role === 'freelancer' 
        ? "http://localhost:8000/api/auth/freelancer/messages/"
        : "http://localhost:8000/api/auth/messages/";
      const notifEndpoint = role === 'freelancer'
        ? "http://localhost:8000/api/auth/freelancer/notifications/"
        : "http://localhost:8000/api/auth/notifications/";
      
      const res1 = await apiCall(msgEndpoint, { method: "GET" });
      if (res1.ok) {
        const msgs = await res1.json();
        setUnreadMessages(msgs.filter(m => !m.is_read).length);
      }
      const res2 = await apiCall(notifEndpoint, { method: "GET" });
      if (res2.ok) {
        const data = await res2.json();
        setUnreadNotifications(data.unread);
      }
    } catch (e) {
      console.error('Failed to fetch counts', e);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <Link to="/" className="logo">
          💼
          {!isCollapsed && <span>WorkLink</span>}
        </Link>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {role === "freelancer" && (
          <>
            <Link to="/freelancer" className="nav-item" title="Dashboard">
              <span className="nav-icon">📊</span>
              {!isCollapsed && <span className="nav-text">Dashboard</span>}
            </Link>
            <Link to="/browse-jobs" className="nav-item" title="Browse Jobs">
              <span className="nav-icon">🔍</span>
              {!isCollapsed && <span className="nav-text">Browse Jobs</span>}
            </Link>
            <Link to="/applications" className="nav-item" title="My Applications">
              <span className="nav-icon">📋</span>
              {!isCollapsed && <span className="nav-text">My Applications</span>}
            </Link>
            <Link to="/interviews" className="nav-item" title="Interviews">
              <span className="nav-icon">📅</span>
              {!isCollapsed && <span className="nav-text">Interviews</span>}
            </Link>
            <Link to="/messages" className="nav-item" title="Messages">
              <span className="nav-icon">✉️</span>
              {!isCollapsed && <span className="nav-text">Messages</span>}
              {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
            </Link>
            <Link to="/notifications" className="nav-item" title="Notifications">
              <span className="nav-icon">🔔</span>
              {!isCollapsed && <span className="nav-text">Notifications</span>}
              {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
            </Link>
            <Link to="/freelancer-profile" className="nav-item" title="Profile">
              <span className="nav-icon">👤</span>
              {!isCollapsed && <span className="nav-text">Profile</span>}
            </Link>
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0' }}></div>
            <Link to="/settings" className="nav-item" title="Settings">
              <span className="nav-icon">⚙️</span>
              {!isCollapsed && <span className="nav-text">Settings</span>}
            </Link>
            <Link to="/help" className="nav-item" title="Help">
              <span className="nav-icon">❓</span>
              {!isCollapsed && <span className="nav-text">Help</span>}
            </Link>
          </>
        )}

        {role === "recruiter" && (
          <>
            <Link to="/recruiter" className="nav-item" title="Dashboard">
              <span className="nav-icon">📊</span>
              {!isCollapsed && <span className="nav-text">Dashboard</span>}
            </Link>
            <Link to="/post-job" className="nav-item" title="Post Job">
              <span className="nav-icon">➕</span>
              {!isCollapsed && <span className="nav-text">Post Job</span>}
            </Link>
            <Link to="/my-jobs" className="nav-item" title="My Jobs">
              <span className="nav-icon">💼</span>
              {!isCollapsed && <span className="nav-text">My Jobs</span>}
            </Link>
            <Link to="/applicants" className="nav-item" title="Applicants">
              <span className="nav-icon">👥</span>
              {!isCollapsed && <span className="nav-text">Applicants</span>}
            </Link>
            <Link to="/interviews" className="nav-item" title="Interviews">
              <span className="nav-icon">📅</span>
              {!isCollapsed && <span className="nav-text">Interviews</span>}
            </Link>
            <Link to="/messages" className="nav-item" title="Messages">
              <span className="nav-icon">✉️</span>
              {!isCollapsed && <span className="nav-text">Messages</span>}
              {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
            </Link>
            <Link to="/notifications" className="nav-item" title="Notifications">
              <span className="nav-icon">🔔</span>
              {!isCollapsed && <span className="nav-text">Notifications</span>}
              {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
            </Link>
            <Link to="/recruiter-profile" className="nav-item" title="Profile">
              <span className="nav-icon">👤</span>
              {!isCollapsed && <span className="nav-text">Profile</span>}
            </Link>
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0' }}></div>
            <Link to="/settings" className="nav-item" title="Settings">
              <span className="nav-icon">⚙️</span>
              {!isCollapsed && <span className="nav-text">Settings</span>}
            </Link>
            <Link to="/help" className="nav-item" title="Help">
              <span className="nav-icon">❓</span>
              {!isCollapsed && <span className="nav-text">Help</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          title="Logout"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
