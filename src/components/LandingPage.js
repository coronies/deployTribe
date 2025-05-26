import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="logo-container">
        {/* Temporarily using div instead of image */}
        <div className="logo-placeholder">Compass Logo</div>
      </div>
      <h1>Find Your Path</h1>
      <p>Discover the perfect club that matches your interests and aspirations</p>
      <Link to="/quiz" className="take-quiz-button">
        Take Quiz
      </Link>
    </div>
  );
}

export default LandingPage; 