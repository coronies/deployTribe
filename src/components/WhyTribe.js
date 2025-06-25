import React from 'react';
import { FaUsers, FaClock, FaSearch } from 'react-icons/fa';
import '../styles/WhyTribe.css';

const WhyTribe = () => {
  return (
    <div className="why-tribe-container">
      <div className="why-tribe-content">
        <div className="hero-section">
          <h1>Why Tribe?</h1>
          <p className="hero-subtitle">
            With Tribe, navigating campus life has never been easier. No more overwhelm, 
            no more missed deadlines, and no more endless searches for information. 
            Just a smarter, more personalized way to make the most of your university experience.
          </p>
        </div>

        <div className="problems-solutions">
          <div className="problem-section">
            <h2>The Problems We Solve</h2>
            <div className="problems-grid">
              <div className="problem-card">
                <FaUsers className="problem-icon" />
                <h3>Overwhelm</h3>
                <p>Too many clubs, events, and opportunities to choose from</p>
              </div>
              <div className="problem-card">
                <FaClock className="problem-icon" />
                <h3>Missed Deadlines</h3>
                <p>Important application dates and event registrations slip by</p>
              </div>
              <div className="problem-card">
                <FaSearch className="problem-icon" />
                <h3>Endless Searches</h3>
                <p>Scattered information across multiple platforms and websites</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyTribe; 