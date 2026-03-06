import { Navigate, Route, Routes } from "react-router-dom";
import { adminModuleRoutes } from "./constants/adminConfig";
import { AuthProvider } from "./context/AuthProvider";
import AuthPage from "./pages/AuthPage";
import FacultyDashboardPage from "./pages/FacultyDashboardPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminLayoutPage from "./pages/admin/AdminLayoutPage";
import AdminModulePage from "./pages/admin/AdminModulePage";
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

          <Route element={<RoleRoute allowedRoles={["faculty"]} />}>
            <Route path="/faculty-dashboard" element={<FacultyDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminLayoutPage />}>
              <Route index element={<AdminOverviewPage />} />
              {adminModuleRoutes.map((module) => (
                <Route key={module.path} path={module.path} element={<AdminModulePage module={module} />} />
              ))}
              <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
