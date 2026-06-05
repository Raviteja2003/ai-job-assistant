import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import CoverLetter from "./pages/CoverLetter";
import Tracker from "./pages/Tracker";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import InterviewPrep from "./pages/InterviewPrep";
import EmailGenerator from "./pages/EmailGenerator";
import Analytics from "./pages/Analytics";
import MockInterview from "./pages/MockInterview";

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
        <Route
          path="/interview-prep"
          element={
            <AppLayout>
              <InterviewPrep />
            </AppLayout>
          }
        />
        <Route
          path="/email-generator"
          element={
            <AppLayout>
              <EmailGenerator />
            </AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout>
              <Analytics />
            </AppLayout>
          }
        />
        <Route
          path="/mock-interview"
          element={
            <AppLayout>
              <MockInterview />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
