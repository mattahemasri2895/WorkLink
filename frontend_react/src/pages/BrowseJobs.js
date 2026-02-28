import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiCall } from "../utils/apiClient";
import "./BrowseJobs.css";

function BrowseJobs() {
  const token = localStorage.getItem("token");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [error, setError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("");
  const [duration, setDuration] = useState("");
  const [salaryRange, setSalaryRange] = useState("");

  // Fetch jobs and user's applications on mount
  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, jobType, duration, salaryRange]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiCall("http://localhost:8000/api/auth/jobs/", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        setError("");
      } else {
        setError("Failed to load jobs");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = jobs;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Job type filter
    if (jobType) {
      filtered = filtered.filter((job) => job.job_type === jobType);
    }

    // Duration filter
    if (duration) {
      filtered = filtered.filter((job) => job.duration === duration);
    }

    // Salary range filter
    if (salaryRange) {
      filtered = filtered.filter((job) => {
        const salary = extractSalaryNumber(job.salary);
        if (salaryRange === "0-500" && salary <= 500) return true;
        if (salaryRange === "500-1000" && salary > 500 && salary <= 1000) return true;
        if (salaryRange === "1000-5000" && salary > 1000 && salary <= 5000) return true;
        if (salaryRange === "5000+" && salary > 5000) return true;
        return false;
      });
    }

    setFilteredJobs(filtered);
  };

  const extractSalaryNumber = (salary) => {
    const match = salary.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const fetchMyApplications = async () => {
    try {
      const res = await apiCall("http://localhost:8000/api/auth/freelancer/applications/", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        const ids = new Set(data.map((a) => a.job));
        setAppliedJobs(ids);
      }
    } catch (e) {
      console.error('Failed to load my applications', e);
    }
  };

  const applyForJob = async (jobId) => {
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await apiCall(
        `http://localhost:8000/api/auth/jobs/apply/${jobId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        setAppliedJobs((prev) => new Set(prev).add(jobId));
        alert("✓ Applied successfully!");
      } else {
        const data = await response.json();
        alert(data.message || data.error || "Application failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setJobType("");
    setDuration("");
    setSalaryRange("");
  };

  if (loading) {
    return (
      <div className="app">
        <Sidebar role="freelancer" />
        <div className="main">
          <div className="loading">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar role="freelancer" />

      <div className="main">
        {/* Header */}
        <div className="browse-header">
          <h1>Browse Jobs</h1>
          <p>Discover opportunities that match your skills</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-container">
            {/* Search Bar */}
            <div className="filter-group full-width">
              <label>Search Jobs</label>
              <input
                type="text"
                placeholder="Search by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Job Type Filter */}
            <div className="filter-group">
              <label>Job Type</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="">All Types</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div className="filter-group">
              <label>Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="">All Durations</option>
                <option value="short">Short-term (&lt; 1 month)</option>
                <option value="medium">Medium-term (1-3 months)</option>
                <option value="long">Long-term (3+ months)</option>
              </select>
            </div>

            {/* Salary Range Filter */}
            <div className="filter-group">
              <label>Salary Range</label>
              <select value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)}>
                <option value="">All Budgets</option>
                <option value="0-500">$0 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000+">$5,000+</option>
              </select>
            </div>

            {/* Clear Button */}
            <button className="clear-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> jobs
        </div>

        {/* Jobs Grid */}
        <div className="jobs-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div className="job-card" key={job.id}>
                {/* Job Header */}
                <div className="job-header">
                  <div>
                    <h3 className="job-title">{job.title}</h3>
                    <p className="recruiter-name">by {job.recruiter_username}</p>
                  </div>
                  <span className={`job-type-badge ${job.job_type}`}>
                    {job.job_type === "remote" && "🌐 Remote"}
                    {job.job_type === "onsite" && "🏢 On-site"}
                    {job.job_type === "hybrid" && "🔀 Hybrid"}
                  </span>
                </div>

                {/* Job Description */}
                <p className="job-description">{job.description.substring(0, 150)}...</p>

                {/* Job Meta Info */}
                <div className="job-meta">
                  <div className="meta-item">
                    <span className="meta-label">💰 Budget:</span>
                    <span className="meta-value">{job.salary}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">⏱️ Duration:</span>
                    <span className="meta-value">
                      {job.duration === "short" && "Short-term"}
                      {job.duration === "medium" && "Medium-term"}
                      {job.duration === "long" && "Long-term"}
                    </span>
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && (
                  <div className="job-requirements">
                    <p className="req-label">📋 Requirements:</p>
                    <p className="req-text">{job.requirements.substring(0, 80)}...</p>
                  </div>
                )}

                {/* Action Button */}
                <div className="job-actions">
                  <button
                    className={`apply-btn ${appliedJobs.has(job.id) ? "applied" : ""}`}
                    onClick={() => applyForJob(job.id)}
                    disabled={appliedJobs.has(job.id)}
                  >
                    {appliedJobs.has(job.id) ? "✓ Applied" : "Apply Now"}
                  </button>
                </div>

                {/* Posted Date */}
                <p className="job-posted">
                  Posted {formatDate(job.created_at)}
                </p>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>📭 No jobs found matching your filters</p>
              <button className="clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

export default BrowseJobs;
