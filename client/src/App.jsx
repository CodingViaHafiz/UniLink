import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import BlogsPage from "./pages/BlogsPage";
import FacultyDashboardPage from "./pages/FacultyDashboardPage";
import HostelsPage from "./pages/HostelsPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ResourcesTypePage from "./pages/ResourcesTypePage";
import AdminLayoutPage from "./pages/admin/AdminLayoutPage";
import AdminBlogsPage from "./pages/admin/AdminBlogsPage";
import AdminHostelsPage from "./pages/admin/AdminHostelsPage";
import AdminResourcesPage from "./pages/admin/AdminResourcesPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/resources/:type" element={<ResourcesTypePage />} />
          <Route path="/hostels" element={<HostelsPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route element={<RoleRoute allowedRoles={["faculty"]} />}>
            <Route path="/faculty-dashboard" element={<FacultyDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminLayoutPage />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="resources" element={<AdminResourcesPage />} />
              <Route path="blogs" element={<AdminBlogsPage />} />
              <Route path="hostels" element={<AdminHostelsPage />} />
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
