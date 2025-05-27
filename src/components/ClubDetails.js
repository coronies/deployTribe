import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaDiscord, FaGlobe, FaSlack } from 'react-icons/fa';
import '../styles/ClubDetails.css';

const ClubDetails = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        const clubDoc = await getDoc(doc(db, 'clubs', clubId));
        if (clubDoc.exists()) {
          setClub({ id: clubDoc.id, ...clubDoc.data() });
        } else {
          setError('Club not found');
        }
      } catch (error) {
        console.error('Error fetching club details:', error);
        setError('Failed to load club details');
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  const getSocialIcon = (url) => {
    if (url.includes('github.com')) return <FaGithub />;
    if (url.includes('linkedin.com')) return <FaLinkedin />;
    if (url.includes('twitter.com')) return <FaTwitter />;
    if (url.includes('instagram.com')) return <FaInstagram />;
    if (url.includes('discord.gg')) return <FaDiscord />;
    if (url.includes('slack.com')) return <FaSlack />;
    return <FaGlobe />;
  };

  if (loading) {
    return (
      <div className="club-details-container">
        <div className="loading">Loading club details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-details-container">
        <div className="error">
          {error}
          <button onClick={() => navigate('/clubs')}>Back to Clubs</button>
        </div>
      </div>
    );
  }

  if (!club) return null;

  return (
    <div className="club-details-container">
      <div className="club-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{club.name}</h1>
      </div>

      <div className="club-content">
        <div className="main-info">
          <div className="description-section">
            <h2>About</h2>
            <p>{club.description}</p>
          </div>

          {club.socialLinks && Object.keys(club.socialLinks).length > 0 && (
            <div className="social-links">
              <h2>Connect With Us</h2>
              <div className="social-icons">
                {Object.entries(club.socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    >
                      {getSocialIcon(url)}
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          <div className="details-grid">
            <div className="detail-item">
              <h3>Commitment Level</h3>
              <p>{club.commitmentLevel}</p>
            </div>
            <div className="detail-item">
              <h3>Experience Level</h3>
              <p>{club.experienceLevel}</p>
            </div>
          </div>

          <div className="meeting-times">
            <h2>Meeting Times</h2>
            <div className="schedule-grid">
              {club.meetingTimes?.map((meeting, index) => (
                <div key={index} className="schedule-item">
                  <h4>{meeting.day}</h4>
                  <p>{meeting.startTime} - {meeting.endTime}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="tags-section">
            <h2>Areas of Focus</h2>
            <div className="tags-grid">
              {club.tags?.map((tag, index) => {
                const [category, subTag] = tag.split(':');
                return (
                  <div key={index} className="tag">
                    <span className="category">{category}</span>
                    <span className="subtag">{subTag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="action-section">
          <button className="join-button">
            Apply to Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails; 