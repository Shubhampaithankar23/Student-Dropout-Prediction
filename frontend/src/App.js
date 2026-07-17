import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { fetchNotifications } from './store/slices/notificationSlice';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';

// Auth Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import StudentsPage from './pages/dashboard/StudentsPage';
import StudentDetailPage from './pages/dashboard/StudentDetailPage';
import AddStudentPage from './pages/dashboard/AddStudentPage';
import PredictionsPage from './pages/dashboard/PredictionsPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import CounselingPage from './pages/dashboard/CounselingPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import UsersPage from './pages/dashboard/UsersPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import AuditLogPage from './pages/dashboard/AuditLogPage';

// Loading
import LoadingScreen from './components/common/LoadingScreen';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, initializing } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    } else {
      // No token, done initializing
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      // Poll notifications every 60 seconds
      const interval = setInterval(() => dispatch(fetchNotifications()), 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  if (token && initializing) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/students" element={<StudentsPage />} />
          <Route path="/dashboard/students/add" element={
            <RoleRoute roles={['admin', 'teacher']}><AddStudentPage /></RoleRoute>
          } />
          <Route path="/dashboard/students/:id/edit" element={
            <RoleRoute roles={['admin', 'teacher']}><AddStudentPage editMode /></RoleRoute>
          } />
          <Route path="/dashboard/students/:id" element={<StudentDetailPage />} />
          <Route path="/dashboard/predictions" element={<PredictionsPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
          <Route path="/dashboard/counseling" element={
            <RoleRoute roles={['admin', 'counselor']}><CounselingPage /></RoleRoute>
          } />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/users" element={
            <RoleRoute roles={['admin']}><UsersPage /></RoleRoute>
          } />
          <Route path="/dashboard/settings" element={
            <RoleRoute roles={['admin']}><SettingsPage /></RoleRoute>
          } />
          <Route path="/dashboard/audit-log" element={
            <RoleRoute roles={['admin']}><AuditLogPage /></RoleRoute>
          } />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
