import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Import all pages
import Dashboard from './pages/Dashboard';
import CourseEnrollment from './pages/CourseEnrollment';
import Grades from './pages/Grades';
import Attendance from './pages/Attendance';
import FeePayments from './pages/FeePayments';
import FacultyGrades from './pages/FacultyGrades';
import FacultyAttendance from './pages/FacultyAttendance';
import AuditLog from './pages/AuditLog';
import AdminAnalytics from './pages/AdminAnalytics';
import Login from './pages/Login'; 
import UserManagement from './pages/UserManagement';
import SetupPassword from './pages/SetupPassword'; 
import CourseManagement from './pages/CourseManagement';
import CourseAssignment from './pages/CourseAssignment'; // NEW IMPORT

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup-password" element={<SetupPassword />} /> 
        
        {/* Universal Route - Everyone gets a Dashboard */}
        <Route path="/" element={
            <ProtectedRoute allowedRoles={['student', 'lecturer', 'admin']}>
                <Dashboard />
            </ProtectedRoute>
        } />

        {/* 🎓 STUDENT ONLY ROUTES */}
        <Route path="/enrollment" element={
            <ProtectedRoute allowedRoles={['student']}>
                <CourseEnrollment />
            </ProtectedRoute>
        } />
        <Route path="/grades" element={
            <ProtectedRoute allowedRoles={['student']}>
                <Grades />
            </ProtectedRoute>
        } />
        <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
                <Attendance />
            </ProtectedRoute>
        } />
        <Route path="/fees" element={
            <ProtectedRoute allowedRoles={['student']}>
                <FeePayments />
            </ProtectedRoute>
        } />

        {/* 👨‍🏫 LECTURER ONLY ROUTES */}
        <Route path="/faculty-grades" element={
            <ProtectedRoute allowedRoles={['lecturer']}>
                <FacultyGrades />
            </ProtectedRoute>
        } />
        <Route path="/faculty-attendance" element={
            <ProtectedRoute allowedRoles={['lecturer']}>
                <FacultyAttendance />
            </ProtectedRoute>
        } />

        {/* 🛡️ ADMIN ONLY ROUTES */}
        <Route path="/audit-log" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AuditLog />
            </ProtectedRoute>
        } />
        <Route path="/admin-analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalytics />
            </ProtectedRoute>
        } />
        <Route path="/user-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
            </ProtectedRoute>
        } />
        <Route path="/course-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <CourseManagement />
            </ProtectedRoute>
        } />
        <Route path="/course-assignment" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <CourseAssignment />
            </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;