import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, getDoc, collection, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import '../styles/Events.css';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaCalendarPlus } from 'react-icons/fa';
// Removed unused seedAllData import
import { addToGoogleCalendar } from '../utils/calendarUtils';

// Import categories from Quiz component
const CATEGORIES = {
  Technology: {
    label: 'Technology',
    subtags: [
      'Software Development',
      'Web Development',
      'AI',
      'Cybersecurity',
      'Data Science',
      'Mobile Development',
      'Game Development',
      'IoT'
    ]
  },
  Business: {
    label: 'Business',
    subtags: [
      'Entrepreneurship',
      'Marketing',
      'Finance',
      'Management',
      'Consulting',
      'Investment'
    ]
  },
  'Arts & Culture': {
    label: 'Arts & Culture',
    subtags: [
      'Music',
      'Dance',
      'Photography',
      'Painting',
      'Theater',
      'Film',
      'Design',
      'Creative Writing'
    ]
  },
  Science: {
    label: 'Science',
    subtags: [
      'Physics',
      'Chemistry',
      'Biology',
      'Environmental Science',
      'Astronomy',
      'Mathematics'
    ]
  },
  'Social Impact': {
    label: 'Social Impact',
    subtags: [
      'Community Service',
      'Environmental',
      'Social Justice',
      'Education',
      'Healthcare',
      'Mental Health'
    ]
  }
};

const EventCard = ({ event, variant }) => {
  const { currentUser } = useAuth();
  const [attendeeCount, setAttendeeCount] = useState(event.attendees?.length || 0);
  const [hasAttended, setHasAttended] = useState(false);

  useEffect(() => {
    if (currentUser && event.attendees) {
      setHasAttended(event.attendees.some(a => a.userId === currentUser.uid));
      setAttendeeCount(event.attendees.length);
    }
  }, [currentUser, event.attendees]);

  const handleAttendance = async () => {
    if (!currentUser) {
      alert('Please log in to mark attendance');
      return;
    }

    try {
      // Check if event has a valid ID
      if (!event.id) {
        console.error('Event ID is missing');
        alert('Could not update attendance: Invalid event ID');
        return;
      }

      const eventRef = doc(db, 'events', event.id);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        alert('Event not found');
        return;
      }

      const currentAttendees = eventDoc.data().attendees || [];
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      // Check if user is already attending
      const isAttending = currentAttendees.some(a => a.userId === currentUser.uid);

      if (isAttending) {
        // Remove attendance
        const updatedAttendees = currentAttendees.filter(a => a.userId !== currentUser.uid);
        await updateDoc(eventRef, {
          attendees: updatedAttendees
        });

        if (userDoc.exists()) {
          const userAttendedEvents = userDoc.data().attendedEvents || [];
          await updateDoc(userRef, {
            attendedEvents: userAttendedEvents.filter(eventId => eventId !== event.id)
          });
        }

        setAttendeeCount(prev => prev - 1);
        setHasAttended(false);
      } else {
        // Add attendance
        const newAttendee = {
          userId: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          timestamp: new Date().toISOString()
        };

        await updateDoc(eventRef, {
          attendees: arrayUnion(newAttendee)
        });

        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            attendedEvents: [event.id],
            displayName: currentUser.displayName,
            email: currentUser.email,
            createdAt: new Date().toISOString()
          });
        } else {
          await updateDoc(userRef, {
            attendedEvents: arrayUnion(event.id)
          });
        }

        setAttendeeCount(prev => prev + 1);
        setHasAttended(true);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

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
          <div className="detail attendance-count">
            <i className="detail-icon">👥</i>
            <span>Attending: {attendeeCount}</span>
          </div>
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
        <button 
          className={`attendance-btn ${hasAttended ? 'attended' : ''}`}
          onClick={handleAttendance}
        >
          <span className="btn-icon">{hasAttended ? '✅' : '🎟️'}</span>
          {hasAttended ? 'Unattend' : 'I am Attending'}
        </button>
        <button 
          className="calendar-btn"
          onClick={() => addToGoogleCalendar(event, 'event')}
          title="Add to Google Calendar"
        >
          <FaCalendarPlus className="btn-icon" />
          Add to Calendar
        </button>
        <Link to={`/events/${event.id}`} className="details-btn">
          <span className="btn-icon">📖</span>
          Learn More
        </Link>
      </div>
    </div>
  );
};

const Events = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(eventsRef, orderBy('date', 'asc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date
        }));

        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCategorySelect = (category, subcategory = null) => {
    if (category === null) {
      setSelectedCategory(null);
      setSelectedSubcategories([]);
      return;
    }

    if (subcategory) {
      setSelectedSubcategories(prev => {
        if (prev.includes(subcategory)) {
          return prev.filter(sub => sub !== subcategory);
        }
        return [...prev, subcategory];
      });
    }

    setSelectedCategory(category);
  };

  // Filter events based on search query, category, subcategories, and recommendations
  const filteredEvents = events.filter(event => {
    const titleMatch = event.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatch = event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const searchMatches = titleMatch || descriptionMatch || tagMatch;

    let categoryMatches = true;
    if (selectedCategory && selectedSubcategories.length > 0) {
      categoryMatches = event.tags?.some(tag => selectedSubcategories.includes(tag));
    } else if (selectedCategory) {
      categoryMatches = event.tags?.some(tag => CATEGORIES[selectedCategory].subtags.includes(tag));
    }

    let recommendationMatches = true;
    if (showRecommendations && currentUser) {
      // Add recommendation logic here based on user preferences
      // For now, we'll just show events that match user's interests
      const userInterests = currentUser.interests || [];
      recommendationMatches = event.tags?.some(tag => userInterests.includes(tag));
    }

    return searchMatches && categoryMatches && recommendationMatches;
  });

  return (
    <div className="events-container">
      <h1 className="events-title">Discover Your Perfect Event</h1>
      
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search events by name, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="categories-section">
        <button 
          className={`category-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => handleCategorySelect(null)}
        >
          All
        </button>
        
        {currentUser && (
          <button 
            className={`category-btn recommendation-btn ${showRecommendations ? 'active' : ''}`}
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            ⭐ Recommended
          </button>
        )}

        {Object.entries(CATEGORIES).map(([category, data]) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategorySelect(category)}
          >
            {data.label}
            {data.subtags && <FaChevronDown className={`dropdown-arrow ${selectedCategory === category ? 'active' : ''}`} />}
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {filteredEvents.length === 0 && !loading && (
        <div className="no-events">
          <h3>No events found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Events; 