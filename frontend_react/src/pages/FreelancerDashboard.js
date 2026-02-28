import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { apiCall } from "../utils/apiClient";

// chartjs imports
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

function FreelancerDashboard() {
  const username = localStorage.getItem("username");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/stats/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError("Failed to load stats");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading dashboard...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (!stats) {
      return null;
    }

    const pieData = {
      labels: ['Pending', 'Accepted', 'Rejected'],
      datasets: [
        {
          data: [stats.pending, stats.accepted, stats.rejected],
          backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
        },
      ],
    };

    return (
      <>
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Applications</h3>
            <p>{stats.total_applications}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>Accepted</h3>
            <p>{stats.accepted}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <p>{stats.rejected}</p>
          </div>
          <div className="stat-card">
            <h3>Profile Completion</h3>
            <p>{stats.profile_completion}%</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-box">
            <h4>Application Status Breakdown</h4>
            <Pie data={pieData} />
          </div>
          <div className="chart-box">
            <h4>Profile Completion</h4>
            <div className="progress-bar">
              <div
                className="progress-filled"
                style={{ width: `${stats.profile_completion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="app">
      <Sidebar role="freelancer" />

      <div className="main">
        <div className="card">
          <h2>Welcome, {username}</h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default FreelancerDashboard;
