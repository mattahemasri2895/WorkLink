import { useState } from "react";
import Sidebar from "../components/Sidebar";

function Settings() {
  const role = localStorage.getItem("role");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="app">
      <Sidebar role={role} />
      <div className="main">
        <div className="page-header">
          <h1>⚙️ Settings</h1>
          <p>Manage your account preferences</p>
        </div>

        <div className="section-card">
          <h3>🔔 Notification Preferences</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px' }}>Email Notifications</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px' }}>Push Notifications</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={messageAlerts}
                onChange={(e) => setMessageAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px' }}>Message Alerts</span>
            </label>
          </div>
        </div>

        <div className="section-card" style={{ marginTop: '24px' }}>
          <h3>🔐 Account Security</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary" style={{ width: 'fit-content' }}>
              Change Password
            </button>
            <button className="btn btn-secondary" style={{ width: 'fit-content' }}>
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>

        <div className="section-card" style={{ marginTop: '24px' }}>
          <h3>🗑️ Account Management</h3>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-danger" style={{ width: 'fit-content' }}>
              Delete Account
            </button>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              This action cannot be undone
            </p>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
