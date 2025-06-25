import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPlus, 
  FiCalendar, 
  FiUser, 
  FiUsers, 
  FiStar, 
  FiTrendingUp,
  FiActivity,
  FiTarget,
  FiAward,
  FiSettings
} from 'react-icons/fi';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="student-dashboard">
      {/* Welcome Section */}
      <div className="welcome-card">
        <div className="welcome-content">
          <div>
            <h1>Welcome back, {currentUser?.displayName || 'Student'}!</h1>
            <p>Ready to explore new opportunities and connect with amazing communities?</p>
          </div>
        </div>
        <div className="stats-mini">
          <div className="stat-item">
            <FiUsers className="stat-icon" />
            <span className="stat-number">12</span>
            <span className="stat-label">Clubs</span>
          </div>
          <div className="stat-item">
            <FiCalendar className="stat-icon" />
            <span className="stat-number">8</span>
            <span className="stat-label">Events</span>
          </div>
          <div className="stat-item">
            <FiAward className="stat-icon" />
            <span className="stat-number">5</span>
            <span className="stat-label">Badges</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recommendations Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2><FiStar className="section-icon" />Recommendations</h2>
            <p>Personalized suggestions just for you</p>
          </div>
          <div className="recommendation-cards">
            <div className="activity-card">
              <div className="activity-icon">
                <FiUser />
              </div>
              <div className="activity-content">
                <h3>Complete Your Profile</h3>
                <p>Get personalized recommendations by updating your profile</p>
              </div>
            </div>
          </div>
        </section>

        {/* My Activities Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2><FiActivity className="section-icon" />My Activities</h2>
            <p>Track your engagement and progress</p>
          </div>
          <div className="activity-cards">
            <Link to="/my-clubs" className="activity-card">
              <div className="activity-icon">
                <FiUsers />
              </div>
              <div className="activity-content">
                <h3>My Clubs</h3>
                <p>View and manage your club memberships</p>
                <div className="activity-badge">4 Active</div>
              </div>
            </Link>
            <Link to="/my-events" className="activity-card">
              <div className="activity-icon">
                <FiCalendar />
              </div>
              <div className="activity-content">
                <h3>My Events</h3>
                <p>Track events you're interested in or registered for</p>
                <div className="activity-badge">2 Upcoming</div>
              </div>
            </Link>
            <Link to="/opportunities" className="activity-card">
              <div className="activity-icon">
                <FiTrendingUp />
              </div>
              <div className="activity-content">
                <h3>Opportunities</h3>
                <p>Browse and apply to new opportunities</p>
                <div className="activity-badge">15 New</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2><FiPlus className="section-icon" />Quick Actions</h2>
            <p>Create and manage your content</p>
          </div>
          <div className="action-cards">
            <Link to="/create-opportunity" className="action-card">
              <div className="card-icon">
                <FiTarget />
              </div>
              <div className="card-content">
                <h3>Create Opportunity</h3>
                <p>Share a new opportunity with the community</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>
            <Link to="/create-event" className="action-card">
              <div className="card-icon">
                <FiCalendar />
              </div>
              <div className="card-content">
                <h3>Create Event</h3>
                <p>Organize a new event for your community</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>
            <Link to="/manage" className="action-card">
              <div className="card-icon">
                <FiSettings />
              </div>
              <div className="card-content">
                <h3>Management Dashboard</h3>
                <p>Manage your opportunities and events</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard; 