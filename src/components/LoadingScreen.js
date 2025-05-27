import React from 'react';
import '../../src/styles/LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="compass-placeholder">
          <span>⌖</span>
        </div>
      </div>
      <h2>Finding Your Perfect Match...</h2>
    </div>
  );
}

export default LoadingScreen; 