import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { calculateMatch } from '../utils/matchingAlgorithm';
import '../styles/MatchResults.css';

const MatchResults = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Get user preferences including university
        const prefsDoc = await getDoc(doc(db, 'studentPreferences', currentUser.uid));
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (!prefsDoc.exists() || !userDoc.exists()) {
          navigate('/quiz');
          return;
        }

        const preferences = prefsDoc.data();
        const userData = userDoc.data();
        
        // Combine preferences with user data
        const userPrefs = {
          ...preferences,
          university: userData.university,
          universityName: userData.universityName
        };
        setUserPreferences(userPrefs);

        // Get all clubs from the same university
        const clubsQuery = query(collection(db, 'clubs'));
        const clubsSnapshot = await getDocs(clubsQuery);
        
        const matchResults = [];
        clubsSnapshot.forEach((clubDoc) => {
          const clubData = clubDoc.data();
          
          // Calculate match only for clubs from the same university
          const matchScore = calculateMatch(userPrefs, clubData);
          
          if (matchScore) { // Will be null if universities don't match
            matchResults.push({
              id: clubDoc.id,
              ...clubData,
              matchDetails: matchScore
            });
          }
        });

        // Sort by match score
        matchResults.sort((a, b) => b.matchDetails.overallMatch - a.matchDetails.overallMatch);
        setMatches(matchResults);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMatches();
    }
  }, [currentUser, navigate]);

  if (loading) {
    return <div className="match-results-container">Loading matches...</div>;
  }

  if (error) {
    return <div className="match-results-container">Error: {error}</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="match-results-container">
        <div className="no-matches">
          <h2>No Matches Found</h2>
          <p>We couldn't find any clubs matching your preferences at {userPreferences?.universityName}.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="update-preferences-button"
          >
            Update Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="match-results-container">
      <div className="results-header">
        <h1>Your Club Matches at {userPreferences?.universityName}</h1>
        <button
          onClick={() => navigate('/quiz')}
          className="update-preferences-button"
        >
          Update Preferences
        </button>
      </div>

      <div className="matches-grid">
        {matches.map((club) => (
          <div key={club.id} className="match-card">
            <div className="match-header">
              <h2>{club.name}</h2>
              <span className="match-score">
                {Math.round(club.matchDetails.overallMatch * 100)}% Match
              </span>
            </div>

            <div className="match-details">
              <div className="match-category">
                <label>Interest Match:</label>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${club.matchDetails.details.interestMatch * 100}%` }}
                  />
                </div>
              </div>

              <div className="match-category">
                <label>Time Compatibility:</label>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${club.matchDetails.details.timeCompatibility * 100}%` }}
                  />
                </div>
              </div>

              <div className="match-category">
                <label>Commitment Level Match:</label>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${club.matchDetails.details.commitmentMatch * 100}%` }}
                  />
                </div>
              </div>

              <div className="match-category">
                <label>Experience Level Match:</label>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${club.matchDetails.details.experienceMatch * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="club-info">
              <p>{club.description}</p>
              <button
                onClick={() => navigate(`/club/${club.id}`)}
                className="view-club-button"
              >
                View Club Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchResults; 