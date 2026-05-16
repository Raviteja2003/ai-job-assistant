import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import CoverLetter from "./pages/CoverLetter";
import Tracker from "./pages/Tracker";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Results />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cover-letter"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CoverLetter />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Tracker />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}