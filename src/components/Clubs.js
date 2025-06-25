import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaDiscord, FaSlack } from 'react-icons/fa';
import { FiSearch, FiX, FiStar } from 'react-icons/fi';
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



const Clubs = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedClubs, setAppliedClubs] = useState([]);
  const [recommendedClubs, setRecommendedClubs] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showUserCreated] = useState(true);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [filters, setFilters] = useState({
    experience: 'All',
    commitment: 'All'
  });

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const fetchedClubs = await getAllClubs();
        setClubs(fetchedClubs);

        // Simulate recommendations with matching percentages
        if (currentUser) {
          const recommendations = [
            { ...fetchedClubs[0], score: 0.95 }, // Software Development Club - 95% match
            { ...fetchedClubs[3], score: 0.88 }, // Data Science Club - 88% match
            { ...fetchedClubs[5], score: 0.82 }, // Game Development Club - 82% match
          ];
          setRecommendedClubs(recommendations);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        setLoading(false);
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

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCategorySelect = (category, tag) => {
    if (tag) {
      setSelectedSubcategories(prev => {
        if (prev.includes(tag)) {
          return prev.filter(t => t !== tag);
        }
        return [...prev, tag];
      });
    } else {
      setSelectedCategory(category);
      setSelectedSubcategories([]);
    }
    setShowTagsDropdown(false);
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
      const [, value] = tag.split(':');
      return selectedSubcategories.includes(value);
    });
  });

  const displayedClubs = showRecommendations ? recommendedClubs : filteredClubs;

  const getMainCategory = (tags) => {
    const categoryTag = tags.find(tag => 
      tag.startsWith('Technology:') || 
      tag.startsWith('Business:') || 
      tag.startsWith('Arts:') || 
      tag.startsWith('Science:') || 
      tag.startsWith('Social:')
    );
    
    if (categoryTag) {
      return categoryTag.split(':')[0];
    }
    return 'Technology';
  };

  if (loading) {
    return <div className="loading">Loading clubs...</div>;
  }

  return (
    <div className="clubs-container">
      <div className="clubs-header">
        <h1>Discover Your Perfect Club</h1>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-wrapper">
            <form onSubmit={(e) => e.preventDefault()} className="search-bar">
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search clubs by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    className="clear-search" 
                    onClick={() => setSearchTerm('')}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <div className="filters-row">
            <button 
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategories([]);
                setShowRecommendations(false);
              }}
            >
              All
            </button>
            {currentUser && (
              <button 
                className={`category-btn recommendation-btn ${showRecommendations ? 'active' : ''}`}
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <FiStar style={{ marginRight: '6px' }} />
                Show Recommended
              </button>
            )}
            {Object.entries(CATEGORIES).map(([category]) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-content">
          <div className="filter-group">
            <label>Experience</label>
            <select
              value={filters.experience || 'All'}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Commitment</label>
            <select
              value={filters.commitment || 'All'}
              onChange={(e) => handleFilterChange('commitment', e.target.value)}
            >
              <option value="All">All</option>
              <option value="Low">Low (1-2 hrs/week)</option>
              <option value="Medium">Medium (3-5 hrs/week)</option>
              <option value="High">High (6+ hrs/week)</option>
            </select>
          </div>

          <div className="filter-group tags-dropdown">
            <label>Tags</label>
            <div className="dropdown-wrapper">
              <button 
                type="button"
                className="tags-dropdown-button"
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              >
                {selectedSubcategories.length > 0 ? `${selectedSubcategories.length} selected` : 'Select Tags'}
              </button>
              {showTagsDropdown && (
                <div className="tags-dropdown">
                  <div className="tags-grid">
                    {selectedCategory 
                      ? CATEGORIES[selectedCategory].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            className={`tag-button ${selectedSubcategories.includes(tag) ? 'active' : ''}`}
                            onClick={() => handleCategorySelect(selectedCategory, tag)}
                          >
                            {tag}
                          </button>
                        ))
                      : Object.values(CATEGORIES).flat().map(tag => (
                          <button
                            key={tag}
                            type="button"
                            className={`tag-button ${selectedSubcategories.includes(tag) ? 'active' : ''}`}
                            onClick={() => handleCategorySelect(null, tag)}
                          >
                            {tag}
                          </button>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedSubcategories.length > 0 && (
          <div className="selected-tags">
            {selectedSubcategories.map(tag => (
              <span key={tag} className="selected-tag">
                {tag}
                <button onClick={() => handleCategorySelect(selectedCategory, tag)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="clubs-grid">
        {displayedClubs.map((club, index) => {
          const mainCategory = getMainCategory(club.tags);
          
          return (
            <div 
              key={index}
              className={`club-card ${club.is_user_created ? 'user-created' : ''}`}
              data-category={mainCategory}
            >
              {club.is_user_created && (
                <div className="user-created-badge">
                  <span className="badge-icon">👤</span>
                  User Created
                </div>
              )}
              <img 
                src={club.image || club.logo_url || club.image_url || `https://source.unsplash.com/800x600/?${club.tags?.[0]?.split(':')[1]?.toLowerCase() || 'club'}`} 
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
              
              <div className="club-details">
                <div className="detail-row">
                  <span className="detail-label">Experience:</span>
                  <span className="badge badge-success">Beginner Friendly</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Commitment:</span>
                  <span className="badge badge-neutral">Low (1-2 hrs/week)</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Application:</span>
                  <span className="badge badge-info">Open to Join</span>
                </div>
              </div>

              <div className="club-tags">
                {club.tags.map((tag, index) => (
                  <span key={index} className={`badge ${tag.replace(':', '-')}`}>
                    {tag.split(':')[1]}
                  </span>
                ))}
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