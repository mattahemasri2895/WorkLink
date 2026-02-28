import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "./BrowseJobs.css";

function RecruiterDashboard() {
  const username = localStorage.getItem("username");

  // ensure recruiter access
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "recruiter") {
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="app">
      <Sidebar role="recruiter" />

      <div className="main">
        <div className="card">
          <h2>Welcome, {username}</h2>
          <p>This is your recruiter dashboard.</p>
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
