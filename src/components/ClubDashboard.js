import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import '../styles/Dashboard.css';

function ClubDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clubData, setClubData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClubData = useCallback(async () => {
    if (!currentUser || currentUser.userType !== 'club') {
      navigate('/');
      return;
    }

    try {
      // Load club profile data
      const clubDoc = await getDoc(doc(db, 'clubs', currentUser.uid));
      if (!clubDoc.exists()) {
        console.error('Club document not found');
        navigate('/');
        return;
      }
      setClubData(clubDoc.data());

      // Load pending applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('clubId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);

      // Load upcoming events
      const eventsQuery = query(
        collection(db, 'events'),
        where('clubId', '==', currentUser.uid),
        where('date', '>=', new Date())
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

  const handleApplicationResponse = async (applicationId, status) => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      const applicationDoc = await getDoc(applicationRef);
      const applicationData = applicationDoc.data();

      // Update application status
      await updateDoc(applicationRef, {
        status: status,
        responseDate: new Date().toISOString()
      });

      // If accepted, add student to club members
      if (status === 'accepted') {
        const clubRef = doc(db, 'clubs', currentUser.uid);
        await updateDoc(clubRef, {
          members: arrayUnion({
            userId: applicationData.userId,
            name: applicationData.studentName,
            joinDate: new Date().toISOString()
          })
        });

        // Add club to student's joined clubs
        const userRef = doc(db, 'users', applicationData.userId);
        await updateDoc(userRef, {
          joinedClubs: arrayUnion({
            clubId: currentUser.uid,
            clubName: clubData.name,
            joinDate: new Date().toISOString()
          })
        });

        // Add join activity to club's recent activity
        await updateDoc(clubRef, {
          recentActivity: arrayUnion({
            type: 'join',
            memberName: applicationData.studentName,
            timestamp: new Date().toISOString()
          })
        });
      }

      // Refresh club data
      loadClubData();
    } catch (error) {
      console.error('Error handling application response:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!clubData) {
    return <div className="dashboard-error">Error loading club data</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {clubData?.name || 'Club Admin'}!</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/club-settings')} className="settings-button">
            Edit Club Settings
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button onClick={() => navigate('/club-settings')}>
              Edit Club Profile
            </button>
            <button onClick={() => navigate('/manage/events/create')}>
              Create Event
            </button>
            <button onClick={() => navigate('/manage/opportunities/create')}>
              Create Opportunity
            </button>
          </div>
        </div>

        {/* Club Stats */}
        <div className="dashboard-card stats">
          <h2>Club Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{clubData?.members?.length || 0}</span>
              <span className="stat-label">Total Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{applications.length}</span>
              <span className="stat-label">Pending Applications</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{events.length}</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{clubData?.totalEvents || 0}</span>
              <span className="stat-label">Events Hosted</span>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="dashboard-card profile-completion">
          <h2>Profile Completion</h2>
          <div className="completion-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${calculateProfileCompletion(clubData)}%` 
              }} 
            />
          </div>
          <div className="completion-tasks">
            <div className="task">
              <span className="task-label">Logo</span>
              <span className={`task-status ${clubData?.logoUrl ? 'completed' : ''}`}>
                {clubData?.logoUrl ? '✓' : '○'}
              </span>
            </div>
            <div className="task">
              <span className="task-label">Description</span>
              <span className={`task-status ${clubData?.description ? 'completed' : ''}`}>
                {clubData?.description ? '✓' : '○'}
              </span>
            </div>
            <div className="task">
              <span className="task-label">Categories</span>
              <span className={`task-status ${clubData?.categories?.length ? 'completed' : ''}`}>
                {clubData?.categories?.length ? '✓' : '○'}
              </span>
            </div>
            <div className="task">
              <span className="task-label">Contact Info</span>
              <span className={`task-status ${clubData?.contactInfo ? 'completed' : ''}`}>
                {clubData?.contactInfo ? '✓' : '○'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        {applications.length > 0 && (
          <div className="dashboard-card applications">
            <h2>Recent Applications</h2>
            <div className="applications-list">
              {applications.slice(0, 5).map(app => (
                <div key={app.id} className="application-item">
                  <span>{app.studentName}</span>
                  <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                  <button onClick={() => navigate(`/applications/${app.id}`)}>
                    Review
                  </button>
                </div>
              ))}
            </div>
            {applications.length > 5 && (
              <button onClick={() => navigate('/applications')} className="view-all">
                View All Applications
              </button>
            )}
          </div>
        )}

        {/* Upcoming Events */}
        {events.length > 0 && (
          <div className="dashboard-card events">
            <h2>Upcoming Events</h2>
            <div className="events-list">
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="event-item">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            {events.length > 3 && (
              <button onClick={() => navigate('/manage-events')} className="view-all">
                View All Events
              </button>
            )}
          </div>
        )}

        {/* Member Activity */}
        <div className="dashboard-card member-activity">
          <h2>Recent Member Activity</h2>
          <div className="activity-list">
            {clubData?.recentActivity?.slice(0, 5).map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">
                  {getActivityIcon(activity.type)}
                </span>
                <div className="activity-details">
                  <p>
                    <strong>{activity.memberName}</strong> {getActivityDescription(activity)}
                  </p>
                  <span className="activity-time">
                    {formatActivityTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {(!clubData?.recentActivity || clubData.recentActivity.length === 0) && (
              <p className="no-activity">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateProfileCompletion(clubData) {
  if (!clubData) return 0;
  
  const tasks = [
    !!clubData.logoUrl,
    !!clubData.description,
    !!(clubData.categories?.length),
    !!clubData.contactInfo
  ];
  
  return Math.round((tasks.filter(Boolean).length / tasks.length) * 100);
}

function getActivityIcon(type) {
  const icons = {
    'join': '👋',
    'event': '📅',
    'post': '📝',
    'achievement': '🏆',
    'default': '📌'
  };
  return icons[type] || icons.default;
}

function getActivityDescription(activity) {
  switch (activity.type) {
    case 'join':
      return 'joined the club';
    case 'event':
      return `attended ${activity.eventName}`;
    case 'post':
      return 'made a new post';
    case 'achievement':
      return `earned the ${activity.achievementName} badge`;
    default:
      return 'performed an action';
  }
}

function formatActivityTime(timestamp) {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return activityTime.toLocaleDateString();
  }
}

export default ClubDashboard; 