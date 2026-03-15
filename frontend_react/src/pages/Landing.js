import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  const stats = [
    { value: "10K+", label: "Freelancers" },
    { value: "2K+", label: "Companies" },
    { value: "50K+", label: "Jobs Posted" },
    { value: "98%", label: "Satisfaction" },
  ];

  const features = [
    { icon: "🚀", title: "Fast Hiring", desc: "Connect with top talent in minutes, not weeks. Streamlined application process." },
    { icon: "💡", title: "Smart Matching", desc: "AI-powered skill matching ensures the right talent meets the right opportunity." },
    { icon: "📅", title: "Easy Scheduling", desc: "Recruiters send interview slots, freelancers pick their preferred time instantly." },
    { icon: "💬", title: "Live Chat", desc: "Real-time messaging between freelancers and recruiters throughout the process." },
    { icon: "🎯", title: "Career Growth", desc: "Find opportunities that align with your skills, experience, and career goals." },
    { icon: "🔒", title: "Secure Platform", desc: "Your data and documents are protected with enterprise-grade security." },
  ];

  const steps = [
    { num: "01", title: "Create Your Profile", desc: "Sign up as a freelancer or recruiter and build your professional profile." },
    { num: "02", title: "Browse & Apply", desc: "Freelancers browse jobs and apply. Recruiters post jobs and review applicants." },
    { num: "03", title: "Interview & Hire", desc: "Schedule interviews, chat live, and complete the hiring process seamlessly." },
  ];

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">💼 WorkLink</div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#stats">Stats</a>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-btn-outline" onClick={() => navigate("/")}>Sign In</button>
            <button className="landing-btn-primary" onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero-wrap">
      <div className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">🌟 #1 Freelance Platform</div>
          <h1 className="landing-hero-title">
            Connect <span className="landing-gradient-text">Talent</span><br />
            with Opportunity
          </h1>
          <p className="landing-hero-subtitle">
            WorkLink bridges the gap between skilled freelancers and forward-thinking companies.
            Post jobs, apply, schedule interviews, and hire — all in one place.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn-hero-primary" onClick={() => navigate("/register")}>
              Start for Free →
            </button>
            <button className="landing-btn-hero-outline" onClick={() => navigate("/")}>
              Sign In
            </button>
          </div>
          <div className="landing-hero-trust">
            <span>✅ No credit card required</span>
            <span>✅ Free to join</span>
            <span>✅ Instant access</span>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-hero-card">
            <div className="hero-card-header">
              <div className="hero-avatar">JD</div>
              <div>
                <p className="hero-card-name">Jane Doe</p>
                <p className="hero-card-role">Full Stack Developer</p>
              </div>
              <span className="hero-card-badge">✅ Hired</span>
            </div>
            <div className="hero-card-skills">
              {["React", "Node.js", "Python", "AWS"].map((s) => (
                <span key={s} className="hero-skill-tag">{s}</span>
              ))}
            </div>
            <div className="hero-card-stat">
              <span>💼 12 jobs completed</span>
              <span>⭐ 4.9 rating</span>
            </div>
          </div>
          <div className="landing-hero-card landing-hero-card-2">
            <p className="hero-job-title">Senior React Developer</p>
            <p className="hero-job-company">🏢 TechCorp Inc.</p>
            <div style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
              <span className="hero-skill-tag">Remote</span>
              <span className="hero-skill-tag">$80-120/hr</span>
            </div>
            <button className="landing-btn-primary" style={{ width: "100%", padding: "8px" }}>Apply Now</button>
          </div>
        </div>
      </div>
      </section>

      {/* Stats */}
      <section className="landing-stats" id="stats">
        <div className="landing-container">
          <div className="landing-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="landing-stat-item">
                <div className="landing-stat-value">{s.value}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>Everything You Need to <span className="landing-gradient-text">Succeed</span></h2>
            <p>Powerful features designed for both freelancers and recruiters</p>
          </div>
          <div className="landing-features-grid">
            {features.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>How It <span className="landing-gradient-text">Works</span></h2>
            <p>Get started in three simple steps</p>
          </div>
          <div className="landing-steps">
            {steps.map((step, i) => (
              <div key={step.num} className="landing-step">
                <div className="landing-step-num">{step.num}</div>
                {i < steps.length - 1 && <div className="landing-step-connector" />}
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="landing-cta-box">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of freelancers and companies already using WorkLink</p>
            <div className="landing-cta-actions">
              <button className="landing-btn-hero-primary" onClick={() => navigate("/register")}>
                Create Free Account →
              </button>
              <button className="landing-btn-hero-outline" onClick={() => navigate("/")}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-inner">
            <div className="landing-logo" style={{ color: "white" }}>💼 WorkLink</div>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              © 2025 WorkLink. Connecting talent with opportunity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
