import React from 'react';
import { FaUserCheck, FaClock, FaGraduationCap, FaEnvelope, FaLinkedin, FaGithub, FaTwitter, FaUser } from 'react-icons/fa';
import '../styles/MemberCard.css';

const MemberCard = ({ member }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaUserCheck />;
      case 'inactive':
        return <FaClock />;
      case 'alumni':
        return <FaGraduationCap />;
      default:
        return <FaUser />;
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin />;
      case 'github':
        return <FaGithub />;
      case 'twitter':
        return <FaTwitter />;
      default:
        return <FaUser />;
    }
  };

  return (
    <div className="member-card">
      {/* Status Badge */}
      <div className="member-status">
        <div className={`member-status-badge status-${member.status}`}>
          {getStatusIcon(member.status)}
          <span>{member.status}</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="member-card-header">
        <div className="member-avatar">
          {member.profileImage ? (
            <img 
              src={member.profileImage} 
              alt={member.fullName}
              className="member-profile-image"
            />
          ) : (
            <div className="member-initials">
              {getInitials(member.fullName)}
            </div>
          )}
        </div>

        <div className="member-info">
          <div className="member-name-row">
            <h3 className="member-name">{member.fullName}</h3>
          </div>
          
          <div className="member-major-row">
            <p className="member-major-year">
              {member.major} • {member.year}
            </p>
          </div>
          
          <div className="member-since-row">
            <span className="member-since">
              Member since {formatJoinDate(member.joinDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="member-bio">
        <p>{member.bio || 'No bio provided'}</p>
      </div>

      {/* Footer Section */}
      <div className="member-footer">
        {/* Social Links */}
        {member.socialLinks && member.socialLinks.length > 0 && (
          <div className="member-social-row">
            <div className="member-social-links">
              {member.socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="member-social-link"
                  title={social.platform}
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
            <span className="social-count">
              {member.socialLinks.length} link{member.socialLinks.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="member-actions">
          {member.email && (
            <button 
              className="member-action-btn contact-btn"
              onClick={() => window.open(`mailto:${member.email}`, '_blank')}
              title="Send Email"
            >
              <FaEnvelope />
              Contact
            </button>
          )}
          
          {member.resumeUrl && (
            <button 
              className="member-action-btn resume-btn"
              onClick={() => window.open(member.resumeUrl, '_blank')}
              title="View Resume"
            >
              <FaUser />
              Resume
            </button>
          )}
          
          <button 
            className="member-action-btn profile-btn"
            onClick={() => {/* Navigate to member profile */}}
            title="View Full Profile"
          >
            <FaUser />
            Profile
          </button>
        </div>

        {/* Profile Completion Badge */}
        {member.profileComplete && (
          <div className="profile-complete-badge">
            <FaUserCheck />
            Profile Complete
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard; 