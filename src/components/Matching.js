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
      {club.tags?.map((tag, index) => (
        <span key={`${club.id}-tag-${index}`} className="tag">
          {tag}
        </span>
      ))}
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

  useEffect(() => {
    const fetchAndMatchClubs = async () => {
      try {
        if (!location.state?.quizResults) {
          setError('No quiz results found. Please take the quiz first.');
          return;
        }

        const clubsSnapshot = await getDocs(collection(db, 'clubs'));
        const clubs = clubsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (!clubs || clubs.length === 0) {
          setError('No clubs found in database. Please add some clubs first.');
          return;
        }

        const recommendations = clubs.map(club => {
          const matchDetails = calculateMatchScore(location.state.quizResults, club);
          return {
            ...club,
            matchDetails
          };
        }).sort((a, b) => b.matchDetails.total - a.matchDetails.total);

        setMatchedClubs(recommendations);
      } catch (error) {
        console.error('Error matching clubs:', error);
        setError('Failed to match clubs. Please try again.');
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
          {error}
          <button onClick={() => navigate('/quiz')}>Take Quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div className="matching-container">
      <h1>Your Club Matches</h1>
      <div className="matches-grid">
        {matchedClubs.map((club) => (
          <ClubCard key={club.id} club={club} navigate={navigate} />
        ))}
      </div>
    </div>
  );
};

export default Matching; 