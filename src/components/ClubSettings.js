import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ClubSetup from './ClubSetup';
import '../styles/ClubSettings.css';

const ClubSettings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    const fetchUserClubs = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        // Query clubs where the user is the creator
        const clubsQuery = query(
          collection(db, 'clubs'),
          where('createdBy', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(clubsQuery);
        const clubs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUserClubs(clubs);
        if (clubs.length > 0) {
          setSelectedClub(clubs[0]);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
        setError('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };

    fetchUserClubs();
  }, [currentUser, navigate]);

  if (loading) {
    return <div className="club-settings-container loading">Loading...</div>;
  }

  if (error) {
    return <div className="club-settings-container error">Error: {error}</div>;
  }

  if (userClubs.length === 0) {
    return (
      <div className="club-settings-container empty">
        <h2>No Clubs Found</h2>
        <p>You haven't created any clubs yet.</p>
        <button 
          className="create-club-button"
          onClick={() => navigate('/create-club')}
        >
          Create a Club
        </button>
      </div>
    );
  }

  return (
    <div className="club-settings-container">
      <div className="club-selector">
        <h2>Select Club to Edit</h2>
        <select
          value={selectedClub?.id || ''}
          onChange={(e) => {
            const club = userClubs.find(c => c.id === e.target.value);
            setSelectedClub(club);
          }}
        >
          {userClubs.map(club => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClub && (
        <ClubSetup
          isEditMode={true}
          initialData={selectedClub}
          clubId={selectedClub.id}
        />
      )}
    </div>
  );
};

export default ClubSettings; 