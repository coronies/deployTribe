import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const SetupRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSetup = () => {
      // If not loading and either no user or not a club account
      if (!loading && (!currentUser || currentUser.userType !== 'club')) {
        navigate('/login');
        return;
      }

      // If user is a club and setup is complete, redirect to dashboard
      if (!loading && currentUser?.userType === 'club' && currentUser?.clubData?.isSetupComplete) {
        navigate('/club-dashboard');
        return;
      }

      // If user is on a different page and setup is not complete, redirect back to setup
      if (!loading && 
          currentUser?.userType === 'club' && 
          !currentUser?.clubData?.isSetupComplete && 
          location.pathname !== '/club-setup') {
        navigate('/club-setup');
      }
    };

    checkSetup();
  }, [currentUser, loading, navigate, location]);

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  // If all checks pass, render the setup page
  return children;
};

export default SetupRoute; 