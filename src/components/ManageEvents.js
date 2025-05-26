import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import '../styles/ManageEvents.css';

function ManageEvents() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    registrationDeadline: ''
  });

  const loadEvents = useCallback(async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('clubId', '==', currentUser.uid)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadEvents();
  }, [currentUser, loadEvents]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...newEvent,
        clubId: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'UPCOMING',
        registeredCount: 0
      };

      await addDoc(collection(db, 'events'), eventData);
      setShowCreateForm(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        registrationDeadline: ''
      });
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        status: newStatus
      });
      loadEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage-events-container">
      <div className="events-header">
        <h1>Manage Events</h1>
        <button 
          className="create-event-button"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Event
        </button>
      </div>

      {showCreateForm && (
        <div className="create-event-form">
          <h2>Create New Event</h2>
          <form onSubmit={handleCreateEvent}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registration Deadline</label>
                <input
                  type="date"
                  value={newEvent.registrationDeadline}
                  onChange={(e) => setNewEvent({...newEvent, registrationDeadline: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit">Create Event</button>
              <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h3>{event.title}</h3>
              <span className={`event-status ${event.status.toLowerCase()}`}>
                {event.status}
              </span>
            </div>
            <div className="event-details">
              <p>{event.description}</p>
              <p>
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {event.time}
              </p>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
              <p>
                <strong>Registered:</strong> {event.registeredCount}/{event.capacity}
              </p>
            </div>
            <div className="event-actions">
              <button className="edit-button">Edit Details</button>
              <button 
                className="status-button"
                onClick={() => handleUpdateEventStatus(event.id, 
                  event.status === 'UPCOMING' ? 'CANCELLED' : 'UPCOMING')}
              >
                {event.status === 'UPCOMING' ? 'Cancel Event' : 'Reactivate Event'}
              </button>
              <button className="attendees-button">View Attendees</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageEvents; 