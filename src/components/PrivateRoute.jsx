import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.user.role;

    if (role && userRole !== role) {
      // Redirect to a not authorized page or login
      return <Navigate to="/login" />;
    }

    return children;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;