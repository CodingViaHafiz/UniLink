import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import BlogsPage from "./pages/BlogsPage";
import FacultyDashboardPage from "./pages/FacultyDashboardPage";
import FeedbackPage from "./pages/FeedbackPage";
import FeedPage from "./pages/FeedPage";
import FocusTimerPage from "./pages/FocusTimerPage";
import GpaCalculatorPage from "./pages/GpaCalculatorPage";
import LostFoundPage from "./pages/LostFoundPage";
import MarketplacePage from "./pages/MarketplacePage";
import HostelsPage from "./pages/HostelsPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import ProgramsPage from "./pages/ProgramsPage";
import ResourcesTypePage from "./pages/ResourcesTypePage";
import AdminLayoutPage from "./pages/admin/AdminLayoutPage";
import AdminBlogsPage from "./pages/admin/AdminBlogsPage";
import AdminHostelsPage from "./pages/admin/AdminHostelsPage";
import AdminResourcesPage from "./pages/admin/AdminResourcesPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage";
import AdminLostFoundPage from "./pages/admin/AdminLostFoundPage";
import AdminMarketplacePage from "./pages/admin/AdminMarketplacePage";
import AdminProgramsPage from "./pages/admin/AdminProgramsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import SetPasswordPage from "./pages/SetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { useEffect } from "react";

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      let attempts = 0;

      const scrollToTarget = () => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (attempts < 6) {
          attempts += 1;
          window.requestAnimationFrame(scrollToTarget);
        }
      };

      scrollToTarget();
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.hash]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/set-password/:token" element={<SetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/resources" element={<ResourcesTypePage />} />
          <Route path="/hostels" element={<HostelsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/focus-timer" element={<FocusTimerPage />} />
          <Route path="/gpa-calculator" element={<GpaCalculatorPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/lost-found" element={<LostFoundPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleRoute allowedRoles={["faculty"]} />}>
            <Route path="/faculty-dashboard" element={<FacultyDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminLayoutPage />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="resources" element={<AdminResourcesPage />} />
              <Route path="blogs" element={<AdminBlogsPage />} />
              <Route path="hostels" element={<AdminHostelsPage />} />
              <Route path="calendar" element={<AdminCalendarPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="marketplace" element={<AdminMarketplacePage />} />
              <Route path="lost-found" element={<AdminLostFoundPage />} />
              <Route path="programs" element={<AdminProgramsPage />} />
              <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
