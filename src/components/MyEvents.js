import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import '../styles/MyEvents.css';

function MyEvents() {
  const { currentUser } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        // Get user's registered events
        const registrationsQuery = query(
          collection(db, 'eventRegistrations'),
          where('userId', '==', currentUser.uid)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);
        const registrations = registrationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Separate events into upcoming and past
        const now = new Date();
        const upcoming = [];
        const past = [];

        for (const registration of registrations) {
          const eventDoc = await getDoc(doc(db, 'events', registration.eventId));
          const eventData = { ...eventDoc.data(), id: eventDoc.id };
          
          if (new Date(eventData.date) > now) {
            upcoming.push(eventData);
          } else {
            past.push(eventData);
          }
        }

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-events-container">
      <h1>My Events</h1>

      <section className="upcoming-events-section">
        <h2>Upcoming Events</h2>
        {upcomingEvents.length > 0 ? (
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className="event-date">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="event-details">
                  <p>{event.description}</p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Time:</strong> {new Date(event.date).toLocaleTimeString()}
                  </p>
                </div>
                <div className="event-actions">
                  <button className="view-button">View Details</button>
                  <button className="cancel-button">Cancel Registration</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No upcoming events.</p>
        )}
      </section>

      <section className="past-events-section">
        <h2>Past Events</h2>
        {pastEvents.length > 0 ? (
          <div className="events-grid">
            {pastEvents.map(event => (
              <div key={event.id} className="event-card past">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className="event-date">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="event-details">
                  <p>{event.description}</p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                </div>
                <div className="event-actions">
                  <button className="feedback-button">Provide Feedback</button>
                  <button className="photos-button">View Photos</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No past events.</p>
        )}
      </section>

      <section className="recommended-events">
        <h2>Recommended Events</h2>
        <p>Based on your interests and past attendance:</p>
        {/* Add recommended events component here */}
      </section>
    </div>
  );
}

export default MyEvents; 