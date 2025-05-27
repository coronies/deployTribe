import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPlus, 
  FiCalendar, 
  FiSettings, 
  FiUser, 
  FiUsers, 
  FiBookOpen, 
  FiStar, 
  FiTrendingUp,
  FiActivity,
  FiTarget,
  FiAward,
  FiClock
} from 'react-icons/fi';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="welcome-card">
          <div className="welcome-content">
            <h1>Welcome back, {currentUser.displayName || 'Student'}!</h1>
            <p>Ready to explore new opportunities and connect with amazing communities?</p>
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
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section quick-actions-section">
          <div className="section-header">
            <h2><FiPlus className="section-icon" />Quick Actions</h2>
            <p>Create and manage your content</p>
          </div>
          <div className="action-cards">
            <Link to="/manage/opportunities/create" className="action-card">
              <div className="card-icon">
                <FiTarget />
              </div>
              <div className="card-content">
                <h3>Create Opportunity</h3>
                <p>Share a new opportunity with the community</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>
            <Link to="/manage/events/create" className="action-card">
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

        <section className="dashboard-section activities-section">
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

        <section className="dashboard-section recommendations-section">
          <div className="section-header">
            <h2><FiStar className="section-icon" />Recommendations</h2>
            <p>Personalized suggestions just for you</p>
          </div>
          <div className="recommendation-cards">
            <div className="recommendation-placeholder">
              <div className="placeholder-icon">
                <FiUser />
              </div>
              <div className="placeholder-content">
                <h3>Complete Your Profile</h3>
                <p>Get personalized recommendations by completing your profile and taking our matching quiz</p>
                <div className="placeholder-actions">
                  <Link to="/profile" className="action-button primary">
                    <FiUser />
                    Update Profile
                  </Link>
                  <Link to="/quiz" className="action-button secondary">
                    <FiBookOpen />
                    Take Quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section recent-activity-section">
          <div className="section-header">
            <h2><FiClock className="section-icon" />Recent Activity</h2>
            <p>Your latest interactions and updates</p>
          </div>
          <div className="recent-activities">
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-details">
                <p><strong>Applied to</strong> Tech Innovation Club</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-details">
                <p><strong>Registered for</strong> AI Workshop 2024</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-details">
                <p><strong>Updated</strong> profile information</p>
                <span className="activity-time">3 days ago</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard; 