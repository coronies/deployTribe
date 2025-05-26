import React from 'react';
import '../styles/OpportunityCard.css';

const OpportunityCard = ({ 
  title,
  organization,
  organizationLogo,
  tags,
  description,
  deadline,
  location,
  compensation,
  creditInfo,
  commitment,
  requiredSkills,
  applicantCount,
  accessibilityInfo,
  ctaText = "Learn More",
  ctaLink,
  mode // 'in-person', 'virtual', or 'hybrid'
}) => {
  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'virtual':
        return '🖥️';
      case 'hybrid':
        return '🔄';
      default:
        return '📍';
    }
  };

  return (
    <article className="opportunity-card">
      <div className="opportunity-card__header">
        {organizationLogo && (
          <img 
            src={organizationLogo} 
            alt={`${organization} logo`} 
            className="opportunity-card__logo"
          />
        )}
        <div className="opportunity-card__org-info">
          <h3 className="opportunity-card__title">{title}</h3>
          <p className="opportunity-card__organization">{organization}</p>
        </div>
      </div>

      <div className="opportunity-card__tags">
        {tags?.slice(0, 5).map((tag, index) => (
          <span key={index} className="opportunity-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <p className="opportunity-card__description">{description}</p>

      <div className="opportunity-card__details">
        {deadline && (
          <div className="opportunity-card__detail-item">
            <span className="icon">⏰</span>
            <span>Deadline: {deadline}</span>
          </div>
        )}
        
        {location && (
          <div className="opportunity-card__detail-item">
            <span className="icon">{getModeIcon(mode)}</span>
            <span>{location}</span>
          </div>
        )}

        {compensation && (
          <div className="opportunity-card__detail-item">
            <span className="icon">💰</span>
            <span>{compensation}</span>
          </div>
        )}

        {commitment && (
          <div className="opportunity-card__detail-item">
            <span className="icon">⏱️</span>
            <span>{commitment}</span>
          </div>
        )}
      </div>

      {requiredSkills && requiredSkills.length > 0 && (
        <div className="opportunity-card__skills">
          <h4>Required Skills:</h4>
          <div className="skills-list">
            {requiredSkills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="opportunity-card__footer">
        {applicantCount !== undefined && (
          <span className="opportunity-card__metrics">
            {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
          </span>
        )}
        
        {accessibilityInfo && (
          <div className="opportunity-card__accessibility">
            {accessibilityInfo.map((info, index) => (
              <span key={index} className="accessibility-tag" title={info}>
                ♿
              </span>
            ))}
          </div>
        )}

        <a 
          href={ctaLink} 
          className="opportunity-card__cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          {ctaText}
        </a>
      </div>
    </article>
  );
};

export default OpportunityCard; 