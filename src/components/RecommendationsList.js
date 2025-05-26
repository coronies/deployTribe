import React from 'react';
import { FiStar, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';

const RecommendationsList = ({ recommendations, type }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="no-recommendations">
        <p>No recommendations available at this time.</p>
      </div>
    );
  }

  return (
    <div className="recommendations-list">
      {recommendations.map((item) => (
        <div key={item.id} className="recommendation-card">
          <div className="recommendation-header">
            <h3>{item.title}</h3>
            <div className="score-badge">
              <FiStar />
              <span>{Math.round(item.relevanceScore * 100)}% Match</span>
            </div>
          </div>

          <div className="recommendation-org">{item.organization}</div>

          <div className="recommendation-details">
            <div className="detail-item">
              <FiMapPin />
              <span>{item.location || 'Remote'}</span>
            </div>
            
            <div className="detail-item">
              <FiCalendar />
              <span>
                {type === 'event' 
                  ? new Date(item.startDate).toLocaleDateString()
                  : new Date(item.deadline).toLocaleDateString()
                }
              </span>
            </div>

            {type === 'event' && item.startTime && (
              <div className="detail-item">
                <FiClock />
                <span>{item.startTime}</span>
              </div>
            )}
          </div>

          <p className="recommendation-description">
            {item.description.length > 150 
              ? `${item.description.substring(0, 150)}...`
              : item.description
            }
          </p>

          <div className="recommendation-tags">
            {item.tags && item.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>

          <a 
            href={type === 'event' ? item.registrationLink : item.ctaLink}
            className="recommendation-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            {type === 'event' ? 'Register Now' : 'Apply Now'}
          </a>
        </div>
      ))}

      <style jsx>{`
        .recommendations-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
        }

        .recommendation-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .recommendation-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .recommendation-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: #2d3748;
          flex: 1;
          padding-right: 1rem;
        }

        .score-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #ebf8ff;
          color: #2b6cb0;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .recommendation-org {
          color: #4a5568;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .recommendation-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #718096;
          font-size: 0.875rem;
        }

        .recommendation-description {
          color: #4a5568;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .recommendation-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .tag {
          background: #f7fafc;
          color: #4a5568;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
        }

        .recommendation-cta {
          display: inline-block;
          background: #4299e1;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .recommendation-cta:hover {
          background: #3182ce;
        }

        .no-recommendations {
          text-align: center;
          padding: 2rem;
          color: #718096;
        }
      `}</style>
    </div>
  );
};

export default RecommendationsList; 