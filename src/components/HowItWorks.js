import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HowItWorks.css';

function HowItWorks() {
  return (
    <div className="how-it-works-container">
      <div className="how-it-works-header">
        <h1>How ConnectClub Works</h1>
        <p className="subtitle">Your Journey to Finding the Perfect Club Match</p>
      </div>

      <div className="steps-container">
        <div className="step-card">
          <div className="step-number">1</div>
          <h2>Take the Quiz</h2>
          <p>
            Start by taking our personalized matching quiz. We'll ask about your
            interests, availability, and what you're looking to get out of your
            club experience.
          </p>
          <Link to="/quiz" className="step-link">Take the Quiz</Link>
        </div>

        <div className="step-card">
          <div className="step-number">2</div>
          <h2>Explore Matches</h2>
          <p>
            Based on your quiz results, we'll show you clubs that best match your
            profile. Browse through detailed club profiles, events, and member
            reviews.
          </p>
          <Link to="/clubs" className="step-link">Explore Clubs</Link>
        </div>

        <div className="step-card">
          <div className="step-number">3</div>
          <h2>Connect & Apply</h2>
          <p>
            Found a club you like? Apply directly through our platform. Track your
            applications and get notifications about upcoming events and deadlines.
          </p>
        </div>
      </div>

      <div className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Smart Matching</h3>
            <p>Our algorithm considers multiple factors to find your perfect club match</p>
          </div>
          <div className="feature-card">
            <h3>Event Calendar</h3>
            <p>Never miss an important club event or application deadline</p>
          </div>
          <div className="feature-card">
            <h3>Club Management</h3>
            <p>Easy-to-use tools for clubs to manage members and events</p>
          </div>
          <div className="feature-card">
            <h3>Direct Communication</h3>
            <p>Connect directly with club officers and members</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join ConnectClub today and find your perfect club match!</p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">Sign Up Now</Link>
          <Link to="/clubs" className="cta-button secondary">Browse Clubs</Link>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks; 