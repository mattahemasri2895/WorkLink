import Sidebar from "../components/Sidebar";

function Help() {
  const role = localStorage.getItem("role");

  const faqs = role === "freelancer" ? [
    { q: "How do I apply for a job?", a: "Browse jobs, click on a job you're interested in, and click the 'Apply' button. Make sure your profile is complete." },
    { q: "How can I track my applications?", a: "Go to 'My Applications' to see all your applications and their current status." },
    { q: "What are interview slots?", a: "When a recruiter schedules an interview, you'll see it in the 'Interviews' section with date, time, and meeting link." },
    { q: "How do I update my profile?", a: "Click on 'Profile' in the sidebar to edit your bio, skills, education, experience, and upload your resume." }
  ] : [
    { q: "How do I post a job?", a: "Click 'Post Job' in the sidebar, fill in the job details, and submit. Your job will be visible to freelancers." },
    { q: "How can I review applicants?", a: "Go to 'Applicants' to see all applications for your jobs. You can view profiles, resumes, and update application status." },
    { q: "How do I schedule an interview?", a: "In the applicants page, select a candidate and use the 'Schedule Interview' option to set date, time, and meeting link." },
    { q: "Can I edit or close a job?", a: "Yes, go to 'My Jobs' where you can edit job details or close a job to stop receiving applications." }
  ];

  return (
    <div className="app">
      <Sidebar role={role} />
      <div className="main">
        <div className="page-header">
          <h1>❓ Help & Support</h1>
          <p>Find answers to common questions</p>
        </div>

        <div className="section-card">
          <h3>📚 Frequently Asked Questions</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#2563eb' }}>{faq.q}</h4>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card" style={{ marginTop: '24px' }}>
          <h3>📞 Contact Support</h3>
          <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>Email:</strong> <a href="mailto:support@worklink.com" style={{ color: '#2563eb' }}>support@worklink.com</a>
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>Phone:</strong> <a href="tel:+1234567890" style={{ color: '#2563eb' }}>+1 (234) 567-890</a>
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
            </p>
          </div>
        </div>

        <div className="section-card" style={{ marginTop: '24px' }}>
          <h3>💬 Send us a Message</h3>
          <div style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input type="text" className="form-input" placeholder="What do you need help with?" />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Message</label>
              <textarea className="form-textarea" rows="5" placeholder="Describe your issue..."></textarea>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }}>
              📧 Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
