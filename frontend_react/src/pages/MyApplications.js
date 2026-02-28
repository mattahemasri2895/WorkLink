import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://127.0.0.1:8000/api/auth/freelancer/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setApplications(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="app">
      <Sidebar role="freelancer" />

      <div className="main">
        <h2>My Applications</h2>

        {applications.map((app) => (
          <div className="card" key={app.id}>
            <h3>{app.job.title}</h3>
            <p>Status: {app.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyApplications;
