import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, getDoc, collection, getDocs } from 'firebase/firestore';
import '../styles/Events.css';

// Sample events data
const SAMPLE_EVENTS = [
  {
    id: 'event1',
    title: 'Tech Startup Workshop',
    clubId: 'club1',
    clubName: 'Entrepreneurship Society',
    date: '2024-04-15T14:00:00',
    location: 'Innovation Hub - Room 201',
    description: 'Join us for an intensive workshop on launching your tech startup. Learn from successful founders and industry experts.',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
    category: 'Workshop',
    capacity: 50,
    attendees: [],
    requirements: 'Laptop recommended',
    price: 'Free'
  },
  {
    id: 'event2',
    title: 'Annual Hackathon 2024',
    clubId: 'club2',
    clubName: 'Code Club',
    date: '2024-04-20T09:00:00',
    location: 'Computer Science Building',
    description: '24-hour hackathon focused on AI and machine learning projects. Great prizes and networking opportunities!',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    category: 'Competition',
    capacity: 100,
    attendees: [],
    requirements: 'Basic programming knowledge',
    price: '$10'
  },
  {
    id: 'event3',
    title: 'Cultural Night Festival',
    clubId: 'club3',
    clubName: 'International Students Association',
    date: '2024-04-25T18:00:00',
    location: 'Student Center - Grand Hall',
    description: 'Experience diverse cultures through food, music, dance, and traditional performances.',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    category: 'Social',
    capacity: 200,
    attendees: [],
    requirements: 'None',
    price: '$15'
  },
  {
    id: 'event4',
    title: 'Environmental Sustainability Forum',
    clubId: 'club4',
    clubName: 'Green Initiative Club',
    date: '2024-04-30T15:00:00',
    location: 'Science Center Auditorium',
    description: 'Panel discussion on climate change and sustainable practices, featuring environmental experts and activists.',
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e694',
    category: 'Forum',
    capacity: 150,
    attendees: [],
    requirements: 'None',
    price: 'Free'
  }
];

const EventCard = ({ event, variant }) => {
  const getCardClass = () => {
    switch (variant) {
      case 'minimal':
        return 'event-card minimal';
      case 'gradient':
        return 'event-card gradient';
      case 'image':
        return 'event-card image-based';
      case 'modern':
        return 'event-card modern';
      default:
        return 'event-card standard';
    }
  };

  return (
    <div className={getCardClass()}>
      <div className="event-date">
        <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
        <span className="day">{new Date(event.date).getDate()}</span>
      </div>
      
      <div className="event-content">
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="detail">
            <i className="icon">🕒</i>
            <span>{event.time}</span>
          </div>
          <div className="detail">
            <i className="icon">📍</i>
            <span>{event.location}</span>
          </div>
          {event.clubName && (
            <div className="detail">
              <i className="icon">👥</i>
              <span>{event.clubName}</span>
            </div>
          )}
        </div>

        <div className="event-tags">
          {event.tags?.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>

        <div className="event-actions">
          <button className="register-btn">Register Now</button>
          <button className="details-btn">Learn More</button>
        </div>
      </div>
    </div>
  );
};

function Events() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        setRegisteredEvents(userData.registeredEvents || []);
      } catch (error) {
        console.error('Error loading user events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, [currentUser]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      // Update user's registered events
      await updateDoc(doc(db, 'users', currentUser.uid), {
        registeredEvents: arrayUnion(eventId)
      });

      // Update event's attendees
      await updateDoc(doc(db, 'events', eventId), {
        attendees: arrayUnion({
          userId: currentUser.uid,
          name: currentUser.displayName,
          registrationDate: new Date().toISOString()
        })
      });

      setRegisteredEvents([...registeredEvents, eventId]);
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const isRegistered = (eventId) => {
    return registeredEvents.includes(eventId);
  };

  const getTimeLeft = (date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diff = eventDate - now;

    if (diff < 0) return 'Event ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days left`;
    return `${hours} hours left`;
  };

  const filteredEvents = filter === 'all' 
    ? SAMPLE_EVENTS 
    : filter === 'registered' 
      ? SAMPLE_EVENTS.filter(event => isRegistered(event.id))
      : SAMPLE_EVENTS.filter(event => !isRegistered(event.id));

  if (loading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <h2>Loading events...</h2>
      </div>
    );
  }

  // Use sample events if no real events exist
  const displayEvents = events.length > 0 ? events : SAMPLE_EVENTS;

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Upcoming Events</h1>
        <div className="filter-buttons">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={`filter-button ${filter === 'registered' ? 'active' : ''}`}
            onClick={() => setFilter('registered')}
          >
            My Events
          </button>
          <button 
            className={`filter-button ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Available
          </button>
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.map((event, index) => (
          <EventCard 
            key={event.id} 
            event={event}
            variant={['minimal', 'gradient', 'image', 'modern'][index % 4]}
          />
        ))}
      </div>
    </div>
  );
}

export default Events; 