import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyClubs.css';
import { FaChevronRight, FaUsers, FaFolderOpen, FaClock, FaStar } from 'react-icons/fa';

const MyClubs = () => {
  const navigate = useNavigate();

  const handleSeeMembers = (clubId) => {
    navigate(`/club/${clubId}/members`);
  };

  const handleInternalResources = (clubId) => {
    navigate(`/club/${clubId}/resources`);
  };

  return (
    <div className="my-clubs-container">
      <h1>My Clubs</h1>

      {/* Club Memberships Section */}
      <section className="section-container memberships-section">
        <h2 className="section-title">
          <FaUsers />
          Club Memberships
        </h2>
        <div className="clubs-grid">
          <div className="club-card">
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60" 
              alt="Software Development Club" 
              className="club-image" 
            />
            <span className="club-category">Technology</span>
            <h3 className="club-name">Software Development Club</h3>
            <div className="member-info">
              <span>Member</span>
            </div>
            <div className="member-since">Member since 1/14/2024</div>
            <div className="next-event">
              <div className="event-title">Code Review Workshop</div>
              <div className="event-date">3/19/2024</div>
            </div>
            <div className="club-actions">
              <button className="view-button">View Club</button>
              <button className="chat-button">Chat</button>
              <button 
                className="members-button"
                onClick={() => handleSeeMembers('software-dev-club')}
              >
                <FaUsers /> See Members
              </button>
              <button 
                className="resources-button"
                onClick={() => handleInternalResources('software-dev-club')}
              >
                <FaFolderOpen /> Internal Resources
              </button>
            </div>
          </div>

          <div className="club-card">
            <img 
              src="https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&auto=format&fit=crop&q=60" 
              alt="Data Science Society" 
              className="club-image" 
            />
            <span className="club-category">Technology</span>
            <h3 className="club-name">Data Science Society</h3>
            <div className="member-info">
              <span>Member</span>
            </div>
            <div className="member-since">Member since 1/31/2024</div>
            <div className="next-event">
              <div className="event-title">ML Workshop</div>
              <div className="event-date">3/24/2024</div>
            </div>
            <div className="club-actions">
              <button className="view-button">View Club</button>
              <button className="chat-button">Chat</button>
              <button 
                className="members-button"
                onClick={() => handleSeeMembers('data-science-society')}
              >
                <FaUsers /> See Members
              </button>
              <button 
                className="resources-button"
                onClick={() => handleInternalResources('data-science-society')}
              >
                <FaFolderOpen /> Internal Resources
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Applications Section */}
      <section className="section-container applications-section">
        <h2 className="section-title">
          <FaClock />
          Pending Applications
        </h2>
        <div className="application-card">
          <div className="application-info">
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60" 
              alt="AI Research Club" 
              className="club-image-small" 
            />
            <div className="application-details">
              <h3>AI Research Club</h3>
              <p>Applied: 2/29/2024</p>
              <span className="status pending">PENDING</span>
            </div>
          </div>
          <div className="application-actions">
            <button className="view-button">View Application</button>
            <button className="withdraw-button">Withdraw</button>
          </div>
        </div>
      </section>

      {/* Recommended Clubs Section */}
      <section className="section-container recommended-section">
        <h2 className="section-title">
          <FaStar />
          Recommended for You
        </h2>
        <p className="section-description">Based on your interests and activity, you might like these clubs:</p>
        <div className="recommended-grid">
          <div className="recommended-card">
            <img 
              src="https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&auto=format&fit=crop&q=60" 
              alt="Game Development Club"
              className="club-image"
            />
            <h3>Game Development Club</h3>
            <p>Create amazing games and learn game development</p>
            <span className="match-score">95% Match</span>
            <button className="view-more">
              View Club <FaChevronRight />
            </button>
          </div>

          <div className="recommended-card">
            <img 
              src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&auto=format&fit=crop&q=60" 
              alt="UX Design Club"
              className="club-image"
            />
            <h3>UX Design Club</h3>
            <p>Learn and practice user experience design</p>
            <span className="match-score">88% Match</span>
            <button className="view-more">
              View Club <FaChevronRight />
            </button>
          </div>

          <div className="recommended-card">
            <img 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60" 
              alt="Blockchain Society"
              className="club-image"
            />
            <h3>Blockchain Society</h3>
            <p>Explore blockchain technology and cryptocurrencies</p>
            <span className="match-score">82% Match</span>
            <button className="view-more">
              View Club <FaChevronRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyClubs; 