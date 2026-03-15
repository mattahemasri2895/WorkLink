import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";

import BrowseJobs from "./pages/BrowseJobs";
import MyApplications from "./pages/MyApplications";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";

import FreelancerProfile from "./pages/FreelancerProfile";
import RecruiterProfile from "./pages/RecruiterProfile";
import Applicants from "./pages/Applicants";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Interviews from "./pages/Interviews";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />

        <Route path="/freelancer" element={<FreelancerDashboard />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />

        <Route path="/browse-jobs" element={<BrowseJobs />} />
        <Route path="/applications" element={<MyApplications />} />

        <Route path="/post-job" element={<PostJob />} />
        <Route path="/my-jobs" element={<MyJobs />} />

        <Route path="/freelancer-profile" element={<FreelancerProfile />} />
        <Route path="/recruiter-profile" element={<RecruiterProfile />} />
        <Route path="/applicants" element={<Applicants />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
