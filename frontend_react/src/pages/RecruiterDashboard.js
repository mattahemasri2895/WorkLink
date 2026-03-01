import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function RecruiterDashboard() {
  const [stats, setStats] = useState({ total_jobs: 0, total_applications: 0, pending: 0, hired: 0, rejected: 0 });
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appsRes, jobsRes] = await Promise.all([
        apiCall("http://localhost:8000/api/auth/recruiter/stats/", { method: "GET" }),
        apiCall("http://localhost:8000/api/auth/recruiter/applications/", { method: "GET" }),
        apiCall("http://localhost:8000/api/auth/jobs/", { method: "GET" })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (appsRes.ok) setApplications(await appsRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
    } catch (e) {
      console.error("Error loading dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      const res = await apiCall(`http://localhost:8000/api/auth/recruiter/application/${appId}/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setSelectedApplicant(null);
        fetchData();
        alert(`Application ${status}!`);
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  if (loading) return (
    <div className="app">
      <Sidebar role="recruiter" />
      <div className="main"><div className="loading-spinner">Loading...</div></div>
    </div>
  );

  const barData = {
    labels: ['Total Applications', 'Pending', 'Hired', 'Rejected'],
    datasets: [{
      label: 'Applications',
      data: [stats.total_applications, stats.pending, stats.hired, stats.rejected],
      backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#ef4444'],
      borderRadius: 8,
    }]
  };

  const doughnutData = {
    labels: ['Pending', 'Hired', 'Rejected'],
    datasets: [{
      data: [stats.pending, stats.hired, stats.rejected],
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="app">
      <Sidebar role="recruiter" />
      <div className="main">
        <div className="page-header">
          <h1>💼 Recruiter Dashboard</h1>
          <p>Manage your recruitment pipeline and track applicants</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{stats.total_jobs}</h3>
              <p>Total Jobs Posted</p>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <h3>{stats.total_applications}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.hired}</h3>
              <p>Hired</p>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>📊 Application Overview</h3>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="chart-card">
            <h3>📈 Status Distribution</h3>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        <div className="section-card">
          <h3>💼 Active Jobs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {jobs.slice(0, 6).map(job => (
              <div key={job.id} style={{ 
                padding: '16px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                background: 'white'
              }}>
                <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{job.title}</h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                  {job.description.substring(0, 60)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`status-badge ${job.status || 'open'}`}>{job.status || 'open'}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h3>👥 Recent Applicants</h3>
          {applications.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {applications.slice(0, 10).map(app => (
                <div key={app.id} style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }} onClick={() => setSelectedApplicant(app)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {app.freelancer.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{app.freelancer}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>{app.job}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${app.status}`}>{app.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No applications yet</p>
          )}
        </div>

        {selectedApplicant && (
          <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedApplicant(null)}>✕</button>
              <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>👤 {selectedApplicant.freelancer}</h2>
              
              <div style={{ lineHeight: '1.8' }}>
                <p style={{ marginBottom: '16px' }}><strong>Applied for:</strong> {selectedApplicant.job}</p>
                <p style={{ marginBottom: '16px' }}><strong>Status:</strong> <span className={`status-badge ${selectedApplicant.status}`}>{selectedApplicant.status}</span></p>
                
                {selectedApplicant.bio && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Bio:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.bio}</p>
                  </>
                )}
                
                {selectedApplicant.education && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Education:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.education}</p>
                  </>
                )}
                
                {selectedApplicant.skills && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Skills:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.skills}</p>
                  </>
                )}
                
                {selectedApplicant.experience && (
                  <>
                    <p style={{ marginTop: '20px', marginBottom: '8px' }}><strong>Experience:</strong></p>
                    <p style={{ color: '#64748b' }}>{selectedApplicant.experience}</p>
                  </>
                )}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button 
                    className="btn btn-success"
                    onClick={() => updateStatus(selectedApplicant.id, 'hired')}
                  >
                    ✅ Hire
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => updateStatus(selectedApplicant.id, 'rejected')}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
