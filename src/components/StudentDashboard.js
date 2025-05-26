import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser.displayName || 'Student'}</h1>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <Link to="/manage/opportunities/create" className="action-card">
              <span className="action-icon">✨</span>
              <h3>Create Opportunity</h3>
              <p>Share a new opportunity with the community</p>
            </Link>
            <Link to="/manage/events/create" className="action-card">
              <span className="action-icon">🎉</span>
              <h3>Create Event</h3>
              <p>Organize a new event</p>
            </Link>
            <Link to="/manage" className="action-card">
              <span className="action-icon">📊</span>
              <h3>Management Dashboard</h3>
              <p>Manage your opportunities and events</p>
            </Link>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>My Activities</h2>
          <div className="activity-cards">
            <Link to="/my-clubs" className="activity-card">
              <h3>My Clubs</h3>
              <p>View and manage your club memberships</p>
            </Link>
            <Link to="/my-events" className="activity-card">
              <h3>My Events</h3>
              <p>Track events you're interested in or registered for</p>
            </Link>
            <Link to="/opportunities" className="activity-card">
              <h3>Opportunities</h3>
              <p>Browse and apply to opportunities</p>
            </Link>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recommendations</h2>
          <div className="recommendation-cards">
            <div className="empty-state">
              <p>Complete your profile to get personalized recommendations</p>
              <Link to="/profile" className="action-button">Update Profile</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard; 