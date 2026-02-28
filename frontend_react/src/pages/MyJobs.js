import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./BrowseJobs.css";  // reuse card and grid styles


function MyJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "recruiter") {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://127.0.0.1:8000/api/auth/jobs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setJobs(res.data))
      .catch((err) => console.log(err));
  }, []);

  const formatType = (type) => {
    switch (type) {
      case 'remote': return 'Remote';
      case 'onsite': return 'On‑site';
      case 'hybrid': return 'Hybrid';
      default: return type;
    }
  };

  const formatDuration = (dur) => {
    switch (dur) {
      case 'short': return 'Short (<1 month)';
      case 'medium': return 'Medium (1-3 months)';
      case 'long': return 'Long (>3 months)';
      default: return dur;
    }
  };

  return (
    <div className="app">
      <Sidebar role="recruiter" />

      <div className="main">
        <h2>My Jobs</h2>

        {jobs.length === 0 && <p>No jobs posted yet.</p>}

        <div className="jobs-grid">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                <span className={`job-type-badge ${job.job_type}`}> {formatType(job.job_type)}</span>
              </div>
              <p>{job.description}</p>
              {job.requirements && <p><strong>Requirements:</strong> {job.requirements}</p>}
              {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
              <p><strong>Duration:</strong> {formatDuration(job.duration)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyJobs;
