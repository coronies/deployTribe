import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiSettings, FiBook, FiCalendar, FiLogOut, FiPlus, FiEdit } from 'react-icons/fi';
import '../styles/Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const createMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Load profile image from localStorage
  useEffect(() => {
    if (currentUser) {
      const profileKey = `profile_image_${currentUser.uid}`;
      const localProfileImage = localStorage.getItem(profileKey);
      setProfileImage(localProfileImage || currentUser.photoURL || null);
    } else {
      setProfileImage(null);
    }
  }, [currentUser]);

  // Listen for custom profile image update events (same page)
  useEffect(() => {
    const handleProfileImageUpdate = () => {
      if (currentUser) {
        const profileKey = `profile_image_${currentUser.uid}`;
        const localProfileImage = localStorage.getItem(profileKey);
        setProfileImage(localProfileImage || currentUser.photoURL || null);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
    return () => window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
  }, [currentUser]);

  // Listen for storage changes to update profile image across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (currentUser && e.key === `profile_image_${currentUser.uid}`) {
        setProfileImage(e.newValue || currentUser.photoURL || null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setShowDropdown(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleCreateClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/login', { state: { from: window.location.pathname, message: 'Please log in to create content' } });
    } else {
      setShowCreateMenu(!showCreateMenu);
    }
  };

  const getUserInitial = () => {
    if (!currentUser) return '?';
    if (currentUser.displayName) return currentUser.displayName[0].toUpperCase();
    if (currentUser.email) return currentUser.email[0].toUpperCase();
    return '?';
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src="/tribe-logo.svg" alt="Tribe" className="logo-image" />
          <span className="logo-text">Tribe</span>
        </Link>

        <nav className="nav-links">
          <Link to="/clubs">Explore Clubs</Link>
          <Link to="/events">Events</Link>
          <Link to="/opportunities">Opportunities</Link>
          <Link to="/assistant">Personal Assistant</Link>
          
          <div className="create-menu-wrapper" ref={createMenuRef}>
            <button 
              className="create-button"
              onClick={handleCreateClick}
              aria-expanded={showCreateMenu}
            >
              <FiPlus /> Create
            </button>
            {showCreateMenu && currentUser && (
              <div className="create-dropdown">
                <Link to="/manage/opportunities/create" onClick={() => setShowCreateMenu(false)}>
                  <span className="icon">✨</span>
                  Create Opportunity
                </Link>
                <Link to="/manage/events/create" onClick={() => setShowCreateMenu(false)}>
                  <span className="icon">🎉</span>
                  Create Event
                </Link>
              </div>
            )}
          </div>

          <Link to="/quiz">Take Quiz</Link>
          <Link to="/why-tribe">Why Tribe</Link>
          {currentUser && <Link to="/student-dashboard">Dashboard</Link>}
        </nav>

        <div className="user-section">
          {currentUser ? (
            <div className="user-menu" ref={profileMenuRef}>
              <button 
                className="profile-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="profile-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="profile-initial">
                    {getUserInitial()}
                  </div>
                )}
              </button>
              
              <div className={`dropdown-menu ${showDropdown ? 'active' : ''}`}>
                <Link to="/profile" onClick={() => setShowDropdown(false)}>
                  <FiUser /> Profile Settings
                </Link>
                <Link to="/my-clubs" onClick={() => setShowDropdown(false)}>
                  <FiBook /> My Clubs
                </Link>
                <Link to="/my-events" onClick={() => setShowDropdown(false)}>
                  <FiCalendar /> My Events
                </Link>
                <Link to="/club-setup" onClick={() => setShowDropdown(false)}>
                  <FiEdit /> Club Settings
                </Link>
                <Link to="/settings" onClick={() => setShowDropdown(false)}>
                  <FiSettings /> Account Settings
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">Login</Link>
              <Link to="/register" className="register-button">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 