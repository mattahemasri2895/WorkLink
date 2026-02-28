import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./PostJob.css";

function PostJob() {
  // redirect non‑recruiters away
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
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setErrorMsg("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/jobs/create/",
        job,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Job posted successfully");
      // optionally clear form
      setJob({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        job_type: "remote",
        duration: "medium",
      });
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(JSON.stringify(err.response.data));
      } else {
        setErrorMsg(err.message);
      }
    }
  };

  return (
    <div className="app">
      <Sidebar role="recruiter" />

      <div className="main">
        <div className="card post-job-card">
          <h2>Post a Job</h2>

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <form className="job-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title</label>
              <input
                value={job.title}
                placeholder="Job Title"
                onChange={(e) =>
                  setJob({ ...job, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={job.description}
                placeholder="Job Description"
                onChange={(e) =>
                  setJob({ ...job, description: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={job.requirements}
                placeholder="Skills / requirements (optional)"
                onChange={(e) =>
                  setJob({ ...job, requirements: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Salary</label>
              <input
                value={job.salary}
                placeholder="e.g. $5000 - $8000"
                onChange={(e) =>
                  setJob({ ...job, salary: e.target.value })
                }
              />
            </div>

            <div className="form-group two-column">
              <div>
                <label>Job Type</label>
                <select
                  value={job.job_type}
                  onChange={(e) =>
                    setJob({ ...job, job_type: e.target.value })
                  }
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label>Duration</label>
                <select
                  value={job.duration}
                  onChange={(e) =>
                    setJob({ ...job, duration: e.target.value })
                  }
                >
                  <option value="short">Short (&lt;1 month)</option>
                  <option value="medium">Medium (1–3 months)</option>
                  <option value="long">Long (&gt;3 months)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Post Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostJob;
