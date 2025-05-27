import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ManagementDashboard.css';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('opportunities');

  const managementActions = {
    opportunities: [
      { 
        name: 'Create New Opportunity', 
        action: () => navigate('/manage/opportunities/create'),
        icon: '✨'
      },
      { 
        name: 'View All Opportunities', 
        action: () => navigate('/manage/opportunities'),
        icon: '📋'
      },
      { 
        name: 'Review Applications', 
        action: () => navigate('/manage/applications'),
        icon: '📝'
      },
      { 
        name: 'Analytics', 
        action: () => navigate('/manage/opportunities/analytics'),
        icon: '📊'
      }
    ],
    events: [
      { 
        name: 'Create New Event', 
        action: () => navigate('/manage/events/create'),
        icon: '🎉'
      },
      { 
        name: 'View All Events', 
        action: () => navigate('/manage/events'),
        icon: '📅'
      },
      { 
        name: 'Manage Registrations', 
        action: () => navigate('/manage/registrations'),
        icon: '👥'
      },
      { 
        name: 'Event Analytics', 
        action: () => navigate('/manage/events/analytics'),
        icon: '📈'
      }
    ]
  };

  return (
    <div className="management-dashboard">
      <div className="dashboard-header">
        <h1>Management Dashboard</h1>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            Opportunities
          </button>
          <button 
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="quick-actions">
          <h2>{activeTab === 'opportunities' ? 'Opportunity Management' : 'Event Management'}</h2>
          <div className="actions-grid">
            {managementActions[activeTab].map((action, index) => (
              <button 
                key={index}
                className="action-card"
                onClick={action.action}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-name">{action.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {activeTab === 'opportunities' ? (
              <div className="empty-state">
                <p>No recent activity for opportunities</p>
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity for events</p>
              </div>
            )}
          </div>
        </section>

        <section className="analytics-summary">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            {activeTab === 'opportunities' ? (
              <>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Active Opportunities</p>
                </div>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Total Applications</p>
                </div>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Pending Reviews</p>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Upcoming Events</p>
                </div>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Total Registrations</p>
                </div>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Past Events</p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManagementDashboard; 