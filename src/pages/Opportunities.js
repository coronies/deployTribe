import React, { useState, useEffect } from 'react';
import { fetchOpportunities, searchOpportunities } from '../services/opportunityService';
import { getPersonalizedRecommendations } from '../utils/recommendations';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiFilter, FiX, FiStar } from 'react-icons/fi';
import '../styles/Opportunities.css';

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

const ALL_TAGS = Object.values(CATEGORIES).reduce((acc, category) => {
  return [...acc, ...category.subtags];
}, []);

const Opportunities = () => {
  const { currentUser } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'All',
    compensation: 'All',
    category: 'All',
    subcategory: 'All'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubtags, setSelectedSubtags] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      let data;
      
      if (showRecommendations && currentUser) {
        data = await getPersonalizedRecommendations(currentUser.uid, 'opportunity', 10);
      } else {
        data = await fetchOpportunities(filters);
      }

      // Apply category and subtag filters
      if (selectedCategory || selectedSubtags.length > 0) {
        data = data.filter(opp => {
          const oppTags = opp.tags.map(tag => tag.toLowerCase());
          
          if (selectedCategory && !oppTags.some(tag => 
            CATEGORIES[selectedCategory].subtags
              .map(st => st.toLowerCase())
              .includes(tag)
          )) {
            return false;
          }

          if (selectedSubtags.length > 0 && !selectedSubtags.some(st => 
            oppTags.includes(st.toLowerCase())
          )) {
            return false;
          }

          return true;
        });
      }

      setOpportunities(data);
      setError(null);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchOpportunities(searchTerm);
      setOpportunities(results);
      setError(null);
    } catch (err) {
      console.error('Error searching opportunities:', err);
      setError('Failed to search opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [filters, showRecommendations, selectedCategory, selectedSubtags]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      loadOpportunities();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleSearch();
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  const handleTagSelect = (tag) => {
    setSelectedSubtags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const clearFilters = () => {
    setFilters({
      type: 'All',
      compensation: 'All',
      category: 'All',
      subcategory: 'All'
    });
    setSelectedCategory(null);
    setSelectedSubtags([]);
    setShowRecommendations(false);
  };

  return (
    <div className="opportunities-container">
      <h1>Discover Opportunities</h1>
      
      <div className="search-section">
        <div className="search-container">
          <div className="search-wrapper">
            <form onSubmit={handleSearchSubmit} className="search-bar">
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    className="clear-search" 
                    onClick={() => {
                      setSearchTerm('');
                      loadOpportunities();
                    }}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </form>
          </div>
          {currentUser && (
            <button 
              className={`recommendation-button ${showRecommendations ? 'active' : ''}`}
              onClick={() => setShowRecommendations(!showRecommendations)}
            >
              <FiStar />
              {showRecommendations ? 'Show All' : 'Show Recommended'}
            </button>
          )}
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <div className="filters-row">
            <button 
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubtags([]);
              }}
            >
              All
            </button>
            {Object.entries(CATEGORIES).map(([category, { label }]) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-content">
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Remote">Remote</option>
              <option value="In-person">In-person</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Compensation</label>
            <select
              value={filters.compensation}
              onChange={(e) => handleFilterChange('compensation', e.target.value)}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
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
                {selectedSubtags.length > 0 ? `${selectedSubtags.length} selected` : 'Select Tags'}
              </button>
              {showTagsDropdown && (
                <div className="tags-dropdown">
                  <div className="tags-grid">
                    {selectedCategory 
                      ? CATEGORIES[selectedCategory].subtags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            className={`tag-button ${selectedSubtags.includes(tag) ? 'active' : ''}`}
                            onClick={() => handleTagSelect(tag)}
                          >
                            {tag}
                          </button>
                        ))
                      : ALL_TAGS.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            className={`tag-button ${selectedSubtags.includes(tag) ? 'active' : ''}`}
                            onClick={() => handleTagSelect(tag)}
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

        {selectedSubtags.length > 0 && (
          <div className="selected-tags">
            {selectedSubtags.map(tag => (
              <span key={tag} className="selected-tag">
                {tag}
                <button onClick={() => handleTagSelect(tag)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading opportunities...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : opportunities.length === 0 ? (
        <div className="no-results">
          <p>No opportunities found</p>
          <p>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="opportunity-card">
              <h3>{opportunity.title}</h3>
              <p className="organization">{opportunity.organization}</p>
              <p className="description">{opportunity.description}</p>
              <div className="details">
                <span className="location">📍 {opportunity.location}</span>
                <span className="type">💼 {opportunity.mode}</span>
                <span className="compensation">💰 {opportunity.compensationType}</span>
              </div>
              <div className="tags">
                {opportunity.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              <div className="deadline">
                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
              </div>
              <a 
                href={opportunity.applicationLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="apply-button"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities; 