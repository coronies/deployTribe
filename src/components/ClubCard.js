import React from 'react';
import { Link } from 'react-router-dom';

function ClubCard({ club, isRecommended = false }) {
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
            src={club.logo} 
            alt={`${club.name} logo`}
            style={{ width: '60px', height: '60px' }}
          />
          <h2 style={{ margin: 0 }}>{club.name}</h2>
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
        margin: '15px 0'
      }}>
        {club.tags.map((tag, index) => (
          <span key={index} style={{
            backgroundColor: '#E9ECF0',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '14px'
          }}>
            {tag}
          </span>
        ))}
      </div>

      <p>{club.overview}</p>

      {club.stats && (
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '15px'
        }}>
          {/* Add your pie charts or stats visualization here */}
        </div>
      )}

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