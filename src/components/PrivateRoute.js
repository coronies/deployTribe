import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ children, allowedUserTypes = null }) => {
  const { currentUser, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check user type if specified
  if (allowedUserTypes && !allowedUserTypes.includes(currentUser.userType)) {
    // Redirect to appropriate dashboard based on user type
    if (currentUser.userType === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (currentUser.userType === 'club') {
      return <Navigate to="/club-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute; 