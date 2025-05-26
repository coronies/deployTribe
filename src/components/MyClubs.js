import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import '../styles/MyClubs.css';

function MyClubs() {
  const { currentUser } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserClubs = async () => {
      if (!currentUser) return;
      
      try {
        // Get club memberships
        const membershipQuery = query(
          collection(db, 'memberships'),
          where('userId', '==', currentUser.uid)
        );
        const membershipSnapshot = await getDocs(membershipQuery);
        const membershipData = await Promise.all(
          membershipSnapshot.docs.map(async (doc) => {
            const membershipData = doc.data();
            // Get club details
            const clubDoc = await getDoc(doc(db, 'clubs', membershipData.clubId));
            return {
              id: doc.id,
              ...membershipData,
              club: clubDoc.data()
            };
          })
        );
        setMemberships(membershipData);

        // Get applications
        const applicationQuery = query(
          collection(db, 'applications'),
          where('userId', '==', currentUser.uid)
        );
        const applicationSnapshot = await getDocs(applicationQuery);
        const applicationData = await Promise.all(
          applicationSnapshot.docs.map(async (doc) => {
            const applicationData = doc.data();
            // Get club details
            const clubDoc = await getDoc(doc(db, 'clubs', applicationData.clubId));
            return {
              id: doc.id,
              ...applicationData,
              club: clubDoc.data()
            };
          })
        );
        setApplications(applicationData);
      } catch (error) {
        console.error('Error loading clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserClubs();
  }, [currentUser]);

  const handleWithdrawApplication = async (applicationId) => {
    try {
      // Delete the application document
      await deleteDoc(doc(db, 'applications', applicationId));
      
      // Update the applications state
      setApplications(applications.filter(app => app.id !== applicationId));
      
      // Update user's applications array
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        applications: arrayRemove(applicationId)
      });
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Failed to withdraw application. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-clubs-container">
      <h1>My Clubs</h1>

      <section className="memberships-section">
        <h2>Club Memberships</h2>
        {memberships.length > 0 ? (
          <div className="clubs-grid">
            {memberships.map(membership => (
              <div key={membership.id} className="club-card">
                <img 
                  src={membership.club?.logoUrl || '/default-club-logo.png'} 
                  alt={membership.club?.name} 
                  className="club-logo"
                />
                <h3>{membership.club?.name}</h3>
                <p className="membership-status">
                  Member since {new Date(membership.joinDate).toLocaleDateString()}
                </p>
                <div className="club-actions">
                  <button className="view-button">View Club</button>
                  <button className="chat-button">Chat</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">You haven't joined any clubs yet.</p>
        )}
      </section>

      <section className="applications-section">
        <h2>Pending Applications</h2>
        {applications.length > 0 ? (
          <div className="applications-list">
            {applications.map(application => (
              <div key={application.id} className="application-card">
                <div className="application-info">
                  <h3>{application.club?.name}</h3>
                  <p>Applied: {new Date(application.appliedDate).toLocaleDateString()}</p>
                  <p>Status: <span className={`status ${application.status.toLowerCase()}`}>
                    {application.status}
                  </span></p>
                </div>
                <div className="application-actions">
                  <button className="view-button">View Application</button>
                  {application.status === 'PENDING' && (
                    <button 
                      className="withdraw-button"
                      onClick={() => handleWithdrawApplication(application.id)}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No pending applications.</p>
        )}
      </section>

      <section className="recommended-section">
        <h2>Recommended for You</h2>
        <p>Based on your interests and activity, you might like these clubs:</p>
        {/* Add recommended clubs component here */}
      </section>
    </div>
  );
}

export default MyClubs; 