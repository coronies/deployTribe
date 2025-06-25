import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';



// Routes that require authentication
const PROTECTED_ROUTES = [
  '/student-dashboard',
  '/club-dashboard',
  '/profile',
  '/my-clubs',
  '/my-events',
  '/club-setup',
  '/club-settings',
  '/settings',
  '/manage'
];

// Actions that require authentication (these will trigger a login prompt)
const PROTECTED_ACTIONS = [
  'create',
  'edit',
  'delete',
  'join',
  'register',
  'apply'
];

const SetupRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSetup = () => {
      // If loading, wait
      if (loading) return;

      // Check if current path is protected
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        location.pathname.startsWith(route)
      );

      // Check if current action is protected
      const hasProtectedAction = PROTECTED_ACTIONS.some(action =>
        location.pathname.includes(action)
      );

      // If it's a protected route/action and user is not logged in, redirect to login
      if ((isProtectedRoute || hasProtectedAction) && !currentUser) {
        navigate('/login', { 
          state: { 
            from: location.pathname,
            message: 'Please log in to access this feature'
          }
        });
        return;
      }

      // Handle club account specific logic
      if (currentUser?.userType === 'club') {
        // If no club data exists yet, redirect to setup
        if (!currentUser.clubData && location.pathname !== '/club-setup') {
          navigate('/club-setup');
          return;
        }

        // If setup is complete and trying to access /club-setup, redirect to dashboard
        if (currentUser.clubData?.isSetupComplete && location.pathname === '/club-setup') {
          navigate('/club-dashboard');
          return;
        }
      }
    };

    checkSetup();
  }, [currentUser, loading, navigate, location]);

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  // If all checks pass, render the children
  return children;
};

export default SetupRoute; 