import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, getDoc, collection, getDocs } from 'firebase/firestore';
import '../styles/Events.css';
import { Link } from 'react-router-dom';

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
        return 'event-card image';
      case 'modern':
        return 'event-card modern';
      default:
        return 'event-card minimal';
    }
  };

  // Handle both date and startDate fields for compatibility
  const eventDate = event.startDate || event.date;
  let displayDate;
  
  try {
    if (eventDate) {
      // Handle Firestore timestamp objects
      if (eventDate.toDate && typeof eventDate.toDate === 'function') {
        displayDate = eventDate.toDate();
      } else if (eventDate.seconds) {
        // Firestore timestamp with seconds
        displayDate = new Date(eventDate.seconds * 1000);
      } else {
        displayDate = new Date(eventDate);
      }
    } else {
      displayDate = new Date();
    }
    
    // Check if date is valid
    if (isNaN(displayDate.getTime())) {
      displayDate = new Date();
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    displayDate = new Date();
  }

  // Check if event is happening soon
  const isUpcoming = () => {
    const now = new Date();
    const timeDiff = displayDate - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  };

  // Get appropriate icon for event mode
  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online':
        return '💻';
      case 'in-person':
        return '🏢';
      case 'hybrid':
        return '🔄';
      default:
        return '📍';
    }
  };

  return (
    <div className={getCardClass()}>
      {isUpcoming() && (
        <div className="event-badge">
          <span>🔥 Happening Soon!</span>
        </div>
      )}
      
      <div className="event-card-header">
        <div className="event-date">
          <span className="month">{displayDate.toLocaleString('default', { month: 'short' })}</span>
          <span className="day">{displayDate.getDate()}</span>
        </div>
        <h3 className="event-title">{event.title || 'Untitled Event'}</h3>
        <div className="event-organizer">
          <span className="organizer-icon">🏛️</span>
          <span className="organizer-name">{event.organization || event.clubName || 'No organization'}</span>
        </div>
        {event.price && (
          <div className={`event-price ${event.price === 'Free' ? 'free' : 'paid'}`}>
            {event.price === 'Free' ? '🆓 Free' : `💰 ${event.price}`}
          </div>
        )}
      </div>
      
      <div className="event-card-body">
        <p className="event-description">{event.description || 'No description available'}</p>
        
        <div className="event-tags">
          {event.tags && event.tags.length > 0 ? (
            event.tags.map((tag, index) => (
              <span key={index} className="tag">🏷️ {tag}</span>
            ))
          ) : (
            <span className="tag">🏷️ General</span>
          )}
        </div>
        
        <div className="event-details">
          <div className="detail">
            <i className="detail-icon">⏰</i>
            <span>{displayDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}</span>
          </div>
          <div className="detail">
            <i className="detail-icon">📍</i>
            <span>{event.location || 'Location TBD'}</span>
          </div>
          {event.capacity && (
            <div className="detail">
              <i className="detail-icon">👥</i>
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
          {event.mode && (
            <div className="detail">
              <i className="detail-icon">{getModeIcon(event.mode)}</i>
              <span>{event.mode}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="event-card-footer">
        <button 
          className="register-btn"
          onClick={() => {
            if (event.registrationLink) {
              window.open(event.registrationLink, '_blank');
            } else {
              alert('Registration link not available');
            }
          }}
        >
          <span className="btn-icon">🎟️</span>
          {event.ctaText || 'Register Now'}
        </button>
        <Link to={`/events/${event.id}`} className="details-btn">
          <span className="btn-icon">📖</span>
          Learn More
        </Link>
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
      }
    };

    if (currentUser) {
      loadUserEvents();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched events:', eventsList);
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
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

  // Filter events based on selected filter
  const filteredEvents = filter === 'all' 
    ? events 
    : filter === 'recommended' 
      ? events.filter(event => {
          // Show events that are:
          // 1. Free events
          // 2. Events with popular tags (Technology, Business, Workshop, etc.)
          // 3. Events with high capacity (indicating they're popular)
          // 4. Events happening soon
          const isFree = event.price === 'Free' || !event.price;
          const hasPopularTags = event.tags && event.tags.some(tag => 
            ['Technology', 'Business', 'Workshop', 'Networking', 'Career', 'AI', 'Software Development'].includes(tag)
          );
          const hasHighCapacity = event.capacity && event.capacity >= 100;
          
          const eventDate = event.startDate || event.date;
          let isHappeningSoon = false;
          try {
            const displayDate = eventDate.toDate ? eventDate.toDate() : new Date(eventDate);
            const now = new Date();
            const timeDiff = displayDate - now;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            isHappeningSoon = daysDiff <= 14 && daysDiff > 0;
          } catch (error) {
            // Ignore date parsing errors
          }
          
          return isFree || hasPopularTags || hasHighCapacity || isHappeningSoon;
        })
      : filter === 'registered' 
        ? events.filter(event => isRegistered(event.id))
        : events.filter(event => !isRegistered(event.id));

  if (loading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <h2>🔍 Discovering Amazing Events...</h2>
        <p>✨ Finding the perfect opportunities just for you</p>
      </div>
    );
  }

  // Use sample events as fallback only if no real events exist
  const displayEvents = events.length > 0 ? filteredEvents : SAMPLE_EVENTS;

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>🌟 Upcoming Events</h1>
        <p className="events-subtitle">🎯 Discover amazing opportunities to learn, connect, and grow</p>
        <div className="filter-buttons">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="filter-icon">🌟</span>
            All Events
          </button>
          <button 
            className={`filter-button ${filter === 'recommended' ? 'active' : ''}`}
            onClick={() => setFilter('recommended')}
          >
            <span className="filter-icon">🎯</span>
            Recommended
          </button>
          <button 
            className={`filter-button ${filter === 'registered' ? 'active' : ''}`}
            onClick={() => setFilter('registered')}
          >
            <span className="filter-icon">📅</span>
            My Events
          </button>
          <button 
            className={`filter-button ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            <span className="filter-icon">🎪</span>
            Available
          </button>
        </div>
      </div>

      <div className="events-grid">
        {displayEvents.map((event, index) => (
          <EventCard 
            key={event.id} 
            event={event}
            variant={['minimal', 'gradient', 'image', 'modern'][index % 4]}
          />
        ))}
      </div>

      {events.length === 0 && (
        <div className="no-events">
          <div className="no-events-icon">🎪</div>
          <h3>🔍 No Events Found</h3>
          <p>🚀 Be the first to create an amazing event for your community!</p>
          <Link to="/create-event" className="create-event-btn">
            <span className="btn-icon">✨</span>
            Create Event
          </Link>
        </div>
      )}
    </div>
  );
}

export default Events; 