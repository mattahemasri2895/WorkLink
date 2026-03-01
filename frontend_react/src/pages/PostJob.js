import { useState, useEffect } from "react";
import { apiCall } from "../utils/apiClient";
import Sidebar from "../components/Sidebar";

function PostJob() {
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "recruiter") {
      window.location.href = "/";
    }
  }, []);

  const [job, setJob] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    job_type: "remote",
    duration: "medium",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await apiCall("http://localhost:8000/api/auth/jobs/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
      });

      if (res.ok) {
        setMessage("✓ Job posted successfully!");
        setJob({
          title: "",
          description: "",
          requirements: "",
          salary: "",
          job_type: "remote",
          duration: "medium",
        });
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to post job");
      }
    } catch (err) {
      setMessage("Error posting job");
    }
  };

  return (
    <div className="app">
      <Sidebar role="recruiter" />
      <div className="main">
        <div className="page-header">
          <h1>➕ Post a Job</h1>
          <p>Create a new job posting to attract talented freelancers</p>
        </div>

        {message && (
          <div className={message.includes('✓') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <div className="section-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                className="form-input"
                value={job.title}
                placeholder="e.g., Full Stack Developer"
                onChange={(e) => setJob({ ...job, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={job.description}
                placeholder="Describe the job role and responsibilities..."
                onChange={(e) => setJob({ ...job, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Requirements</label>
              <textarea
                className="form-textarea"
                value={job.requirements}
                placeholder="List required skills and qualifications..."
                onChange={(e) => setJob({ ...job, requirements: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary</label>
              <input
                className="form-input"
                value={job.salary}
                placeholder="e.g., $5000 - $8000"
                onChange={(e) => setJob({ ...job, salary: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select
                  className="form-select"
                  value={job.job_type}
                  onChange={(e) => setJob({ ...job, job_type: e.target.value })}
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <select
                  className="form-select"
                  value={job.duration}
                  onChange={(e) => setJob({ ...job, duration: e.target.value })}
                >
                  <option value="short">Short-term</option>
                  <option value="medium">Medium-term</option>
                  <option value="long">Long-term</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
              ➕ Post Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostJob;
