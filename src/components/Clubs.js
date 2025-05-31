import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaDiscord, FaSlack, FaChevronDown } from 'react-icons/fa';
import { getPersonalizedRecommendations } from '../services/recommendationService';
import { getAllClubs, applyToClub } from '../services/clubService';
import '../styles/Clubs.css';

// Define the categories and their subcategories
const CATEGORIES = {
  Technology: [
    'Software Development',
    'Web Development',
    'AI/Machine Learning',
    'Cybersecurity',
    'Data Science',
    'Mobile Development',
    'Game Development'
  ],
  Business: [
    'Entrepreneurship',
    'Marketing',
    'Finance',
    'Management',
    'Consulting',
    'Investment'
  ],
  Arts: [
    'Music',
    'Dance',
    'Photography',
    'Painting',
    'Theater',
    'Film',
    'Design',
    'Creative Writing'
  ],
  Science: [
    'Physics',
    'Chemistry',
    'Biology',
    'Environmental Science',
    'Astronomy',
    'Mathematics'
  ],
  'Social Impact': [
    'Community Service',
    'Environmental',
    'Social Justice',
    'Education',
    'Healthcare',
    'Mental Health'
  ]
};

const getExperienceClass = (level) => {
  if (!level || typeof level !== 'string') return 'value-button experience-beginner';
  const levelLower = level.toLowerCase().replace(/\s+/g, '-');
  return `value-button experience-${levelLower}`;
};

const getCommitmentClass = (level) => {
  if (!level || typeof level !== 'string') return 'value-button commitment-low';
  const levelLower = level.toLowerCase().replace(/\s+/g, '-');
  return `value-button commitment-${levelLower}`;
};

