import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import PasswordReset from './components/PasswordReset';
import Profile from './components/Profile';
import AdmissionForm from './components/AdmissionForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ParentDashboard from './components/ParentDashboard';
import PrivateRoute from './components/PrivateRoute';
import PaymentResult from './components/PaymentResult';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="Admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <PrivateRoute role="Teacher">
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute role="Student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/parent/dashboard"
          element={
            <PrivateRoute role="Parent">
              <ParentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
              <Dashboard />
          }
        />
        <Route
          path="/payment-result"
          element={
            <PrivateRoute>
              <PaymentResult />
            </PrivateRoute>
          }
        />
  <Route path="*" element={<h1>404 Not Found</h1>} />
  <Route path="/admission" element={<AdmissionForm />} />
      </Routes>
    </Router>
  );
}

export default App;