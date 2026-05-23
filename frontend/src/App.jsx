import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CourseWorkspace from "./pages/CourseWorkspace";
import LandingPage from "./pages/LandingPage";
import CertificateViewer from "./pages/CertificateViewer";
import CourseManager from "./pages/CourseManager";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Register from "./pages/Register";
import CourseCatalog from "./pages/CourseCatalog";
import Success from "./pages/Success";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Workspace Route */}
        <Route
          path="/course/:courseId"
          element={
            <ProtectedRoute>
              <CourseWorkspace />
            </ProtectedRoute>
          }
        />
        {/* NEW: The secured Certificate Route */}
        <Route path="/certificate/:courseId" element={
          <ProtectedRoute>
            <CertificateViewer />
          </ProtectedRoute>
        } />
        <Route path="/manage/course/:courseId" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
            <CourseManager />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />

        <Route path="/catalog" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR', 'EMPLOYEE']}>
            <CourseCatalog />
          </ProtectedRoute>
        } />

        <Route path="/checkout/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR', 'EMPLOYEE']}>
            <Checkout />
          </ProtectedRoute>
        } />

        <Route path="/success" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR', 'EMPLOYEE']}>
            <Success />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;