import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./BrowseJobs.css"; // cards, grid & buttons


function Applicants() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "recruiter") {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://127.0.0.1:8000/api/auth/recruiter/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setApplications(res.data))
      .catch((err) => console.log(err));
  }, []);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/auth/recruiter/update/${id}/`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="app">
      <Sidebar role="recruiter" />

      <div className="main">
        <h2>Applicants</h2>

        {applications.filter(a => a.status === "pending").map((app) => (
          <div className="job-card" key={app.id}>
            <h3 className="job-title">{app.freelancer}</h3>
            <p><strong>Job:</strong> {app.job}</p>
            {app.skills && <p><strong>Skills:</strong> {app.skills}</p>}
            <p><strong>Status:</strong> {app.status}</p>
            <div className="button-row">
              <button onClick={() => updateStatus(app.id, "hired")} className="submit-btn">
                Hire
              </button>

              <button onClick={() => updateStatus(app.id, "rejected")} className="submit-btn reject-btn">
                Reject
              </button>
            </div>
          </div>
        ))}

        {applications.filter(a => a.status !== "pending").length > 0 && (
          <>
            <h3>Processed Applicants</h3>
            {applications.filter(a => a.status !== "pending").map((app) => (
              <div className="job-card processed" key={app.id}>
                <h3 className="job-title">{app.freelancer}</h3>
                <p><strong>Job:</strong> {app.job}</p>
                <p><strong>Status:</strong> {app.status}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Applicants;
