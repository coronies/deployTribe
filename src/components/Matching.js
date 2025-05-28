import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { calculateMatchScore } from '../utils/matchingAlgorithm';
import '../styles/Matching.css';

const EXPERIENCE_LEVELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];
const COMMITMENT_LEVELS = ['Light', 'Moderate', 'Standard', 'Dedicated', 'Intensive'];

const ClubCard = ({ club, navigate }) => (
  <div className="match-card">
    <div className="match-score">
      {club.matchDetails.total}% Match
    </div>
    <h2>{club.name}</h2>
    <p className="club-description">{club.description}</p>
    <div className="match-details">
      <div className="match-detail">
        <span>Interest Match:</span>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${club.matchDetails.details.interestMatch}%` }}
          />
        </div>
        {Math.round(club.matchDetails.details.interestMatch)}%
      </div>
      <div className="match-detail">
        <span>Commitment:</span>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${club.matchDetails.details.commitmentMatch}%` }}
          />
        </div>
        {Math.round(club.matchDetails.details.commitmentMatch)}%
      </div>
      <div className="match-detail">
        <span>Experience:</span>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${club.matchDetails.details.experienceMatch}%` }}
          />
        </div>
        {Math.round(club.matchDetails.details.experienceMatch)}%
      </div>
      <div className="match-detail">
        <span>Time Match:</span>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${club.matchDetails.details.availabilityMatch}%` }}
          />
        </div>
        {Math.round(club.matchDetails.details.availabilityMatch)}%
      </div>
    </div>
    <div className="club-tags">
      {Array.isArray(club.tags) && club.tags.length > 0 ? (
        club.tags.map((tag, index) => (
          <span key={`${club.id}-tag-${index}`} className="tag">
            {typeof tag === 'string' && tag.includes(':') ? tag.split(':')[1] : tag}
          </span>
        ))
      ) : (
        <span className="no-tags">No tags available</span>
      )}
    </div>
    <button 
      className="apply-button"
      onClick={() => navigate(`/clubs/${club.id}`)}
    >
      View Details
    </button>
  </div>
);

const Matching = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [matchedClubs, setMatchedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchAndMatchClubs = async () => {
      try {
        console.log('🔍 Starting club matching process...');
        
        if (!location.state?.quizResults) {
          setError('No quiz results found. Please take the quiz first.');
          setLoading(false);
          return;
        }

        console.log('📊 Quiz Results:', location.state.quizResults);

        const clubsSnapshot = await getDocs(collection(db, 'clubs'));
        const clubs = clubsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('🏛️ Found clubs:', clubs.length);
        console.log('📋 Club data:', clubs);

        if (!clubs || clubs.length === 0) {
          setError('No clubs found in database. Please add some clubs first using the seed data page (/seed).');
          setDebugInfo({
            quizResults: location.state.quizResults,
            clubCount: 0,
            clubs: []
          });
          setLoading(false);
          return;
        }

        const recommendations = clubs.map(club => {
          console.log(`\n🔄 Processing club: ${club.name}`);
          const matchDetails = calculateMatchScore(location.state.quizResults, club);
          console.log(`✅ Match result for ${club.name}:`, matchDetails);
          return {
            ...club,
            matchDetails
          };
        }).sort((a, b) => b.matchDetails.total - a.matchDetails.total);

        console.log('🎯 Final recommendations:', recommendations);

        setMatchedClubs(recommendations);
        setDebugInfo({
          quizResults: location.state.quizResults,
          clubCount: clubs.length,
          clubs: clubs,
          recommendations: recommendations
        });

      } catch (error) {
        console.error('❌ Error matching clubs:', error);
        setError(`Failed to match clubs: ${error.message}`);
        setDebugInfo({
          error: error.message,
          stack: error.stack
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndMatchClubs();
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="matching-container">
        <div className="loading">Finding your perfect matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matching-container">
        <div className="error">
          <h2>Matching Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/quiz')}>Take Quiz Again</button>
            <button onClick={() => navigate('/seed')}>Add Sample Data</button>
          </div>
          
          {debugInfo && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Debug Information</summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="matching-container">
      <h1>Your Club Matches</h1>
      <p className="subtitle">Based on your preferences, here are the clubs that match you best:</p>
      
      {matchedClubs.length === 0 ? (
        <div className="no-matches">
          <h3>No matches found</h3>
          <p>We couldn't find any clubs that match your preferences. Try:</p>
          <ul>
            <li>Taking the quiz again with different preferences</li>
            <li>Adding more sample clubs to the database</li>
            <li>Checking if clubs exist in the database</li>
          </ul>
          <div className="error-actions">
            <button onClick={() => navigate('/quiz')}>Take Quiz Again</button>
            <button onClick={() => navigate('/seed')}>Add Sample Data</button>
          </div>
        </div>
      ) : (
        <div className="matches-grid">
          {matchedClubs.map((club) => (
            <ClubCard key={club.id} club={club} navigate={navigate} />
          ))}
        </div>
      )}
      
      {debugInfo && (
        <details style={{ marginTop: '40px' }}>
          <summary>Debug Information (Click to expand)</summary>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '400px',
            textAlign: 'left'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default Matching; 