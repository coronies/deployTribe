import React, { useState, useEffect } from 'react';
import { fetchOpportunities, searchOpportunities } from '../services/opportunityService';
import '../styles/Opportunities.css';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'All',
    compensation: 'All',
    category: 'All'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await fetchOpportunities(filters);
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
  }, [filters]);

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

  return (
    <div className="opportunities-container">
      <h1>Discover Opportunities</h1>
      
      <div className="search-bar">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="All">All</option>
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

        <div className="filter-group">
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="All">All</option>
            <option value="Research">Research</option>
            <option value="Marketing">Marketing</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
          </select>
        </div>
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