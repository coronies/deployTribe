import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const ALLOWED_PATHS = ['/login', '/register'];

const SetupRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSetup = () => {
      // If not loading and no user, redirect to login
      if (!loading && !currentUser) {
        navigate('/login');
        return;
      }

      // If user is not a club account, allow normal navigation
      if (!loading && currentUser?.userType !== 'club') {
        return;
      }

      // For club accounts:
      if (!loading && currentUser?.userType === 'club') {
        // If setup is complete, allow access to requested page
        if (currentUser?.clubData?.isSetupComplete) {
          return;
        }

        // If setup is not complete:
        if (!currentUser?.clubData?.isSetupComplete) {
          // Allow access only to login/register pages
          if (ALLOWED_PATHS.includes(location.pathname)) {
            return;
          }
          
          // If not on setup page, redirect to setup
          if (location.pathname !== '/club-setup') {
            navigate('/club-setup');
          }
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