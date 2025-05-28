import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDocs } from 'firebase/firestore';
import { sampleClubs } from '../data/sampleClubs';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaDiscord, FaSlack, FaChevronDown, FaTimes } from 'react-icons/fa';
import { getPersonalizedRecommendations } from '../services/recommendationService';
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
  const levelLower = level.toLowerCase();
  return `value-button experience-${levelLower}`;
};

const getCommitmentClass = (level) => {
  const levelLower = level.toLowerCase();
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

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        // For development, using sample data
        const clubs = sampleClubs.map(club => ({
          ...club,
          image: `https://source.unsplash.com/800x600/?${club.tags[0].split(':')[1].toLowerCase()}`
        }));
        setClubs(clubs);

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

      const applicationData = {
        userId: currentUser.uid,
        clubId: clubId,
        status: 'PENDING',
        appliedDate: new Date().toISOString(),
        studentName: currentUser.displayName || currentUser.email,
        clubName: clubs.find(club => club.id === clubId)?.name
      };

      const applicationRef = await addDoc(collection(db, 'applications'), applicationData);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        applications: arrayUnion({
          applicationId: applicationRef.id,
          clubId: clubId,
          status: 'PENDING',
          appliedDate: applicationData.appliedDate
        })
      });

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

  const closeModal = () => {
    setActiveModal(null);
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedSubcategories.length === 0) return true;

    return club.tags.some(tag => {
      const [category, value] = tag.split(':');
      return selectedSubcategories.includes(value);
    });
  });

  const displayedClubs = showRecommendations ? recommendedClubs : filteredClubs;

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
              <button
                className={`category-main recommendation-toggle ${showRecommendations ? 'active' : ''}`}
                onClick={() => setShowRecommendations(!showRecommendations)}
                disabled={loadingRecommendations}
              >
                {loadingRecommendations ? 'Loading...' : 'Show Recommendations'}
              </button>
            )}
            {Object.entries(CATEGORIES).map(([category, subcategories]) => (
              <div key={category} className="category-group" data-category={category}>
                <button 
                  className={`category-main ${activeModal === category ? 'active' : ''}`}
                  data-category={category}
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
        {displayedClubs.map(club => (
          <div 
            key={club.id} 
            className="club-card"
            data-category={club.tags[0].split(':')[0]}
          >
            <img src={club.image} alt={club.name} className="club-image" />
            {showRecommendations && (
              <div className="recommended-badge">
                {Math.round(club.score * 100)}% Match
              </div>
            )}
            <div className="club-header">
              <h2>{club.name}</h2>
            </div>
            <p className="club-description">{club.description}</p>
            <div className="club-info">
              <div className="info-row">
                <span className="info-label">Experience:</span>
                <span className={getExperienceClass(club.experienceLevel)}>
                  {club.experienceLevel}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Commitment:</span>
                <span className={getCommitmentClass(club.commitmentLevel)}>
                  {club.commitmentLevel}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Application:</span>
                <span className={`application-status ${club.applicationRequired ? 'application-based' : 'open'}`}>
                  {club.applicationRequired ? 'Application Required' : 'Open to Join'}
                </span>
              </div>
            </div>
            <div className="club-tags">
              {club.tags.map((tag, index) => {
                const [category, value] = tag.split(':');
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
              {club.socialLinks.github && (
                <a href={club.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                  <FaGithub />
                </a>
              )}
              {club.socialLinks.linkedin && (
                <a href={club.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                  <FaLinkedin />
                </a>
              )}
              {club.socialLinks.twitter && (
                <a href={club.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                  <FaTwitter />
                </a>
              )}
              {club.socialLinks.instagram && (
                <a href={club.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <FaInstagram />
                </a>
              )}
              {club.socialLinks.discord && (
                <a href={club.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="social-link discord">
                  <FaDiscord />
                </a>
              )}
              {club.socialLinks.slack && (
                <a href={club.socialLinks.slack} target="_blank" rel="noopener noreferrer" className="social-link slack">
                  <FaSlack />
                </a>
              )}
            </div>
            <div className="button-group">
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
        ))}
      </div>
    </div>
  );
};

export default Clubs; 