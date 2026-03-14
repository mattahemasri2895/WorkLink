import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const endpoint = role === "freelancer"
        ? "http://localhost:8000/api/auth/freelancer/interviews/"
        : "http://localhost:8000/api/auth/recruiter/interviews/";
      const res = await apiCall(endpoint, { method: "GET" });
      if (res.ok) {
        setInterviews(await res.json());
      }
    } catch (e) {
      console.error("Error fetching interviews:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="app">
      <Sidebar role={role} />
      <div className="main"><div className="loading-spinner">Loading...</div></div>
    </div>
  );

  const upcomingInterviews = interviews.filter(i => !i.is_completed && new Date(i.scheduled_date) > new Date());
  const pastInterviews = interviews.filter(i => i.is_completed || new Date(i.scheduled_date) <= new Date());

  return (
    <div className="app">
      <Sidebar role={role} />
      <div className="main">
        <div className="page-header">
          <h1>📅 Interviews</h1>
          <p>Manage your interview schedules</p>
        </div>

        <div className="section-card">
          <h3>🔜 Upcoming Interviews ({upcomingInterviews.length})</h3>
          {upcomingInterviews.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
              {upcomingInterviews.map(interview => (
                <div key={interview.id} style={{
                  padding: '20px',
                  border: '2px solid #2563eb',
                  borderRadius: '12px',
                  background: '#f0f9ff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', marginBottom: '8px', color: '#2563eb' }}>
                        {interview.job_title}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                        {role === "freelancer" ? `Recruiter: ${interview.recruiter}` : `Candidate: ${interview.freelancer}`}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      background: '#10b981',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Upcoming
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>📅 Date & Time</p>
                      <p style={{ fontSize: '15px', fontWeight: '600' }}>
                        {new Date(interview.scheduled_date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>⏱️ Duration</p>
                      <p style={{ fontSize: '15px', fontWeight: '600' }}>{interview.duration_minutes} minutes</p>
                    </div>
                  </div>
                  {interview.meeting_link && (
                    <div style={{ marginTop: '16px' }}>
                      <a
                        href={interview.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                        🔗 Join Meeting
                      </a>
                    </div>
                  )}
                  {interview.notes && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'white', borderRadius: '8px' }}>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>📝 Notes</p>
                      <p style={{ fontSize: '14px' }}>{interview.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No upcoming interviews</p>
          )}
        </div>

        <div className="section-card" style={{ marginTop: '24px' }}>
          <h3>✅ Past Interviews ({pastInterviews.length})</h3>
          {pastInterviews.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
              {pastInterviews.map(interview => (
                <div key={interview.id} style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{interview.job_title}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(interview.scheduled_date).toLocaleString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      background: '#94a3b8',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No past interviews</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interviews;
