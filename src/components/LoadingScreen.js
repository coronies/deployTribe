import React, { useEffect, useState } from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 2; // Slower progress
      });
    }, 50); // More frequent updates for smoother animation

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="logo-container">
          <h1 className="loading-logo-text">Tribe</h1>
        </div>
        <div className="loading-bar-container">
          <div 
            className="loading-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 