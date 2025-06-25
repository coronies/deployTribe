import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaUsers, FaUserCheck, FaClock, FaGraduationCap, FaFilter } from 'react-icons/fa';
import MemberCard from './MemberCard';
import { getClubMembers } from '../services/memberService';
import '../styles/ClubMembers.css';

const ClubMembers = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const memberData = await getClubMembers(clubId);
        setMembers(memberData);
        setFilteredMembers(memberData);
      } catch (err) {
        setError('Failed to load members');
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [clubId]);

  useEffect(() => {
    let filtered = members;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [members, statusFilter, searchTerm]);

  const getStatusCounts = () => {
    const counts = {
      all: members.length,
      active: members.filter(m => m.status === 'active').length,
      inactive: members.filter(m => m.status === 'inactive').length,
      alumni: members.filter(m => m.status === 'alumni').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="club-members-container">
        <div className="loading-state">
          <FaUsers className="loading-icon" />
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-members-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="club-members-container">
      {/* Header Section */}
      <div className="club-members-header">
        <div className="header-top">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FaArrowLeft />
            <span>Back to My Clubs</span>
          </button>
          
          <div className="club-info">
            <h1 className="page-title">
              <FaUsers className="title-icon" />
              Software Development Club Members
            </h1>
            <p className="club-description">
              Connect with fellow developers, share knowledge, and collaborate on projects
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="members-stats">
          <div className="stat-card total">
            <FaUsers className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">{statusCounts.all}</span>
              <span className="stat-label">Total Members</span>
            </div>
          </div>
          <div className="stat-card active">
            <FaUserCheck className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">{statusCounts.active}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          <div className="stat-card inactive">
            <FaClock className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">{statusCounts.inactive}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>
          <div className="stat-card alumni">
            <FaGraduationCap className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">{statusCounts.alumni}</span>
              <span className="stat-label">Alumni</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search members by name or major..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="status-filters">
          <div className="filter-header">
            <FaFilter className="filter-icon" />
            <span>Filter by Status:</span>
          </div>
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'active', label: 'Active', count: statusCounts.active },
              { key: 'inactive', label: 'Inactive', count: statusCounts.inactive },
              { key: 'alumni', label: 'Alumni', count: statusCounts.alumni }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`filter-tab ${statusFilter === filter.key ? 'active' : ''}`}
              >
                {filter.label}
                <span className="filter-count">({filter.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> members
          {statusFilter !== 'all' && ` in "${statusFilter}" status`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Members Grid */}
      <div className="members-grid">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))
        ) : (
          <div className="no-members">
            <FaUsers className="no-members-icon" />
            <h3>No members found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'This club doesn\'t have any members yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubMembers; 