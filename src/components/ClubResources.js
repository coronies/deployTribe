import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaBook, FaDownload, FaExternalLinkAlt, FaFileAlt, FaVideo, FaLink, FaFile } from 'react-icons/fa';
import '../styles/ClubResources.css';

// Sample resources data (in a real app, this would come from an API)
const sampleResources = [
    {
      id: 1,
      title: 'React Development Guide',
      description: 'Comprehensive guide to modern React development patterns and best practices.',
      category: 'Documentation',
      type: 'document',
      url: '#',
      date: '2024-01-15',
      author: 'Tech Team'
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals Video Series',
      description: 'Learn the fundamentals of JavaScript with this comprehensive video series.',
      category: 'Tutorial',
      type: 'video',
      url: '#',
      date: '2024-01-10',
      author: 'Education Committee'
    },
    {
      id: 3,
      title: 'Club Meeting Minutes - December 2023',
      description: 'Official meeting minutes from our December 2023 gathering.',
      category: 'Meeting Notes',
      type: 'document',
      url: '#',
      date: '2023-12-20',
      author: 'Secretary'
    },
    {
      id: 4,
      title: 'Project Ideas Repository',
      description: 'Collection of project ideas for beginners and advanced developers.',
      category: 'Projects',
      type: 'link',
      url: '#',
      date: '2024-01-05',
      author: 'Project Team'
    },
    {
      id: 5,
      title: 'Coding Style Guide',
      description: 'Our club\'s official coding standards and style guidelines.',
      category: 'Documentation',
      type: 'document',
      url: '#',
      date: '2023-11-30',
      author: 'Standards Committee'
    }
  ];

const ClubResources = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchResources = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from an API based on clubId
        setTimeout(() => {
          setResources(sampleResources);
          setFilteredResources(sampleResources);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setLoading(false);
      }
    };

    fetchResources();
  }, [clubId]);

  useEffect(() => {
    let filtered = resources;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(resource => resource.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  }, [resources, categoryFilter, searchTerm]);

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <FaVideo />;
      case 'document':
        return <FaFileAlt />;
      case 'link':
        return <FaLink />;
      default:
        return <FaFile />;
    }
  };

  const categories = ['all', ...new Set(resources.map(r => r.category))];

  if (loading) {
    return (
      <div className="club-resources-container">
        <div className="loading-state">
          <FaBook className="loading-icon" />
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="club-resources-container">
      {/* Header Section */}
      <div className="resources-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft />
          <span>Back to Club</span>
        </button>
        
        <div className="header-content">
          <h1>
            <FaBook />
            Club Resources
          </h1>
          <p>Access learning materials, documentation, and shared resources</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="resources-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`category-btn ${categoryFilter === category ? 'active' : ''}`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.length > 0 ? (
          filteredResources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-header">
                <div className="resource-icon">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="resource-info">
                  <h3 className="resource-title">{resource.title}</h3>
                  <p className="resource-description">{resource.description}</p>
                </div>
              </div>
              
              <div className="resource-meta">
                <span className="resource-category">{resource.category}</span>
                <span className="resource-date">{new Date(resource.date).toLocaleDateString()}</span>
                <span className="resource-author">by {resource.author}</span>
              </div>

              <div className="resource-actions">
                <button className="view-btn" onClick={() => window.open(resource.url, '_blank')}>
                  <FaExternalLinkAlt />
                  View
                </button>
                {resource.type === 'document' && (
                  <button className="download-btn">
                    <FaDownload />
                    Download
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="resources-empty">
            <FaBook />
            <h3>No resources found</h3>
            <p>
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No resources have been added to this club yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubResources; 