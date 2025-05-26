import React from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import RecommendationsList from './RecommendationsList';
import { FiRefreshCw } from 'react-icons/fi';

const SimilarItems = ({ currentItem, type }) => {
  const { recommendations, loading, error } = useRecommendations(
    null, // No userId needed for similar items
    currentItem,
    type
  );

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="similar-items">
      <h3>Similar {type === 'opportunity' ? 'Opportunities' : 'Events'}</h3>
      
      {loading ? (
        <div className="loading-state">
          <FiRefreshCw className="spinning" />
          <p>Finding similar items...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : (
        <RecommendationsList recommendations={recommendations} type={type} />
      )}

      <style jsx>{`
        .similar-items {
          margin: 3rem 0;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        h3 {
          margin: 0 0 1.5rem 0;
          color: #2d3748;
          font-size: 1.25rem;
        }

        .loading-state {
          text-align: center;
          padding: 2rem;
          color: #4a5568;
        }

        .loading-state .spinning {
          animation: spin 1s linear infinite;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #4299e1;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }

        .error-state {
          text-align: center;
          padding: 1rem;
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
};

export default SimilarItems; 