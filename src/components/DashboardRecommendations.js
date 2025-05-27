import React, { useState } from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import RecommendationsList from './RecommendationsList';
import { FiRefreshCw } from 'react-icons/fi';

const DashboardRecommendations = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const { recommendations, loading, error } = useRecommendations(
    userId,
    null,
    activeTab === 'opportunities' ? 'opportunity' : 'event'
  );

  return (
    <div className="dashboard-recommendations">
      <div className="recommendations-header">
        <h2>Recommended For You</h2>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            Opportunities
          </button>
          <button
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <FiRefreshCw className="spinning" />
          <p>Finding the best matches for you...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : (
        <RecommendationsList
          recommendations={recommendations}
          type={activeTab === 'opportunities' ? 'opportunity' : 'event'}
        />
      )}

      <style jsx>{`
        .dashboard-recommendations {
          padding: 2rem;
          background: #f7fafc;
          border-radius: 12px;
          margin: 2rem 0;
        }

        .recommendations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .recommendations-header h2 {
          margin: 0;
          color: #2d3748;
          font-size: 1.5rem;
        }

        .tab-buttons {
          display: flex;
          gap: 1rem;
        }

        .tab-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #edf2f7;
          color: #4a5568;
        }

        .tab-button.active {
          background: #4299e1;
          color: white;
        }

        .tab-button:hover:not(.active) {
          background: #e2e8f0;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #4a5568;
        }

        .loading-state .spinning {
          animation: spin 1s linear infinite;
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #4299e1;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }

        .error-state {
          text-align: center;
          padding: 2rem;
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
};

export default DashboardRecommendations; 