const Clubs = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedClubs, setAppliedClubs] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [recommendedClubs, setRecommendedClubs] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showUserCreated, setShowUserCreated] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const fetchedClubs = await getAllClubs();
        setClubs(fetchedClubs);

        // Get recommendations if user is logged in
        if (currentUser) {
          setLoadingRecommendations(true);
          const recommendations = await getPersonalizedRecommendations(currentUser.uid);
          setRecommendedClubs(recommendations);
          setLoadingRecommendations(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        setLoading(false);
        setLoadingRecommendations(false);
      }
    };

    fetchClubs();
  }, [currentUser]);

  const handleApply = async (clubId) => {
    try {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      await applyToClub(clubId, currentUser.uid);
      setAppliedClubs([...appliedClubs, clubId]);
    } catch (error) {
      console.error('Error applying to club:', error);
      alert('Failed to apply to club. Please try again.');
    }
  };

  const handleCategorySelect = (category, subcategory = null) => {
    if (category === 'All') {
      setSelectedCategory('All');
      setSelectedSubcategories([]);
      setActiveModal(null);
      return;
    }

    if (subcategory) {
      setSelectedSubcategories(prev => {
        const newSelection = prev.includes(subcategory)
          ? prev.filter(item => item !== subcategory)
          : [...prev, subcategory];
        return newSelection;
      });
    } else {
      setActiveModal(activeModal === category ? null : category);
    }
  };

  const filteredClubs = clubs.filter(club => {
    // Filter by search term
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Filter by user created if toggle is off
    if (!showUserCreated && club.is_user_created) return false;

    // Filter by subcategories
    if (selectedSubcategories.length === 0) return true;

    return club.tags?.some(tag => {
      const [category, value] = tag.split(':');
      return selectedSubcategories.includes(value);
    });
  });

  const displayedClubs = showRecommendations ? recommendedClubs : filteredClubs;

  if (loading) {
    return <div className="loading">Loading clubs...</div>;
  }

  return (
    <div className="clubs-container">
      <div className="clubs-header">
        <h1>Discover Your Perfect Club</h1>
        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search clubs by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="filter-section">
          <div className="filter-categories">
            <button 
              className={`category-main all-button ${selectedCategory === 'All' && selectedSubcategories.length === 0 ? 'active' : ''}`}
              onClick={() => handleCategorySelect('All')}
            >
              All
            </button>
            {currentUser && (
              <>
                <button
                  className={`category-main recommendation-toggle ${showRecommendations ? 'active' : ''}`}
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  disabled={loadingRecommendations}
                >
                  {loadingRecommendations ? 'Loading...' : 'Show Recommendations'}
                </button>
                <button
                  className={`category-main user-created-toggle ${showUserCreated ? 'active' : ''}`}
                  onClick={() => setShowUserCreated(!showUserCreated)}
                >
                  {showUserCreated ? 'Hide User Created' : 'Show User Created'}
                </button>
              </>
            )}
            {Object.entries(CATEGORIES).map(([category, subcategories]) => (
              <div key={category} className="category-group">
                <button 
                  className={`category-main ${activeModal === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                  <FaChevronDown 
                    style={{ 
                      fontSize: '0.8em',
                      transform: activeModal === category ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s ease'
                    }} 
                  />
                </button>
                {activeModal === category && (
                  <div className="dropdown-content active">
                    <div className="subcategories-grid">
                      {subcategories.map(subcategory => (
                        <button
                          key={subcategory}
                          className={`subcategory ${selectedSubcategories.includes(subcategory) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategorySelect(category, subcategory);
                          }}
                        >
                          {subcategory}
                          {selectedSubcategories.includes(subcategory) && (
                            <span className="check-icon">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="clubs-grid">
        {displayedClubs.map(club => {
          const categoryTag = club.tags?.find(tag => tag.includes(':'));
          const category = categoryTag ? categoryTag.split(':')[0] : 'General';
          
          return (
            <div 
              key={club.id} 
              className={`club-card ${club.is_user_created ? 'user-created' : ''}`}
              data-category={category}
            >
              {club.is_user_created && (
                <div className="user-created-badge">
                  <span className="badge-icon">👤</span>
                  User Created
                </div>
              )}
              <img 
                src={club.logo_url || club.image_url || `https://source.unsplash.com/800x600/?${club.tags?.[0]?.split(':')[1]?.toLowerCase() || 'club'}`} 
                alt={club.name} 
                className="club-image" 
              />
              {showRecommendations && (
                <div className="recommended-badge">
                  {Math.round(club.score * 100)}% Match
                </div>
              )}
              <div className="club-header">
                <h2>{club.name}</h2>
                {club.is_user_created && club.created_by_name && (
                  <div className="creator-info">
                    <img 
                      src={club.created_by_image || '/default-avatar.png'} 
                      alt={club.created_by_name} 
                      className="creator-avatar"
                    />
                    <span>Created by {club.created_by_name}</span>
                  </div>
                )}
              </div>
              <p className="club-description">{club.description}</p>
              
              <div className="club-info">
                <div className="info-row">
                  <span className="info-label">Experience:</span>
                  <span className={getExperienceClass(club.experience_level)}>
                    {club.experience_level || 'Beginner Friendly'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Commitment:</span>
                  <span className={`value-button commitment-${(club.commitment_level || 'low').toLowerCase()}`}>
                    {club.commitment_level || 'Low (1-2 hrs/week)'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Application:</span>
                  <span className={`application-status ${club.application_required ? 'application-based' : 'open'}`}>
                    {club.application_required ? 'Application Required' : 'Open to Join'}
                  </span>
                </div>
              </div>

              <div className="club-tags">
                {club.tags?.map((tag, index) => {
                  const [category, value] = tag.split(':');
                  if (!category || !value) return null;
                  return (
                    <span 
                      key={index} 
                      className="club-tag"
                      data-category={category}
                    >
                      {value}
                    </span>
                  );
                })}
              </div>

              <div className="social-links">
                {club.social_links?.github && (
                  <a href={club.social_links.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                    <FaGithub />
                  </a>
                )}
                {club.social_links?.linkedin && (
                  <a href={club.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                    <FaLinkedin />
                  </a>
                )}
                {club.social_links?.twitter && (
                  <a href={club.social_links.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    <FaTwitter />
                  </a>
                )}
                {club.social_links?.instagram && (
                  <a href={club.social_links.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <FaInstagram />
                  </a>
                )}
                {club.social_links?.discord && (
                  <a href={club.social_links.discord} target="_blank" rel="noopener noreferrer" className="social-link discord">
                    <FaDiscord />
                  </a>
                )}
                {club.social_links?.slack && (
                  <a href={club.social_links.slack} target="_blank" rel="noopener noreferrer" className="social-link slack">
                    <FaSlack />
                  </a>
                )}
              </div>

              <div className="club-actions">
                <button 
                  className="apply-button"
                  onClick={() => handleApply(club.id)}
                  disabled={appliedClubs.includes(club.id)}
                >
                  {appliedClubs.includes(club.id) ? 'Applied' : 'Apply Now'}
                </button>
                <button 
                  className="learn-more-button"
                  onClick={() => navigate(`/clubs/${club.id}`)}
                >
                  Learn More
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Clubs; 