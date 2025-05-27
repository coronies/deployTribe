import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Club.css';

const Club = () => {
  const { clubId } = useParams();
  const { currentUser } = useAuth();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    try {
      const clubDoc = await getDoc(doc(db, 'clubs', clubId));
      if (clubDoc.exists()) {
        setClub(clubDoc.data());
        setShowMembers(clubDoc.data().showMembers || false);
        await loadMembers(clubDoc.data().members || []);
      } else {
        setError('Club not found');
      }
    } catch (error) {
      console.error('Error loading club:', error);
      setError('Error loading club data');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (memberIds) => {
    try {
      const memberProfiles = [];
      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        if (memberDoc.exists()) {
          memberProfiles.push({
            id: memberId,
            ...memberDoc.data()
          });
        }
      }
      setMembers(memberProfiles);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const toggleMemberVisibility = async () => {
    if (!club || !currentUser) return;
    
    // Check if current user is club admin
    if (!club.admins?.includes(currentUser.uid)) {
      setError('Only club admins can change member visibility');
      return;
    }

    try {
      const newShowMembers = !showMembers;
      await updateDoc(doc(db, 'clubs', clubId), {
        showMembers: newShowMembers
      });
      setShowMembers(newShowMembers);
    } catch (error) {
      console.error('Error updating member visibility:', error);
      setError('Failed to update member visibility');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!club) {
    return <div className="not-found">Club not found</div>;
  }

  return (
    <div className="club-container">
      <div className="club-header">
        <img src={club.clubLogo || 'default-club.png'} alt={club.name} className="club-logo" />
        <div className="club-info">
          <h1>{club.name}</h1>
          <p className="club-description">{club.description}</p>
          {club.admins?.includes(currentUser?.uid) && (
            <div className="admin-controls">
              <button onClick={toggleMemberVisibility} className="visibility-toggle">
                {showMembers ? 'Hide Members' : 'Show Members'}
              </button>
            </div>
          )}
        </div>
      </div>

      {(showMembers || club.admins?.includes(currentUser?.uid)) && (
        <div className="members-section">
          <h2>Club Members</h2>
          <div className="members-grid">
            {members.map(member => (
              <div key={member.id} className="member-card">
                <img 
                  src={member.profileImage || 'default-avatar.png'} 
                  alt={member.fullName} 
                  className="member-image"
                />
                <h3>{member.fullName}</h3>
                {member.major && <p className="member-major">{member.major}</p>}
                {member.graduationYear && <p className="member-year">Class of {member.graduationYear}</p>}
                <div className="member-social">
                  {member.socialLinks?.linkedin && (
                    <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {member.socialLinks?.github && (
                    <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="club-details">
        <div className="detail-section">
          <h2>About Us</h2>
          <p>{club.about}</p>
        </div>

        {club.meetingTimes && (
          <div className="detail-section">
            <h2>Meeting Times</h2>
            <p>{club.meetingTimes}</p>
          </div>
        )}

        {club.requirements && (
          <div className="detail-section">
            <h2>Membership Requirements</h2>
            <p>{club.requirements}</p>
          </div>
        )}

        {club.contactInfo && (
          <div className="detail-section">
            <h2>Contact Information</h2>
            <p>{club.contactInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Club; 