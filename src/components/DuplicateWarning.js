import React from 'react';
import { FiAlertTriangle, FiLink } from 'react-icons/fi';

const DuplicateWarning = ({ duplicates, type, onContinue, onCancel }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="duplicate-warning">
      <div className="duplicate-warning-header">
        <FiAlertTriangle className="warning-icon" />
        <h3>Duplicate {type} Link Detected</h3>
      </div>
      
      <p className="warning-message">
        We found {duplicates.length} existing {duplicates.length === 1 ? type.toLowerCase() : `${type.toLowerCase()}s`} with the same registration/application link:
      </p>

      <div className="duplicate-list">
        {duplicates.map((item) => (
          <div key={item.id} className="duplicate-item">
            <div className="duplicate-item-header">
              <h4>{item.title}</h4>
              <div className="duplicate-badges">
                <span className="duplicate-link-badge">
                  <FiLink /> Matching Link
                </span>
              </div>
            </div>
            <div className="duplicate-item-details">
              <p><strong>Organization:</strong> {item.organization}</p>
              {type === 'Event' ? (
                <>
                  <p><strong>Date:</strong> {new Date(item.startDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {item.startTime}</p>
                  <p><strong>Registration Link:</strong> {item.registrationLink}</p>
                </>
              ) : (
                <>
                  <p><strong>Deadline:</strong> {new Date(item.deadline).toLocaleDateString()}</p>
                  <p><strong>Application Link:</strong> {item.ctaLink}</p>
                </>
              )}
              <p><strong>Location:</strong> {item.location}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="warning-info">
        <FiAlertTriangle className="info-icon" />
        <p>
          Creating duplicate listings for the same {type.toLowerCase()} is not allowed. 
          If this is a different {type.toLowerCase()}, please use a different registration/application link.
        </p>
      </div>

      <div className="duplicate-actions">
        <button 
          type="button" 
          className="cancel-button"
          onClick={onCancel}
        >
          Edit Link
        </button>
        <button 
          type="button" 
          className="continue-button"
          onClick={onContinue}
        >
          Continue Anyway
        </button>
      </div>

      <style jsx>{`
        .duplicate-warning {
          background: #fff5f5;
          border: 1px solid #fc8181;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .duplicate-warning-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .warning-icon {
          color: #e53e3e;
          font-size: 1.5rem;
        }

        .duplicate-warning-header h3 {
          color: #c53030;
          margin: 0;
          font-size: 1.25rem;
        }

        .warning-message {
          color: #2d3748;
          margin: 0 0 1rem 0;
        }

        .duplicate-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .duplicate-item {
          background: white;
          border: 1px solid #fc8181;
          border-radius: 6px;
          padding: 1rem;
        }

        .duplicate-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .duplicate-item-header h4 {
          margin: 0;
          color: #2d3748;
          font-size: 1rem;
        }

        .duplicate-badges {
          display: flex;
          gap: 0.5rem;
        }

        .duplicate-link-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #fed7d7;
          color: #c53030;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .duplicate-item-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .duplicate-item-details p {
          margin: 0;
          font-size: 0.875rem;
          color: #4a5568;
        }

        .warning-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: #fff5f5;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .info-icon {
          color: #e53e3e;
          font-size: 1.25rem;
          margin-top: 0.125rem;
        }

        .warning-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #c53030;
        }

        .duplicate-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .cancel-button,
        .continue-button {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-button {
          background: white;
          border: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .cancel-button:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .continue-button {
          background: #e53e3e;
          color: white;
          border: none;
        }

        .continue-button:hover {
          background: #c53030;
        }
      `}</style>
    </div>
  );
};

export default DuplicateWarning; 