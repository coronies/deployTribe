import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiTag } from 'react-icons/fi';
import '../styles/EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
          
          // Check if user is registered
          if (currentUser) {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            setIsRegistered(userData.registeredEvents?.includes(eventId) || false);
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, currentUser]);

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-container">
        <div className="error">
          {error || 'Event not found'}
          <button onClick={() => navigate('/events')}>Back to Events</button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-header">
        <button className="back-button" onClick={() => navigate('/events')}>
          Back to Events
        </button>
        <h1>{event.title}</h1>
        <p className="organization">{event.organization}</p>
      </div>

      {event.imageUrl && (
        <div className="event-image">
          <img src={event.imageUrl} alt={event.title} />
        </div>
      )}

      <div className="event-content">
        <div className="event-main">
          <div className="event-section">
            <h2>About This Event</h2>
            <p className="description">{event.description}</p>
          </div>

          <div className="event-section">
            <h2>Event Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <FiCalendar />
                <div>
                  <h3>Date</h3>
                  <p>{new Date(event.startDate).toLocaleDateString()}</p>
                  {event.endDate && event.endDate !== event.startDate && (
                    <p>to {new Date(event.endDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <FiClock />
                <div>
                  <h3>Time</h3>
                  <p>{event.startTime} - {event.endTime}</p>
                </div>
              </div>

              <div className="detail-item">
                <FiMapPin />
                <div>
                  <h3>Location</h3>
                  <p>{event.location}</p>
                  <p className="mode-badge">{event.mode}</p>
                </div>
              </div>

              <div className="detail-item">
                <FiUsers />
                <div>
                  <h3>Capacity</h3>
                  <p>{event.registrationCount || 0} / {event.capacity} registered</p>
                </div>
              </div>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="event-section">
              <h2>Categories</h2>
              <div className="tags-container">
                {event.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <FiTag />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.requirements && event.requirements.length > 0 && (
            <div className="event-section">
              <h2>Requirements</h2>
              <ul className="requirements-list">
                {event.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="event-sidebar">
          <div className="registration-card">
            <h3>Registration</h3>
            <div className="registration-info">
              <p>
                <strong>Deadline:</strong>{' '}
                {new Date(event.registrationDeadline).toLocaleDateString()}
              </p>
              <p>
                <strong>Spots Available:</strong>{' '}
                {event.capacity - (event.registrationCount || 0)}
              </p>
            </div>
            {currentUser ? (
              isRegistered ? (
                <button className="registered-button" disabled>
                  Already Registered
                </button>
              ) : (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="register-button"
                >
                  {event.ctaText || 'Register Now'}
                </a>
              )
            ) : (
              <button
                className="login-button"
                onClick={() => navigate('/login')}
              >
                Log in to Register
              </button>
            )}
          </div>

          <div className="share-card">
            <h3>Share Event</h3>
            <div className="share-buttons">
              {/* Add social sharing buttons here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 