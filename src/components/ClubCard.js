import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaDiscord, FaSlack, FaGlobe } from 'react-icons/fa';

function ClubCard({ club, isRecommended = false }) {
  const [hoveredSocial, setHoveredSocial] = useState(null);
  
  // Debug: Log club data to see if social_links are present
  console.log('Club data:', club);
  console.log('Social links:', club.social_links);

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <FaGithub />;
      case 'linkedin':
        return <FaLinkedin />;
      case 'twitter':
        return <FaTwitter />;
      case 'instagram':
        return <FaInstagram />;
      case 'discord':
        return <FaDiscord />;
      case 'slack':
        return <FaSlack />;
      default:
        return <FaGlobe />;
    }
  };

  const getSocialColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return '#24292e';
      case 'linkedin':
        return '#0077b5';
      case 'twitter':
        return '#1da1f2';
      case 'instagram':
        return '#e4405f';
      case 'discord':
        return '#5865f2';
      case 'slack':
        return '#4a154b';
      default:
        return '#666';
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src={club.image} 
            alt={`${club.name}`}
            style={{ 
              width: '120px', 
              height: '120px', 
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
          <div>
            <h2 style={{ margin: 0, marginBottom: '8px' }}>{club.name}</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{club.description}</p>
          </div>
        </div>
        {isRecommended && (
          <div style={{
            backgroundColor: '#FFB703',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            Recommended
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        margin: '15px 0',
        flexWrap: 'wrap'
      }}>
        {club.tags.map((tag, index) => {
          const [category, value] = tag.split(':');
          let bgColor = '#E9ECF0';
          let textColor = '#333';
          
          switch(category) {
            case 'Technology':
              bgColor = '#EEF2FF';
              textColor = '#4361ee';
              break;
            case 'Business':
              bgColor = '#FEE2E2';
              textColor = '#e11d48';
              break;
            case 'Arts':
              bgColor = '#F3E8FF';
              textColor = '#9333ea';
              break;
            case 'Social':
              bgColor = '#DCFCE7';
              textColor = '#16a34a';
              break;
            case 'Skills':
              bgColor = '#E0F2FE';
              textColor = '#0891b2';
              break;
            default:
              break;
          }
          
          return (
            <span key={index} style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '14px'
            }}>
              {value}
            </span>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '15px',
        fontSize: '14px',
        color: '#666'
      }}>
        <div>
          <strong>Experience:</strong> {club.experience_level}
        </div>
        <div>
          <strong>Commitment:</strong> {club.commitment_level}
        </div>
        <div>
          <strong>Application:</strong> {club.application_required ? 'Required' : 'Open to Join'}
        </div>
      </div>

      {/* Social Media Links */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb', // Temporary background to make it visible
        padding: '10px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
          DEBUG INFO:
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Club name: {club.name}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Has social_links property: {club.social_links ? 'YES' : 'NO'}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Social links data: {JSON.stringify(club.social_links, null, 2)}
        </div>
        
        {/* Test Icons - Static */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px' }}>Test Icons:</span>
          <FaGithub style={{ fontSize: '20px', color: '#333' }} />
          <FaLinkedin style={{ fontSize: '20px', color: '#0077b5' }} />
          <FaTwitter style={{ fontSize: '20px', color: '#1da1f2' }} />
          <FaInstagram style={{ fontSize: '20px', color: '#e4405f' }} />
        </div>
        
        {/* Dynamic Social Links */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Follow us:</span>
          {club.social_links ? (
            Object.keys(club.social_links).length > 0 ? (
              Object.entries(club.social_links).map(([platform, url]) => {
                const isHovered = hoveredSocial === platform;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredSocial(platform)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isHovered ? getSocialColor(platform) : '#ffffff',
                      color: isHovered ? 'white' : getSocialColor(platform),
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      border: '2px solid #333',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : 'none'
                    }}
                    title={`Follow ${club.name} on ${platform}`}
                  >
                    {getSocialIcon(platform)}
                  </a>
                );
              })
            ) : (
              <span style={{ fontSize: '12px', color: '#f00' }}>
                Social links object exists but is empty
              </span>
            )
          ) : (
            <span style={{ fontSize: '12px', color: '#f00' }}>
              No social_links property found
            </span>
          )}
        </div>
      </div>

      <Link 
        to={`/club/${club.id}`}
        style={{
          display: 'inline-block',
          marginTop: '15px',
          color: '#015464',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        See more
      </Link>
    </div>
  );
}

export default ClubCard; 